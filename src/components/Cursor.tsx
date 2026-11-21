/* Custom desktop cursor (owner order, 2026-11-17): a small green dot —
   the lion's eye colour — with a violet ring that trails it. The ring
   grows over interactive elements and turns into a slim bar over text
   fields. Only activates on fine pointers (mouse/trackpad) and never
   under prefers-reduced-motion; touch devices and no-JS keep the native
   cursor. The native cursor is hidden only while this component is
   active (html.has-custom-cursor), and the elements stay invisible
   until the first mouse move, so prerendered HTML shows nothing. */
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    let shown = false

    /* Positions are written straight in the mousemove handler, no rAF
       loop: the dot is glued to the pointer and the ring trails it via
       a compositor-side CSS transform transition (see v5.css), so the
       cursor stays smooth even when the page's own animations keep the
       main thread busy. The first version lerped the ring in rAF and
       felt severely laggy on the live site (owner report, 2026-11-17). */
    const onMove = (e: MouseEvent) => {
      const pos = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      dot.style.transform = pos
      ring.style.transform = pos
      if (!shown) {
        shown = true
        /* Snap the ring to the pointer on first show, no glide in
           from the top-left corner. */
        ring.style.transition = 'none'
        ring.style.transform = pos
        void ring.offsetWidth
        ring.style.transition = ''
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
      const t = e.target as HTMLElement | null
      const text = t?.closest('input, textarea, [contenteditable="true"]')
      const hot = t?.closest('a, button, select, label, [role="button"], summary')
      ring.classList.toggle('cursor-ring-text', !!text)
      ring.classList.toggle('cursor-ring-hot', !text && !!hot)
      dot.classList.toggle('cursor-dot-hot', !text && !!hot)
    }
    const onLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
      shown = false
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      root.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
