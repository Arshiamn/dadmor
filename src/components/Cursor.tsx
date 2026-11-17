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

    let mx = -100
    let my = -100
    let rx = -100
    let ry = -100
    let raf = 0
    let shown = false

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!shown) {
        shown = true
        rx = mx
        ry = my
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
      const t = e.target as HTMLElement | null
      const text = t?.closest('input, textarea, [contenteditable="true"]')
      const hot = t?.closest('a, button, select, label, [role="button"], summary')
      ring.classList.toggle('cursor-ring-text', !!text)
      ring.classList.toggle('cursor-ring-hot', !text && !!hot)
    }
    const onLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
      shown = false
    }
    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
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
