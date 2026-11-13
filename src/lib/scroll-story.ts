/* Scroll story — Lenis smooth scroll + GSAP ScrollTrigger (motion-site method).
   - Hero pin (desktop): the hero stays while its text rises out and the lion
     grows; on mobile the hero simply fades (no pin, shorter travel).
   - Section h2s: Anime.js word flip-in on enter (anime-fx.ts) — the GSAP
     word reveal was replaced 2026-11-06 (owner order: animejs research).
   - E5 scroll-velocity headline warp (feDisplacementMap, max ~4px).
   - E6 work-card tilt (fine pointer only, max 5 deg) + foil vars.
   - E2 boot sweep: a 2px scanline over the hero once per load.
   Reduced motion: everything skipped, content stays visible. */
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initAnimeFx } from './anime-fx'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export { lenis }

export function scrollToTopImmediate() {
  if (lenis) lenis.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
}

export function useScrollStory(dep: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // v26 (2026-11-06, performance — owner order: the landing page felt
    // heavy, scrolling stuck and jumped): lerp 0.16 -> 0.2. A higher lerp
    // follows the wheel more closely, so scrolling feels less laggy / less
    // like the page is stuck and then jumping. The smooth-scroll feel is
    // kept. The bigger win is the hero canvas moving to GPU shaders
    // (HeroCanvas.tsx), which frees the main thread Lenis runs on.
    lenis = new Lenis({ smoothWheel: true, lerp: 0.2 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Scroll progress: 12-dot vertical line, lights up as you scroll.
    const progress = document.querySelector('[data-progress]') as HTMLElement | null
    let progressCleanup: (() => void) | null = null
    if (progress) {
      const DOTS = 12
      const dots: HTMLSpanElement[] = []
      progress.innerHTML = ''
      for (let i = 0; i < DOTS; i++) {
        const dp = document.createElement('span')
        dp.className = 'prog-dot'
        dp.style.opacity = '0.25'
        progress.appendChild(dp)
        dots.push(dp)
      }
      let ticking = false
      const paint = () => {
        ticking = false
        const h = document.documentElement.scrollHeight - window.innerHeight
        const ratio = h > 0 ? Math.min(1, window.scrollY / h) : 0
        progress.classList.toggle('visible', window.scrollY > 80)
        /* The footer is the end of the page for the reader: once any part
           of the (tall) footer is in view, the last dot is lit. A fixed
           48px threshold left it dark while the footer was already on
           screen. (The other half of this bug was the rail's ::before /
           ::after pseudo-dots in legacy.css — always dim, so the bottom
           dot could never light. They are removed; the rail is exactly
           the 12 JS-controlled dots.) */
        const footer = document.querySelector('footer')
        const fh = footer ? footer.getBoundingClientRect().height + 24 : 48
        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - Math.max(48, fh)
        const lit = nearBottom || ratio >= 0.97 ? DOTS : Math.round(ratio * DOTS)
        dots.forEach((d, idx) => {
          d.style.opacity = idx < lit ? '1' : '0.25'
        })
      }
      const onScrollProgress = () => {
        if (!ticking) {
          ticking = true
          window.requestAnimationFrame(paint)
        }
      }
      window.addEventListener('scroll', onScrollProgress, { passive: true })
      // Lenis drives the scroll, so paint on its scroll events too (the
      // native event can lag during smooth scrolling), and on resize —
      // the mobile toolbar changes innerHeight and scrollHeight.
      lenis?.on('scroll', onScrollProgress)
      window.addEventListener('resize', onScrollProgress)
      paint()
      progressCleanup = () => {
        window.removeEventListener('scroll', onScrollProgress)
        window.removeEventListener('resize', onScrollProgress)
        lenis?.off('scroll', onScrollProgress)
      }
    }

    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 768
      const hero = document.querySelector('.hero')
      if (hero) {
        // E2 boot sweep
        const sweep = hero.querySelector('.hero-boot-sweep') as HTMLElement | null
        if (sweep) {
          window.setTimeout(() => {
            sweep.style.setProperty('--hero-h', `${(hero as HTMLElement).offsetHeight}px`)
            sweep.classList.add('run')
          }, 700)
        }
        // Hero pin + text exit (desktop); fade only on mobile.
        if (isDesktop) {
          // v12 (2026-11-06, owner order): as the text exits, the lion
          // also slides to the MIDDLE of the hero block. The offset is
          // the distance between the hero's centre and the lion's
          // centre; it is recomputed on refresh (resize / language
          // switch flips it in RTL/LTR because getBoundingClientRect
          // is layout-aware). The tilt stays on .lion-stack (a child),
          // so it never fights this x + scale on .hero-lion.
          const lionCenterX = () => {
            const h = document.querySelector('.hero') as HTMLElement | null
            const l = document.querySelector('.hero-lion') as HTMLElement | null
            if (!h || !l) return 0
            const hr = h.getBoundingClientRect()
            const lr = l.getBoundingClientRect()
            return hr.left + hr.width / 2 - (lr.left + lr.width / 2)
          }
          gsap
            .timeline({
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=55%',
                scrub: 0.9,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            .to('.hero-text', { y: -80, opacity: 0, ease: 'none' }, 0)
            // fromTo (v13): the old .to() recorded the lion's CURRENT scale
            // as its start — at setup the entrance left .hero-lion at
            // scale 0.92, so at rest it rendered 331px instead of the
            // 360px box (v12 QA + a live Playwright measurement). The pin
            // now starts explicitly at scale 1.
            .fromTo('.hero-lion', { scale: 1, x: 0 }, { scale: 1.12, x: lionCenterX, ease: 'none' }, 0)
        } else {
          gsap.to('.hero-text', {
            y: -40,
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
          })
        }
      }

      // Section h2s are handled by Anime.js (anime-fx.ts): word-level
      // kinetic flip-in on scroll-enter. The GSAP word reveal that lived
      // here was removed 2026-11-06 (owner order: animejs research) —
      // Anime.js splitText + stagger is the livelier entrance, and the
      // eyebrow scramble lives there too.

      // E5 scroll-velocity headline warp — REMOVED in v26 (2026-11-06,
      // performance, owner order). It set an SVG feDisplacementMap filter
      // on the h1 and re-rendered that filter on every scroll frame,
      // which is expensive (notably on iOS Safari) for a max-4px wobble
      // on one heading, and it fought the smooth scroll it was meant to
      // dress up. The filter def in App.tsx is now unused; the h1 gets
      // no filter. (It used to warp every h2 too, and during the scroll
      // fade-in the filter + opacity transition rendered a
      // chromatic-aberration double-vision on headings — QA 2026-11-05.)

      // E6: work-card tilt (fine pointer only). The tilt also drives the
      // holographic foil (v5.css .work-item::before): --fx/--fy move the
      // foil gradient with the rotation, so the card reads as foil when
      // it turns.
      if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.work-item').forEach((card) => {
          const c = card as HTMLElement
          c.classList.add('tilt')
          c.addEventListener('mousemove', (e: MouseEvent) => {
            const r = c.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width - 0.5
            const py = (e.clientY - r.top) / r.height - 0.5
            c.style.transform = `perspective(700px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`
            c.style.setProperty('--fx', `${((px + 0.5) * 100).toFixed(1)}%`)
            c.style.setProperty('--fy', `${((py + 0.5) * 100).toFixed(1)}%`)
          })
          c.addEventListener('mouseleave', () => {
            c.style.transform = ''
          })
        })
      }
    })

    // Anime.js effects: eyebrow scramble + h2 word flip-in (anime-fx.ts).
    // Runs per page like the rest of this hook. v20 (2026-11-06): its
    // cleanup must NOT revert() the split text — revert() restores the
    // innerHTML from split time (the OLD language), and the cleanup runs
    // after React has set the NEW language's text, so it overwrote the
    // new headings with the old ones until a refresh. The cleanup only
    // disconnects the observer now; see anime-fx.ts.
    const animeCleanup = initAnimeFx()

    // Scroll fade-in (owner order 2026-11-05 22:32): every section, text
    // and block fades in as it enters the viewport. IntersectionObserver,
    // so it costs nothing while idle. The hidden state is applied by JS
    // only — without JS (or with reduced motion, handled by the early
    // return above) everything stays visible. h2s are excluded: Anime.js
    // (anime-fx.ts) reveals them word by word. Hero descendants are excluded:
    // the hero has its own entrance choreography.
    let revealCleanup: (() => void) | null = null
    {
      const els = Array.from(
        document.querySelectorAll(
          'main p, main li, main .service-row, main .tool-row, main .work-item, main .find-card, main table, main form, main .tool-app, main .faq-item, main blockquote, main .contact-side, main .home-faq-grid > *'
        )
      ).filter((el) => !el.closest('.hero')) as HTMLElement[]
      const seen = new Set(els)
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              ;(e.target as HTMLElement).classList.add('in')
              io.unobserve(e.target)
            }
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
      )
      for (const el of els) {
        // Small cascade: siblings enter a beat apart, capped at 240ms.
        const parent = el.parentElement
        if (parent) {
          const sibs = Array.from(parent.children).filter((c) => seen.has(c as HTMLElement))
          const idx = sibs.indexOf(el)
          if (idx > 0) el.style.transitionDelay = `${Math.min(idx * 60, 240)}ms`
        }
        el.classList.add('reveal')
        io.observe(el)
      }
      revealCleanup = () => io.disconnect()
    }

    return () => {
      ctx.revert()
      animeCleanup()
      progressCleanup?.()
      revealCleanup?.()
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
    // Re-run per page: new sections need their own triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
}
