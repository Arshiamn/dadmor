/* dadmor v5 — React rebuild. Dark-first NEON FIELD, FA root + /en/,
   35 pages prerendered to static HTML (see scripts/prerender.mjs). */
import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, StaticRouter } from 'react-router-dom'
import { PAGES, pagePath, pageForRoute, type Lang } from './lib/site'
import { useGlitchScheduler } from './lib/glitch'
import { useScrollStory, scrollToTopImmediate, lenis } from './lib/scroll-story'
import { Header, Footer } from './components/Chrome'
import Home from './pages/Home'
import Page, { NotFound } from './pages/Page'
import { EstimatorPage, SecurityPage, ServicesPage } from './pages/ToolPage'

type Theme = 'dark' | 'light'

function Shell() {
  const loc = useLocation()
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark'
    const t = document.documentElement.getAttribute('data-theme')
    return t === 'light' ? 'light' : 'dark'
  })

  const page = pageForRoute(loc.pathname)
  const lang: Lang = page?.lang ?? (loc.pathname.startsWith('/en') ? 'en' : 'fa')

  useGlitchScheduler(loc.pathname)
  useScrollStory(loc.pathname)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
    if (page) document.title = page.title
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1))
      if (el) {
        // let the route render first, then scroll to the anchor
        window.setTimeout(() => {
          if (lenis) lenis.scrollTo(el, { immediate: false })
          else el.scrollIntoView()
        }, 100)
        return
      }
    }
    scrollToTopImmediate()
  }, [loc.pathname, loc.hash, lang, page])

  // v32 (2026-11-06): the wave animation is RESTORED per owner order
  // ('the wave animation of the colour change MUST be there'). v31
  // removed it (instant swap) because the View Transition snapshot of
  // the WebGL canvas froze the page and iOS Safari reloaded it — but
  // the owner loves the wave (it spreads from the toggle icon) and
  // accepts that it may still flicker/reload on his own iPhone Safari.
  // It is most likely a Safari/iOS-only issue: desktop browsers handle
  // the transition fine. So the v30 wave is back, unchanged.
  // v33: double-click race fix — the 1500/2000ms timers were never
  // stored or cleared, so toggling twice within ~2s let the FIRST
  // toggle's 2000ms safety net fire after the second toggle and revert
  // the theme. Every toggle now clears the previous timers, so only
  // the latest toggle's safety net can run. The `next` theme is read
  // from the live DOM attribute (set synchronously by apply()), not
  // from React state, so rapid clicks can never compute a stale target.
  // Wave duration (1400ms), origin and preserveDrawingBuffer are
  // unchanged.
  const themeTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const toggleTheme = () => {
    const current: Theme =
      document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    const next: Theme = current === 'dark' ? 'light' : 'dark'
    const apply = () => {
      setTheme(next)
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('dadmor-theme', next)
      } catch {
        /* storage unavailable — theme still applies for this visit */
      }
    }
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> }
    }
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try {
        // The wave spreads from the toggle button itself (--wave-x /
        // --wave-y from its centre). 1400ms, gentler deceleration.
        const toggleBtn = document.querySelector('.theme-toggle')
        if (toggleBtn) {
          const r = toggleBtn.getBoundingClientRect()
          const x = ((r.left + r.width / 2) / window.innerWidth) * 100
          const y = ((r.top + r.height / 2) / window.innerHeight) * 100
          document.documentElement.style.setProperty('--wave-x', `${x.toFixed(1)}%`)
          document.documentElement.style.setProperty('--wave-y', `${y.toFixed(1)}%`)
        }
        document.documentElement.classList.add('theme-anim')
        const vt = doc.startViewTransition(apply)
        // Do NOT remove theme-anim on vt.finished: it resolved at
        // ~800ms while the wave is 1400ms, which cut the wave off
        // mid-flight and flickered. Removed by timers instead: 1500ms
        // covers the 1400ms wave, and the 2000ms safety net re-applies
        // the theme if the transition stalled.
        // v33 race fix: clear any timers from a previous toggle first,
        // so a stale safety net can never revert this toggle.
        void vt
        themeTimers.current.forEach(clearTimeout)
        themeTimers.current = []
        themeTimers.current.push(
          window.setTimeout(() => {
            document.documentElement.classList.remove('theme-anim')
          }, 1500),
        )
        themeTimers.current.push(
          window.setTimeout(() => {
            if (document.documentElement.getAttribute('data-theme') !== next) apply()
            document.documentElement.classList.remove('theme-anim')
          }, 2000),
        )
      } catch {
        themeTimers.current.forEach(clearTimeout)
        themeTimers.current = []
        document.documentElement.classList.remove('theme-anim')
        apply()
      }
    } else {
      apply()
    }
  }

  const dark = theme === 'dark'
  const p404 = PAGES.find((p) => p.path === '404.html')!
  return (
    <>
      <Header lang={lang} theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        {PAGES.filter((p) => p.path !== '404.html').map((p) => {
          const route = pagePath(p.path)
          const isHome = route === '/' || route === '/en/'
          const isEstimator = route.endsWith('/tools/estimator/')
          const isSecurity = route.endsWith('/tools/security-check/')
          const isServices = route === '/services/' || route === '/en/services/'
          return (
            <Route
              key={p.path}
              path={route === '/' ? '/' : route.slice(0, -1)}
              element={
                isHome ? (
                  <Home page={p} lang={p.lang} dark={dark} />
                ) : isEstimator ? (
                  <EstimatorPage page={p} />
                ) : isSecurity ? (
                  <SecurityPage page={p} />
                ) : isServices ? (
                  <ServicesPage page={p} lang={p.lang} />
                ) : (
                  <Page page={p} lang={p.lang} />
                )
              }
            />
          )
        })}
        <Route path="*" element={<NotFound page={p404} />} />
      </Routes>
      <Footer lang={lang} />
      <div className="scroll-progress" data-progress aria-hidden="true" />
    </>
  )
}

export default function App({ ssrLocation }: { ssrLocation?: string }) {
  if (ssrLocation !== undefined) {
    return (
      <StaticRouter location={ssrLocation}>
        <Shell />
      </StaticRouter>
    )
  }
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
