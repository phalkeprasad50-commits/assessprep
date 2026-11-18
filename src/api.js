// All HTTP calls live here. Base URL is empty by default (same origin, via the Vite or nginx proxy).
const BASE = import.meta.env.VITE_API_URL || ''
const KEY = 'assessprep.session'

export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}
export const setSession = (s) => localStorage.setItem(KEY, JSON.stringify(s))
export const clearSession = () => localStorage.removeItem(KEY)

async function request(path, { method = 'GET', body } = {}) {
  const session = getSession()
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  // An expired or invalid token while logged in: clear it and go back to login.
  if (res.status === 401 && session) {
    clearSession()
    window.location.assign('/login')
    throw new Error('Session expired')
  }
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* non-JSON body */ }
  if (!res.ok) throw new Error((data && (data.message || data.error)) || `Request failed (${res.status})`)
  return data
}

export const api = {
  register: (b) => request('/api/auth/register', { method: 'POST', body: b }),
  login: (b) => request('/api/auth/login', { method: 'POST', body: b }),
  start: (b) => request('/api/tests/start', { method: 'POST', body: b }),
  submit: (id, answers) => request(`/api/tests/${id}/submit`, { method: 'POST', body: { answers } }),
  result: (id) => request(`/api/tests/${id}/result`),
  history: () => request('/api/tests/history'),
}
