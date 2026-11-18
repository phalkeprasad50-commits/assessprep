import { useEffect, useState } from 'react'

// Whole seconds left until expiresAt (ms). `offset` corrects for the gap between the server clock and this device's clock.
export function secondsLeft(expiresAt, offset = 0, now = Date.now()) {
  return Math.max(0, Math.ceil((expiresAt - (now + offset)) / 1000))
}

export function useCountdown(expiresAt, offset = 0) {
  const [left, setLeft] = useState(() => (expiresAt ? secondsLeft(expiresAt, offset) : 0))
  useEffect(() => {
    if (!expiresAt) return undefined
    const tick = () => setLeft(secondsLeft(expiresAt, offset))
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [expiresAt, offset])
  return left
}
