import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { api, clearSession, getSession, setSession } from './api'
import { useCountdown } from './useCountdown'
import Background from './Background'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function Private({ children }) {
  return getSession() ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  const nav = useNavigate()
  const s = getSession()
  return (
    <>
      <Background />
      <header className="bar">
        <Link to="/" className="brand">Assess<em>Prep</em></Link>
        {s && (
          <span>
            {s.name}{' '}
            <button className="link" onClick={() => { clearSession(); nav('/login') }}>Log out</button>
          </span>
        )}
      </header>
      <main>{children}</main>
    </>
  )
}

function Auth() {
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = mode === 'login' ? await api.login({ email: form.email, password: form.password }) : await api.register(form)
      setSession(r)
      nav('/')
    } catch (err) {
      setError(/\((401|403)\)/.test(err.message) ? 'Invalid email or password' : err.message)
    } finally { setBusy(false) }
  }

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      {mode === 'register' && <input placeholder="Name" value={form.name} onChange={set('name')} required maxLength={100} />}
      <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
      <input type="password" placeholder="Password (8+ characters)" value={form.password} onChange={set('password')} required minLength={mode === 'register' ? 8 : 1} maxLength={72} />
      {error && <p className="err">{error}</p>}
      <button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}</button>
      <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
        {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
      </button>
    </form>
  )
}

function Dashboard() {
  const nav = useNavigate()
  const [cfg, setCfg] = useState({ topic: '', count: 10, durationMinutes: 15 })
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.history().then(setHistory).catch((e) => setError(e.message)) }, [])

  async function start(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await api.start({ topic: cfg.topic || null, count: Number(cfg.count), durationMinutes: Number(cfg.durationMinutes) })
      const expiresAt = Date.parse(r.expiresAt)
      // The server started the clock at expiresAt - duration. Comparing that with our own clock gives the offset to correct for.
      const offset = expiresAt - r.durationSeconds * 1000 - Date.now()
      sessionStorage.setItem(`attempt:${r.attemptId}`, JSON.stringify({ questions: r.questions, expiresAt, offset, answers: {} }))
      nav(`/test/${r.attemptId}`)
    } catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <>
      <h1 className="hello">Welcome back, <em>{getSession()?.name}</em></h1>
      <p className="mute" style={{ marginBottom: 20 }}>Pick a topic, set the clock, and the server keeps the time.</p>
      <form className="card" onSubmit={start}>
        <h2>Start a test</h2>
        <div className="row">
          <label>Topic
            <select value={cfg.topic} onChange={(e) => setCfg({ ...cfg, topic: e.target.value })}>
              <option value="">Any</option><option>JAVA</option><option>SQL</option><option>DSA</option><option>DBMS</option>
            </select>
          </label>
          <label>Questions
            <input type="number" min="1" max="30" value={cfg.count} onChange={(e) => setCfg({ ...cfg, count: e.target.value })} />
          </label>
          <label>Minutes
            <input type="number" min="1" max="180" value={cfg.durationMinutes} onChange={(e) => setCfg({ ...cfg, durationMinutes: e.target.value })} />
          </label>
        </div>
        {error && <p className="err">{error}</p>}
        <button disabled={busy}>{busy ? 'Starting…' : 'Start test'}</button>
      </form>

      <div className="card">
        <h2>Your attempts</h2>
        {history.length === 0 ? <p className="mute">No attempts yet.</p> : (
          <ul className="list">
            {history.map((h) => (
              <li key={h.attemptId}>
                <span>{new Date(h.startedAt).toLocaleString()}</span>
                <span className={`tag ${h.status}`}>{h.status}</span>
                <span>{h.score ?? '–'} / {h.total}</span>
                {h.status !== 'IN_PROGRESS' && <Link to={`/result/${h.attemptId}`}>View</Link>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function Test() {
  const { id } = useParams()
  const nav = useNavigate()
  const key = `attempt:${id}`
  const saved = JSON.parse(sessionStorage.getItem(key) || 'null')
  const [answers, setAnswers] = useState(saved?.answers || {})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const sent = useRef(false) // blocks a double submit (button click + auto-submit)
  const left = useCountdown(saved?.expiresAt, saved?.offset)

  const submit = useCallback(async () => {
    if (!saved || sent.current) return
    sent.current = true; setSubmitting(true); setError('')
    try {
      await api.submit(id, saved.questions.map((q) => ({ questionId: q.id, selected: answers[q.id] ?? null })))
      sessionStorage.removeItem(key)
      nav(`/result/${id}`)
    } catch (err) { sent.current = false; setSubmitting(false); setError(err.message) }
  }, [saved, answers, id, key, nav])

  useEffect(() => { if (saved && left === 0) submit() }, [left]) // auto-submit when the clock hits zero

  if (!saved) {
    return (
      <div className="card narrow">
        <p>This attempt can’t be resumed in this browser session.</p>
        <Link to={`/result/${id}`}>Check its result</Link> · <Link to="/">Back</Link>
      </div>
    )
  }

  const pick = (qid, opt) => {
    const next = { ...answers, [qid]: opt }
    setAnswers(next)
    sessionStorage.setItem(key, JSON.stringify({ ...saved, answers: next })) // survive a page refresh
  }
  const done = Object.keys(answers).length

  return (
    <>
      <div className={`timer ${left <= 60 ? 'danger' : left <= 300 ? 'warn' : ''}`}>
        <span>{fmt(left)}</span><small>{done} / {saved.questions.length} answered</small>
      </div>
      {saved.questions.map((q, i) => (
        <div className="card" key={q.id}>
          <p className="mute">{i + 1}. {q.topic} · {q.difficulty}</p>
          <p>{q.text}</p>
          {Object.entries(q.options).map(([k, v]) => (
            <label key={k} className={`opt ${answers[q.id] === k ? 'on' : ''}`}>
              <input type="radio" name={`q${q.id}`} checked={answers[q.id] === k} onChange={() => pick(q.id, k)} disabled={submitting} />
              <b>{k}</b> {v}
            </label>
          ))}
        </div>
      ))}
      {error && <p className="err">{error}</p>}
      <button onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit test'}</button>
    </>
  )
}

function Result() {
  const { id } = useParams()
  const [r, setR] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.result(id).then(setR).catch((e) => setError(e.message)) }, [id])

  if (error) return <p className="err">{error}</p>
  if (!r) return <p className="mute">Loading…</p>
  return (
    <>
      <div className="card center">
        <p className="mute">{r.status}</p>
        <h1>{r.score} / {r.total}</h1>
        <p>{r.percentage.toFixed(0)}%</p>
      </div>
      <div className="card">
        <h2>By topic</h2>
        {r.topicBreakdown.map((t) => (
          <div key={t.topic} className="bar-row">
            <span>{t.topic}</span>
            <div className="track"><div style={{ width: `${t.total ? (100 * t.correct) / t.total : 0}%` }} /></div>
            <span>{t.correct}/{t.total}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>Review</h2>
        {r.review.map((q) => (
          <div key={q.questionId} className={`rev ${q.correct ? 'ok' : 'bad'}`}>
            <p>{q.text}</p>
            <p className="mute">Your answer: {q.selected ?? '—'} · Correct: {q.correctOption}</p>
            {q.explanation && <p>{q.explanation}</p>}
          </div>
        ))}
      </div>
      <Link to="/">Back to dashboard</Link>
    </>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/test/:id" element={<Private><Test /></Private>} />
        <Route path="/result/:id" element={<Private><Result /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
