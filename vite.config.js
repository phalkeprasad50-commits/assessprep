import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api calls are proxied to the Spring Boot app, so the browser sees one origin (no CORS needed).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:8080' } },
  test: { environment: 'jsdom' },
})
