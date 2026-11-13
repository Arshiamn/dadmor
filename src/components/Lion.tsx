/* The dadmor lion, inlined so CSS variables pierce it.
   The v5 lion SVGs (scripts/build-lions.py) carry:
     .lion-dots  — the 194 halftone circles (breathing target)
     .lion-face  — the 53-subpath face, fill var(--lion-ink)
     .lion-eyes  — the 2-subpath eyes, fill var(--lion-eyes), id="eyes"
   Dark: violet ink + green eyes. Light: indigo ink + indigo eyes (owner:
   no green in light mode). The breathing pulse lives in v5.css and runs
   only in dark mode (class lion-breathing on the wrapper). */

import iconSvg from '/img/dadmor-halftone-icon.svg?raw'
import wordmarkSvg from '/img/dadmor-halftone-wordmark.svg?raw'
/* v33: only d3 is ever rendered (Hero + 404 both pass density="d3").
   d0–d2 were imported via ?raw and sat in the main bundle unused
   (~145KB raw / ~46KB gzip). The SVG files stay in public/img/ for
   now; only the bundle imports are dropped. */
import heroD3 from '/img/hero-lion-d3.svg?raw'

const HERO = { d3: heroD3 } as const

export function LionIcon({
  breathing = false,
  className = '',
  label,
}: {
  breathing?: boolean
  className?: string
  label?: string
}) {
  return (
    <span
      className={`lion-inline lion-icon${breathing ? ' lion-breathing' : ''} ${className}`}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  )
}

/* The wordmark alone (dadmor-halftone-wordmark.svg, 301x78) — the brand
   lockup is ONE lion icon + this wordmark. The old LionWord inlined the
   FULL logo SVG (lion + wordmark) into the wordmark's wide box, so the
   header showed TWO lions and the wordmark rendered clipped ("dadn r").
   Never inline the full logo file as the wordmark. */
export function LionWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`lion-inline lion-word ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: wordmarkSvg }}
    />
  )
}

export function HeroLion({
  density = 'd3',
  breathing = true,
  className = '',
  label,
}: {
  density?: keyof typeof HERO
  breathing?: boolean
  className?: string
  label?: string
}) {
  return (
    <span
      className={`hero-lion-svg glitchable lion-glitch${breathing ? ' lion-breathing' : ''} ${className}`}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: HERO[density] }}
    />
  )
}
