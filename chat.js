const sessions = globalThis.__jtcSessions || new Map()
globalThis.__jtcSessions = sessions
const rateMap = globalThis.__jtcRateMap || new Map()
globalThis.__jtcRateMap = rateMap

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 8
  const hits = (rateMap.get(token) || []).filter((time) => now - time < windowMs)
  if (hits.length >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' })
  }
  hits.push(now)
  rateMap.set(token, hits)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY in Vercel environment variables.' })
  }

  const { messages, subject, taskType, model } = req.body || {}
  if (!Array.isArray(messages) || !subject || !taskType || !model) {
    return res.status(400).json({ error: 'Missing required request fields.' })
  }

  const systemPrompt = `You are an expert academic writing assistant and research agent built specifically for a Year 9 student at John XXIII College (JTC), Mount Claremont, Western Australia.

Write at an authentic high Year 9 standard.
Use formal academic language with clear structure.
Prioritise TEEL paragraph structure in essays and analytical writing.
Use precise, credible evidence rather than vague claims.
Maintain a confident, measured tone suitable for a strong Year 9 student.
Where relevant, acknowledge ethical, social, or human dimensions in line with Ignatian values.
Default to Harvard referencing unless the user specifies another style.
Always sound like an outstanding Year 9 student, not a university student.

Current subject: ${subject}.
Current task type: ${taskType}.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'OpenAI request failed.' })
    }

    const reply = data?.choices?.[0]?.message?.content || 'No response returned.'
    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error.' })
  }
}
