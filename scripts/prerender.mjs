#!/usr/bin/env node
/* Prerender the 35 routes to static HTML for Netlify drag-drop deploy.
   Run AFTER `npm run build` (client) and `npm run build:ssr` (server bundle).
   Each route gets its own index.html with the right lang/dir, title, meta
   description, canonical, hreflang, OG tags and JSON-LD, so the site works
   with JS disabled and Netlify Forms detection sees the contact form. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

const { render } = await import(join(ROOT, 'dist-server/entry-server.js'))
const site = JSON.parse(readFileSync(join(ROOT, 'src/data/site.json'), 'utf-8'))

function pagePath(rel) {
  if (rel === 'index.html') return '/'
  if (rel === '404.html') return '/404.html'
  return '/' + rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')
}

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function headFor(page, route) {
  const lang = page.lang
  const dir = lang === 'fa' ? 'rtl' : 'ltr'
  const title = esc(page.title)
  const desc = esc(page.description)
  const canon = esc(page.canonical || `https://dadmor.netlify.app${route}`)
  const hreflang = Object.entries(page.hreflang || {})
    .map(([hl, href]) => `<link rel="alternate" hreflang="${hl}" href="${esc(href)}" />`)
    .join('\n    ')
  const og = Object.entries(page.og || {})
    .map(([k, v]) => `<meta property="og:${esc(k)}" content="${esc(v)}" />`)
    .join('\n    ')
  const twitterLines = [
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
  ]
  if (page.og && page.og.image) {
    twitterLines.push(`<meta name="twitter:image" content="${esc(page.og.image)}" />`)
  }
  const twitter = twitterLines.join('\n    ')
  const jsonld = (page.jsonld || [])
    .map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`)
    .join('\n    ')
  return { lang, dir, title, desc, canon, hreflang, og, twitter, jsonld }
}

let count = 0
const failures = []
for (const p of site.pages) {
  const route = pagePath(p.path)
  const data = JSON.parse(readFileSync(join(ROOT, 'src/data/pages', p.path.replace(/\//g, '__').replace('.html', '.json')), 'utf-8'))
  const head = headFor(data, route)
  let html
  try {
    html = render(route === '/404.html' ? '/__not-found__' : route)
  } catch (e) {
    failures.push([route, String(e)])
    continue
  }
  let out = template
  // Font preloads are language-conditional: an FA page never renders the
  // Latin subsets and an EN page never renders the Arabic ones, so the
  // other language's preloads only compete with real content.
  const dropFonts =
    head.lang === 'fa' ? ['inter-latin-var', 'lalezar-latin'] : ['vazirmatn-arabic-var', 'lalezar-arabic']
  for (const f of dropFonts) {
    out = out.replace(new RegExp(` *<link rel="preload" href="/fonts/${f}\\.woff2"[^>]*>\\n?`), '')
  }
  out = out.replace('<html lang="fa" dir="rtl" data-theme="dark">', `<html lang="${head.lang}" dir="${head.dir}" data-theme="dark">`)
  out = out.replace(
    '<title>dadmor | استودیوی کوچک و فنی برای وب‌سایت، محصول و امنیت</title>',
    `<title>${head.title}</title>`,
  )
  out = out.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${head.desc}" />`,
  )
  if (route === '/404.html') {
    // The 404 page gets no canonical and no social tags, just noindex.
    out = out.replace('</head>', `    <meta name="robots" content="noindex" />\n  </head>`)
  } else {
    out = out.replace(
      '</head>',
      `    <link rel="canonical" href="${head.canon}" />\n    ${head.hreflang}\n    ${head.og}\n    ${head.twitter}\n    ${head.jsonld}\n  </head>`,
    )
  }
  out = out.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  const dest = route === '/404.html' ? join(DIST, '404.html') : join(DIST, route, 'index.html')
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, out, 'utf-8')
  count++
}
console.log(`prerendered ${count} pages`)
if (failures.length > 0) {
  console.log('FAILURES:')
  for (const [r, e] of failures) console.log(' ', r, e.slice(0, 300))
  process.exit(1)
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html missing after prerender')
  process.exit(1)
}
