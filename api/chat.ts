export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
  }

  const { messages, systemPrompt, maxTokens = 1024 } = req.body

  if (!Array.isArray(messages) || messages.length > 40) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const safeMaxTokens = Math.min(typeof maxTokens === 'number' ? maxTokens : 1024, 2048)

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: safeMaxTokens,
      stream: true,
    }),
  })

  if (!groqRes.ok) {
    const err = await groqRes.json().catch(() => ({})) as any
    return res.status(groqRes.status).json({ error: err.error?.message ?? `Groq error ${groqRes.status}` })
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')

  const reader = groqRes.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const text = parsed.choices?.[0]?.delta?.content
        if (text) res.write(text)
      } catch { /* ignore malformed SSE chunks */ }
    }
  }

  res.end()
}
