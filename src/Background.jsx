import { useEffect, useRef } from 'react'

// Drifting node network that leans towards the cursor. Also sets --mx/--my for the CSS cursor glow.
export default function Background() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    const x = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, P = [], raf
    const m = { x: -999, y: -999 }
    const size = () => {
      w = c.width = innerWidth; h = c.height = innerHeight
      P = Array.from({ length: Math.min(60, Math.floor((w * h) / 24000)) }, () => ({
        x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      }))
    }
    const move = (e) => {
      m.x = e.clientX; m.y = e.clientY
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    const draw = () => {
      x.clearRect(0, 0, w, h)
      for (const p of P) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          const dx = m.x - p.x, dy = m.y - p.y
          if (Math.hypot(dx, dy) < 140) { p.x -= dx * 0.01; p.y -= dy * 0.01 }
        }
        x.fillStyle = 'rgba(124,156,255,.7)'
        x.beginPath(); x.arc(p.x, p.y, 1.6, 0, 6.28); x.fill()
      }
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y)
        if (d < 130) {
          x.strokeStyle = `rgba(124,156,255,${0.16 * (1 - d / 130)})`
          x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); x.stroke()
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    size(); draw()
    addEventListener('resize', size); addEventListener('pointermove', move)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', move) }
  }, [])
  return <canvas ref={ref} className="bg" aria-hidden="true" />
}
