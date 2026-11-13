/* DotStream — the marquee dot divider, rebuilt 2026-11-05 (owner order):
   a LIVING, INTERACTIVE, continuous loop — third version.
   v1 drew the field as a background gradient: it did not paint on the
   live site. v2 used real dots on a translating 30s track: the dots were
   in the DOM (2592, verified) but the strip still read as empty for
   ~20s of each 30s cycle in screenshots, and the cause could not be
   isolated to the track (the two tiles are identical). v3 removes the
   unknown entirely: the field is STATIC — one fixed row-set that can
   never translate away, so the strip is dense at every moment. The life
   is the per-dot pulse (each dot breathes on its own cycle), the two
   glow dots travelling the strip on a loop, the pointer glow, and scroll
   velocity speeding the pulse up while you scroll.
   v4 (2026-11-06, animejs research): an Anime.js grid-stagger wave
   ripples out from the cursor as it crosses the strip — the direct
   answer to "the circles aren't alive". The wave animates the SPAN
   scale; the CSS pulse animates the ::after, so they never fight. */
import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const COLS = 72 // 72 cells x 40px = 2880px of field (covers any viewport)
const ROWS = 3

export default function DotStream() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dots = Array.from(root.querySelectorAll('.marquee-dot')) as HTMLElement[]
    // Pointer glow follows the cursor across the strip.
    let lastWave = 0
    let lastCol = -1
    let lastRow = -1
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      root.style.setProperty('--mx', `${e.clientX - r.left}px`)
      root.style.setProperty('--my', `${e.clientY - r.top}px`)
      // Grid-stagger wave from the cursor (Anime.js): a ripple radiating
      // out across the dot grid. Throttled — a new wave only every 300ms
      // and only when the cursor reached a different dot.
      if (reduced || dots.length === 0) return
      const now = performance.now()
      if (now - lastWave < 300) return
      const rtl = document.documentElement.dir === 'rtl'
      const x = e.clientX - r.left
      const colRaw = Math.floor(x / 40)
      const col = rtl ? COLS - 1 - colRaw : colRaw
      const row = Math.floor((e.clientY - r.top) / 16)
      const c = Math.max(0, Math.min(COLS - 1, col))
      const rw = Math.max(0, Math.min(ROWS - 1, row))
      if (c === lastCol && rw === lastRow) return
      lastWave = now
      lastCol = c
      lastRow = rw
      animate(dots, {
        scale: [1, 1.5, 1],
        duration: 500,
        delay: stagger(18, { grid: [COLS, ROWS], from: [c, rw] }),
        ease: 'outExpo',
      })
    }
    root.addEventListener('pointermove', onMove)
    // Scroll velocity: the dots pulse faster while the page scrolls
    // (--pulse scales the pulse duration; 1 at rest, 0.45 while scrolling).
    let idle: number | undefined
    const onScroll = () => {
      root.style.setProperty('--pulse', '0.45')
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        root.style.setProperty('--pulse', '1')
      }, 700)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(idle)
    }
  }, [])

  return (
    <div className="dot-divider dot-stream" aria-hidden="true" ref={rootRef}>
      <div className="dot-stream-field">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="marquee-row">
            {Array.from({ length: COLS }, (_, col) => (
              <span key={col} className="marquee-dot" />
            ))}
          </div>
        ))}
      </div>
      <div className="marquee-glow" />
      {/* Two bright dots travel the strip so the drift is unmistakable. */}
      <span className="dot-stream-comet" />
      <span className="dot-stream-comet green" />
    </div>
  )
}
