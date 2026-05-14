import crypto from 'crypto'

const sessions = globalThis.__jtcSessions || new Map()
globalThis.__jtcSessions = sessions

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { password } = req.body || {}
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    return res.status(500).json({ error: 'Missing SITE_PASSWORD in Vercel environment variables.' })
  }

  if (!password || password !== sitePassword) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, { createdAt: Date.now() })
  return res.status(200).json({ token })
}
