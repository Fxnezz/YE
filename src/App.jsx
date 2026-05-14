import { useMemo, useState } from 'react'
import { jtcSystemPrompt } from './jtcPrompt'
import { login, sendChat } from './api'

const subjects = ['English', 'History', 'Geography', 'Science', 'Religious Education', 'Economics', 'Philosophy & Ethics']
const taskTypes = ['Analytical Essay', 'Persuasive Essay', 'Research Report', 'Source Analysis', 'Study Notes', 'Lab Report']
const models = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o']

const starterMessages = [
  {
    role: 'assistant',
    content: 'Welcome to the JTC Academic Writing Agent. Paste your assignment prompt and I will help draft a strong Year 9 response.',
  },
]

export default function App() {
  const [theme, setTheme] = useState('light')
  const [subject, setSubject] = useState('English')
  const [taskType, setTaskType] = useState('Analytical Essay')
  const [model, setModel] = useState(models[0])
  const [messages, setMessages] = useState(starterMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(sessionStorage.getItem('jtc_token') || '')
  const [authError, setAuthError] = useState('')

  const systemPreview = useMemo(() => `${jtcSystemPrompt}\n\nCurrent subject: ${subject}.\nCurrent task type: ${taskType}.`, [subject, taskType])

  async function handleLogin(e) {
    e.preventDefault()
    try {
      setAuthError('')
      const data = await login({ password })
      setToken(data.token)
      sessionStorage.setItem('jtc_token', data.token)
      setPassword('')
    } catch (err) {
      setAuthError(err.message || 'Login failed.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || !token || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const reply = await sendChat({ token, messages: updatedMessages, subject, taskType, model })
      setMessages((current) => [...current, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message || 'Could not get a response.')
    } finally {
      setLoading(false)
    }
  }

  function applyPrompt(prefix) {
    setInput((current) => `${prefix}: ${current}`.trim())
  }

  function logout() {
    sessionStorage.removeItem('jtc_token')
    setToken('')
    setMessages(starterMessages)
  }

  if (!token) {
    return (
      <div className="login-shell" data-theme={theme}>
        <div className="login-card">
          <div className="brand login-brand">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="JTC logo mark">
              <rect x="6" y="6" width="52" height="52" rx="16" fill="rgba(21,38,74,0.08)" stroke="rgba(21,38,74,0.12)"/>
              <path d="M21 20H43V24H34V45H30V24H21V20Z" fill="currentColor"/>
              <path d="M18 47C23 40.5 27.5 37.5 32 37.5C36.5 37.5 41 40.5 46 47" stroke="#C8A34D" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
            <div>
              <h1>JTC Academic Writing Agent</h1>
              <p>Private website for you and your mates.</p>
            </div>
          </div>
          <p className="login-text">Enter the shared site password to access the writing tool.</p>
          <form className="login-form" onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Site password" />
            <button type="submit" className="send-btn">Enter site</button>
          </form>
          {authError && <p className="error-text">{authError}</p>}
          <button type="button" className="icon-btn theme-float" onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="JTC logo mark">
            <rect x="6" y="6" width="52" height="52" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)"/>
            <path d="M21 20H43V24H34V45H30V24H21V20Z" fill="#F6F7FB"/>
            <path d="M18 47C23 40.5 27.5 37.5 32 37.5C36.5 37.5 41 40.5 46 47" stroke="#C8A34D" strokeWidth="3.5" strokeLinecap="round"/>
          </svg>
          <div>
            <h1>JTC Academic Writing Agent</h1>
            <p>Vercel-only website version.</p>
          </div>
        </div>

        <div className="sidebar-section">
          <label>Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div className="sidebar-section">
          <label>Task type</label>
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
            {taskTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div className="sidebar-section">
          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {models.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div className="sidebar-section">
          <p className="mini-title">Prompt helpers</p>
          <div className="chip-group">
            {['Use TEEL paragraphs', 'Add Harvard references', 'Strengthen the conclusion', 'Shorten to 700 words', 'Make tone more formal'].map((chip) => (
              <button key={chip} type="button" className="chip" onClick={() => applyPrompt(chip)}>{chip}</button>
            ))}
          </div>
        </div>

        <div className="sidebar-section note-box">
          <p className="mini-title">System prompt preview</p>
          <p>{systemPreview}</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h2>Academic chat workspace</h2>
            <p>Your API key stays in Vercel environment variables and requests run through Vercel serverless functions.</p>
          </div>
          <div className="top-actions">
            <button type="button" className="copy-btn" onClick={logout}>Log out</button>
            <button type="button" className="icon-btn" onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </header>

        <section className="chat-area">
          <article className="welcome-card">
            <h3>One-host setup</h3>
            <p>This version runs as a single Vercel project, so you do not need to pay for a separate backend host.</p>
          </article>

          {messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
              <div className="message-meta">
                <span>{message.role === 'assistant' ? 'JTC Agent' : 'Student'}</span>
                <button type="button" className="copy-btn" onClick={() => navigator.clipboard.writeText(message.content)}>Copy</button>
              </div>
              <p>{message.content}</p>
            </article>
          ))}

          {loading && (
            <article className="message assistant">
              <div className="message-meta"><span>JTC Agent</span><span>Thinking...</span></div>
              <p>Generating a response through Vercel.</p>
            </article>
          )}

          {error && (
            <article className="message error">
              <div className="message-meta"><span>Error</span></div>
              <p>{error}</p>
            </article>
          )}
        </section>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste the assignment prompt here." />
          <div className="composer-footer">
            <p>Set OPENAI_API_KEY and SITE_PASSWORD in Vercel project settings before using the live site.</p>
            <button type="submit" className="send-btn" disabled={loading || !input.trim()}>{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </form>
      </main>
    </div>
  )
}
