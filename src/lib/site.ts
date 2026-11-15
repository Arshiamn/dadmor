/* Site data: the 35 v4 pages extracted verbatim into JSON
   (scripts/extract.py), plus the footer chrome. Copy is preserved exactly;
   the React layer only changes presentation. */

export type Lang = 'fa' | 'en'

export interface Block {
  t: string
  [key: string]: unknown
}

export interface PageData {
  path: string
  lang: Lang
  title: string
  description: string
  canonical: string
  hreflang: Record<string, string>
  og: Record<string, string>
  jsonld: unknown[]
  hero: {
    t: string
    eyebrow: string
    h1_html: string
    h1_text: string
    paragraphs: string[]
    ctas: { text: string; href: string; class: string }[]
    lion_html: string
  } | null
  blocks: Block[]
}

export interface ChromeData {
  columns: { heading: string; links: { text: string; href: string }[] }[]
  contacts: { text: string; href: string }[]
  tagline: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageModules = import.meta.glob<any>('../data/pages/*.json', { eager: true })

export const PAGES: PageData[] = Object.values(pageModules).map((m) => m.default as PageData)

// Admin drafts are intentionally local to this browser; production content
// continues to come from the checked-in JSON files and the normal build.
if (typeof window !== 'undefined') {
  try {
    const drafts = JSON.parse(localStorage.getItem('dadmor-admin-pages-v1') ?? '{}') as Record<string, PageData>
    for (const page of PAGES) {
      const draft = drafts[page.path]
      if (draft && draft.lang === page.lang && Array.isArray(draft.blocks)) Object.assign(page, draft)
    }
    const accent = localStorage.getItem('dadmor-accent')
    if (accent === 'blue' || accent === 'red' || accent === 'violet') document.documentElement.dataset.accent = accent
  } catch {
    // Ignore malformed local data and continue with the bundled site content.
  }
}

export const PAGES_BY_PATH: Record<string, PageData> = Object.fromEntries(
  PAGES.map((p) => [pagePath(p.path), p]),
)

/** "services/website-building/index.html" -> "/services/website-building/" */
export function pagePath(rel: string): string {
  if (rel === 'index.html') return '/'
  if (rel === '404.html') return '/404.html'
  return '/' + rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')
}

export function pageForRoute(route: string): PageData | undefined {
  const norm = route === '' ? '/' : route.endsWith('/') ? route : route + '/'
  return PAGES_BY_PATH[norm] ?? PAGES_BY_PATH[route]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import chromeJson from '../data/chrome.json'
export const CHROME = chromeJson as unknown as Record<Lang, ChromeData>

/** Nav labels, from the extracted v4 header (exact wording). */
export const NAV: Record<Lang, { text: string; href: string }[]> = {
  fa: [
    { text: 'خدمت ها', href: '/services/' },
    { text: 'فرایند کار', href: '/process/' },
    { text: 'نمونه کار', href: '/work/' },
    { text: 'درباره ما', href: '/about/' },
    { text: 'پرسش ها', href: '/faq/' },
    { text: 'تماس', href: '/contact/' },
  ],
  en: [
    { text: 'Services', href: '/en/services/' },
    { text: 'Process', href: '/en/process/' },
    { text: 'Work', href: '/en/work/' },
    { text: 'About', href: '/en/about/' },
    { text: 'FAQ', href: '/en/faq/' },
    { text: 'Contact', href: '/en/contact/' },
  ],
}

export const CTA_ESTIMATOR: Record<Lang, { text: string; href: string }> = {
  fa: { text: 'برآوردگر پروژه', href: '/tools/estimator/' },
  en: { text: 'Project estimator', href: '/en/tools/estimator/' },
}

export const THEME_LABELS: Record<Lang, { toDark: string; toLight: string; openMenu: string; closeMenu: string }> = {
  fa: {
    toDark: 'تغییر به حالت تاریک',
    toLight: 'تغییر به حالت روشن',
    openMenu: 'باز کردن منو',
    closeMenu: 'بستن منو',
  },
  en: {
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
}

/** The equivalent page in the other language. */
export function otherLangPath(path: string, lang: Lang): string {
  if (lang === 'fa') {
    return path === '/' ? '/en/' : '/en' + path
  }
  return path === '/en/' ? '/' : path.replace(/^\/en/, '') || '/'
}

/** Contact values (owner-confirmed). */
export const CONTACT = {
  whatsapp: 'https://wa.me/989391400826',
  whatsappLabel: '+98 939 140 0826',
  email: 'hello@dadmor.com',
  telegram: 'https://t.me/dadmor_ai',
  telegramHandle: '@dadmor_ai',
  siteUrl: 'https://dadmor.netlify.app',
}
