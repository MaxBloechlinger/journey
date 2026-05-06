import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { messages, systemPrompt } = req.body
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      res.write(event.delta.text)
    }
  }

  res.end()
}
