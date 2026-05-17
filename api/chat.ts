import { GoogleGenerativeAI } from '@google/generative-ai'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 15
const WINDOW_MS = 60 * 60 * 1000
const MAX_TOKENS_CAP = 2048

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= LIMIT) return false
  entry.count++
  return true
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    'unknown'

  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Rate limit reached — try again in an hour.' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' })
    return
  }

  const { messages, systemPrompt, maxTokens = 1024 } = req.body

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel(
      { model: 'gemini-1.5-flash', systemInstruction: systemPrompt },
      { apiVersion: 'v1' }
    )

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')

    const result = await model.generateContentStream({
      contents: geminiMessages,
      generationConfig: { maxOutputTokens: Math.min(Number(maxTokens), MAX_TOKENS_CAP) },
    })

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) res.write(text)
    }

    res.end()
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message ?? 'Gemini API error' })
    } else {
      res.end()
    }
  }
}
