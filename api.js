export async function login({ password }) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'Login failed.')
  return data
}

export async function sendChat({ token, messages, subject, taskType, model }) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, subject, taskType, model }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'Chat request failed.')
  return data.reply
}
