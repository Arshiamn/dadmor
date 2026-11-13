/* Anime.js effects (owner order 2026-11-06: research animejs.com).
   Adopted À LA CARTE (MIT, v4.5.0): only scrambleText, splitText and
   stagger — GSAP + ScrollTrigger + Lenis stay the general engine, and
   Anime.js is worth adding only for the effects GSAP doesn't do as
   easily. Two effects live here:
   (1) Scramble — the hero eyebrow decodes out of random characters
       (the cyberpunk "decoding" look, the single most on-brand effect).
   (2) Split-text — section h2s flip in WORD by WORD on scroll-enter
       (rotateX + translateY + stagger). WORDS, not chars: Persian is
       cursive — splitting into letters would break the joining. This
       REPLACES the GSAP word reveal that used to live in scroll-story.
   The marquee grid-stagger wave lives in DotStream.tsx (it needs the
   strip's refs). H1 typing stays as-is (owner-ordered). */
import { animate, stagger } from 'animejs'
import { scrambleText, splitText } from 'animejs/text'

export function initAnimeFx(): () => void {
  const cleanups: Array<() => void> = []

  // (1) Scramble the hero eyebrow on load. scrambleText() returns a
  // function-based tween value for the `text` property of animate() —
  // it is NOT called with (target, params).
  const eyebrow = document.querySelector('.hero-eyebrow') as HTMLElement | null
  if (eyebrow && !eyebrow.dataset.scrambled) {
    eyebrow.dataset.scrambled = '1'
    const text = eyebrow.textContent ?? ''
    if (text.trim()) {
      animate(eyebrow, {
        text: scrambleText({
          text,
          chars: '0123456789ABCDEF#$@!',
          duration: 1400,
          delay: 200,
        }),
      })
    }
  }

  // (2) Section h2s: word-level kinetic flip-in on scroll-enter.
  // v33: never split a heading that wraps INTERACTIVE content. The FAQ
  // accordion questions are h2 > button and the Ghazal work-item title
  // is h2 > a — splitText clones the whole heading into a
  // visually-hidden span (for accessibility), which DUPLICATES the
  // button/link and its aria-controls id. Interactive headings render
  // plain, without the flip-in.
  const h2s = Array.from(document.querySelectorAll('main h2')).filter((h) => {
    const el = h as HTMLElement
    if (el.closest('.hero')) return false
    if (el.querySelector('button, a, input, select, textarea')) return false
    return true
  }) as HTMLElement[]
  if (h2s.length > 0) {
    // Split + set the "from" state on mount, so there is no flash of the
    // full heading before the flip-in. Below-the-fold headings are hidden
    // until they enter — same pattern as the GSAP reveal this replaces.
    // v20 (2026-11-06, owner order: headings stayed in the OLD language
    // after a language switch until a refresh): the cleanup used to call
    // TextSplitter.revert(), which restores the innerHTML the element had
    // when splitText ran — i.e. the OLD language's text. The cleanup runs
    // AFTER React has already set the NEW language's text, so revert()
    // overwrote the new text with the old one. The cleanup now only
    // disconnects the observer; React replaces innerHTML on a language
    // change and unmounts the node on a page change, so the split spans
    // need no manual cleanup. The guard below prevents double-splitting
    // a node React reused with identical text.
    const wordsByEl = new Map<HTMLElement, HTMLElement[]>()
    for (const el of h2s) {
      // Anime.js splitText marks each generated word with singular data-word
      // (not data-words). StrictMode runs this setup twice in development;
      // detect the first split so we reuse its spans instead of nesting a
      // second split inside the heading and leaving it hidden.
      const existing = Array.from(el.querySelectorAll('span[data-word]')) as HTMLElement[]
      if (existing.length > 0) {
        // Already split with the CURRENT text (React reused the node and
        // the text did not change) — reuse its word spans; splitting again
        // would nest spans inside spans.
        wordsByEl.set(el, existing)
      } else {
        const r = splitText(el, { words: true })
        wordsByEl.set(el, r.words as HTMLElement[])
      }
      animate(wordsByEl.get(el)!, { rotateX: -90, translateY: '100%', opacity: 0, duration: 0 })
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const el = e.target as HTMLElement
          io.unobserve(el)
          const words = wordsByEl.get(el)
          if (!words) continue
          animate(words, {
            rotateX: [-90, 0],
            translateY: ['100%', '0%'],
            opacity: [0, 1],
            delay: stagger(60),
            duration: 600,
            ease: 'outExpo',
          })
        }
      },
      { threshold: 0.3 },
    )
    h2s.forEach((h) => io.observe(h))
    cleanups.push(() => {
      io.disconnect()
    })
  }

  return () => cleanups.forEach((fn) => fn())
}
