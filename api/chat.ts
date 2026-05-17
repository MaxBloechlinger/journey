export default function handler(_req: any, res: any) {
  res.status(503).json({ error: 'AI not configured.' })
}
