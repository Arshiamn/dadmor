/* Hero — word-level typing tagline, breathing lion, living 3D canvas.
   Typing is WORD-level for Persian (never split a Persian word into
   characters — joining breaks). The h1 words reveal one by one with a
   caret; the glitch scheduler (lib/glitch) takes over after. */
import { Fragment, Suspense, lazy, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PageData, Lang } from '../lib/site'
import { slogan } from '../lib/slogans'
import { HeroLion } from './Lion'

/* The 3D canvas is lazy-loaded: three.js (~1.9 MB) splits out of the main
   bundle and loads only after the first paint — the v3 build scored
   PageSpeed Performance 45/53 largely because the whole bundle was
   render-blocking. The hero still renders fully without it (static lion).
   The mount is deferred until the browser is idle (or 1.2s), so the
   canvas chunk never competes with first paint / LCP. */
const HeroCanvas = lazy(() => import('./HeroCanvas'))

export default function Hero({ page, lang, dark }: { page: PageData; lang: Lang; dark: boolean }) {
  const hero = page.hero!
  const words = hero.h1_text.split(/\s+/).filter(Boolean)
  // The accent phrase is the verb: FA «می ماند» is TWO space-separated
  // words since the ZWNJ was removed (owner order 2026-11-06 00:49),
  // so both get the accent; EN "lasts." is one word. Owner order
  // 2026-11-06 01:11: the WHOLE «می ماند» must be violet, not just «ماند».
  const accentWords = lang === 'fa' ? 2 : 1
  // The h1 typing entrance is CSS-only (v27, owner order 2026-11-06).
  // It used to be React state: the server rendered all words visible
  // while the client started at shown=0, so hydration ERASED the
  // prerendered title and typed it back in — on every refresh the full
  // title flashed, vanished, and re-appeared word by word (the hero
  // flicker). The words are now always rendered visible in the HTML
  // (good for SEO / no-JS) and the staggered fade-in is a CSS animation
  // (.hero h1 .w, hero-word-in, `backwards` fill so each word starts
  // hidden during its delay). No React state, no hydration mismatch,
  // no flash — the same rhythm as before (200ms first word, 300ms per
  // word, ~0.8s total). Reduced-motion shows the title at once (the
  // animation is disabled in the reduced-motion block in v5.css).
  const [canvasReady, setCanvasReady] = useState(false)

  // Mount the 3D canvas immediately on first paint — the animated
  // background behind the logo used to appear ~1.2s late (idle callback
  // + a 1200ms fallback), which read as lag (owner order 2026-11-06).
  // The chunk is lazy-loaded, so the fetch starts at once; a lightweight
  // CSS backdrop (.hero-backdrop) covers the hero until it arrives.
  // Reduced-motion users never get the canvas at all.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setCanvasReady(true)
  }, [])

  // Holographic foil + 3D tilt on the lion (owner order 2026-11-06): the
  // lion turns with the pointer, and the foil gradient (--fx/--fy)
  // travels with the turn, so the material reads as holographic foil.
  // v12 (owner order 2026-11-06 01:04: stronger + faster mouse response):
  // tilt ±6deg -> ±10deg. v13: px/py are computed relative to the LION
  // itself, not the whole hero — over the lion (near the hero's centre)
  // the hero-relative px was small, so the tilt only ever reached ~2-3deg
  // (v12 QA). Now hovering the lion spans the full ±10deg. Fine pointer
  // only; the tilt is on .lion-stack so it never fights the GSAP scale
  // on .hero-lion. No CSS transition on the transform — the tilt follows
  // the pointer immediately.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches === false) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stack = document.querySelector('.lion-stack') as HTMLElement | null
    const heroEl = document.querySelector('.hero') as HTMLElement | null
    if (!stack || !heroEl) return
    const onMove = (e: PointerEvent) => {
      const r = stack.getBoundingClientRect()
      const px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5))
      const py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5))
      stack.style.transform = `perspective(700px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`
      stack.style.setProperty('--fx', `${((px + 0.5) * 100).toFixed(1)}%`)
      stack.style.setProperty('--fy', `${((py + 0.5) * 100).toFixed(1)}%`)
    }
    const onLeave = () => {
      stack.style.transform = ''
    }
    heroEl.addEventListener('pointermove', onMove)
    heroEl.addEventListener('pointerleave', onLeave)
    return () => {
      heroEl.removeEventListener('pointermove', onMove)
      heroEl.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const sub = hero.paragraphs[1] ?? ''
  const statsHtml = hero.paragraphs[2] ?? ''
  const brandHtml = hero.paragraphs[3] ?? ''

  return (
    <section className="hero container">
      {/* Instant CSS backdrop: the animated canvas is lazy-loaded, so
          this violet glow + dot field is what the hero shows on the very
          first paint — the background never appears late or empty. */}
      <div className="hero-backdrop" aria-hidden="true" />
      {canvasReady ? (
        <Suspense fallback={null}>
          <HeroCanvas dark={dark} />
        </Suspense>
      ) : null}
      <div className="hero-boot-sweep" aria-hidden="true" />
      <div className="hero-text">
        <p className="hero-eyebrow glitchable">{slogan(hero.eyebrow)}</p>
        {/* The space between words is a direct child text node of the h1
            (between the .w spans), NOT inside a wrapper span: a trailing
            space inside an inline-block wrapper is trimmed by CSS, so the
            DOM/accessible text read "Astructurethatlasts." (QA FAIL). */}
        <h1 className="glitchable" aria-label={hero.h1_text}>
          {words.map((w, i) => (
            <Fragment key={i}>
              {/* The accent phrase is the verb: «می ماند» / "lasts." is
                  violet; the middle word («که» / "that") is NOT — the v4
                  nth-child(odd/even) alternation coloured every even word
                  (so «که» was purple). Owner order 2026-11-06. FA «می ماند»
                  is two words (see accentWords above), so both are violet. */}
              <span className={`w${i >= words.length - accentWords ? ' w-accent' : ''}`}>
                {w}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </Fragment>
          ))}
        </h1>
        {sub && <p dangerouslySetInnerHTML={{ __html: sub }} />}
        <div className="hero-ctas">
          {hero.ctas.map((c) => (
            <Link key={c.href} className={c.class} to={c.href}>
              {slogan(c.text)}
            </Link>
          ))}
        </div>
        {statsHtml && <div className="hero-stats" dangerouslySetInnerHTML={{ __html: statsHtml }} />}
        {brandHtml && <p className="hero-brandline" dangerouslySetInnerHTML={{ __html: brandHtml }} />}
      </div>
      <div className="hero-lion">
        <div className="lion-stack">
          <HeroLion density="d3" breathing label={lang === 'fa' ? 'شیر دادمور، ساخته از نقطه ها' : 'The dadmor lion, made of dots'} />
          {/* Holographic foil layer: an iridescent gradient whose position
              follows the lion's tilt (--fx/--fy), so the dots read as foil
              when the lion turns. */}
          <span className="foil" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
