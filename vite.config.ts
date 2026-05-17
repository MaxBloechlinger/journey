import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req: any, res: any, next: any) => {
            if (req.method !== 'POST') { next(); return }

            const apiKey = env.GEMINI_API_KEY
            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set in .env.local' }))
              return
            }

            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', async () => {
              try {
                const { messages, systemPrompt, maxTokens = 1024 } = JSON.parse(body)

                const genAI = new GoogleGenerativeAI(apiKey)
                const model = genAI.getGenerativeModel({
                  model: 'gemini-2.0-flash',
                  systemInstruction: systemPrompt,
                })

                const geminiMessages = messages.map((m: { role: string; content: string }) => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content }],
                }))

                res.setHeader('Content-Type', 'text/plain; charset=utf-8')

                const result = await model.generateContentStream({
                  contents: geminiMessages,
                  generationConfig: { maxOutputTokens: Math.min(Number(maxTokens), 2048) },
                })

                for await (const chunk of result.stream) {
                  const text = chunk.text()
                  if (text) res.write(text)
                }

                res.end()
              } catch (err: any) {
                if (!res.headersSent) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err?.message ?? 'Gemini API error' }))
                } else {
                  res.end()
                }
              }
            })
          })
        },
      },
    ],
  }
})
