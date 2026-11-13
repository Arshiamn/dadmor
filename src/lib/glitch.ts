/* Glitch scheduler — the v4 bug B1 fix, by construction.
   The .glitchable class is set in JSX at render time; this scheduler only
   toggles .glitching. Fires on load (tagline, then lion), on scroll-enter,
   and then one random element every 8–14s. Never on body copy or inputs.
   Reduced motion: off entirely. */
import { useEffect } from 'react'

export function useGlitchScheduler(dep: string) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timers: ReturnType<typeof setTimeout>[] = []
    const fire = (el: Element | null) => {
      if (!el) return
      el.classList.add('glitching')
      timers.push(setTimeout(() => el.classList.remove('glitching'), 380))
    }
    /* First bursts land after the typing finishes (~1.8s), so the glitch
       never fights the word reveal; the ambient scheduler is rarer now
       (8–14s) so the effect reads as a pulse, not noise. */
    timers.push(setTimeout(() => fire(document.querySelector('.hero h1')), 3000))
    timers.push(setTimeout(() => fire(document.querySelector('.hero-lion-svg')), 3800))
    let stopped = false
    const schedule = () => {
      if (stopped) return
      const els = Array.from(document.querySelectorAll('.glitchable')).filter(
        (el) => !el.classList.contains('glitching'),
      )
      if (els.length > 0) {
        const el = els[Math.floor(Math.random() * els.length)]
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) fire(el)
      }
      timers.push(setTimeout(schedule, 8000 + Math.random() * 6000))
    }
    timers.push(setTimeout(schedule, 9000))
    // Scroll-enter: glitch the section heading once when it arrives.
    // Restored 2026-11-06 (owner order: the glitch effects are back).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const h = e.target.querySelector('h2.glitchable') as Element | null
            if (h) fire(h)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.4 },
    )
    document.querySelectorAll('main section').forEach((s) => io.observe(s))
    return () => {
      stopped = true
      timers.forEach(clearTimeout)
      io.disconnect()
    }
    // Re-run per page: new sections need observing, hero bursts re-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
}
