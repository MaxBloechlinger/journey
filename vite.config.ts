import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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

            const apiKey = env.GROQ_API_KEY
            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'GROQ_API_KEY not set in .env.local' }))
              return
            }

            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', async () => {
              try {
                const { messages, systemPrompt, maxTokens = 1024 } = JSON.parse(body)

                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                      { role: 'system', content: systemPrompt },
                      ...messages,
                    ],
                    max_tokens: Math.min(Number(maxTokens), 2048),
                    stream: true,
                  }),
                })

                if (!groqRes.ok) {
                  const err = await groqRes.json().catch(() => null)
                  res.statusCode = groqRes.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: (err as any)?.error?.message ?? 'Groq API error' }))
                  return
                }

                res.setHeader('Content-Type', 'text/plain; charset=utf-8')

                const reader = (groqRes.body as any).getReader()
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
                    const data = line.slice(6).trim()
                    if (data === '[DONE]') continue
                    try {
                      const text = JSON.parse(data).choices?.[0]?.delta?.content
                      if (text) res.write(text)
                    } catch { /* skip malformed chunks */ }
                  }
                }

                res.end()
              } catch (err: any) {
                if (!res.headersSent) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err?.message ?? 'Server error' }))
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
