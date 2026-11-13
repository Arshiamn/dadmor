import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/legacy.css'
import './styles/v5.css'
import App from './App.tsx'

// v30 (2026-11-06, owner order: speed up the site as much as possible
// without lowering quality or removing animations/effects): preload the
// hero canvas chunk in parallel with hydration. The chunk (three.js,
// ~924KB raw) is lazy-loaded by Hero.tsx, so it used to start
// downloading only after the Hero mounted — the interactive background
// arrived late, especially on mobile. This bare dynamic import starts
// the download as soon as the main bundle executes; React.lazy in
// Hero.tsx then resolves from the already-warming module cache. The
// import is intentionally not awaited. It resolves to the same chunk
// Vite emits for the lazy import (no duplication). If it fails (offline
// / blocked), the lazy import in Hero.tsx retries on mount.
import('./components/HeroCanvas').catch(() => {
  /* Hero.tsx lazy import retries on mount */
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
