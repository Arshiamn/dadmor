/* Articles index (2026-11-25 rebuild): the mockup skeleton Roxana
   approved, in dadmor's own design system. Hero masthead with the
   page's real copy plus a working search, category filter pills, and
   a clean card grid. Content is verbatim from ARTICLES_INDEX; the
   static art-path CTA band below stays in the page data. Filtering is
   client-side only: the prerender ships all six cards, so the page
   is complete with JS disabled. */
import { useMemo, useState } from 'react'
import type { Lang } from '../lib/site'
import { ARTICLES_INDEX } from '../data/articlesIndex'

const UI: Record<
  Lang,
  { searchLabel: string; placeholder: string; all: string; empty: string; reset: string }
> = {
  fa: {
    searchLabel: 'جستجوی مقالات',
    placeholder: 'جستجو در مقالات…',
    all: 'همه',
    empty: 'مقاله ای با این جستجو پیدا نشد.',
    reset: 'نمایش همه مقاله ها',
  },
  en: {
    searchLabel: 'Search articles',
    placeholder: 'Search articles…',
    all: 'All',
    empty: 'No article matches this search.',
    reset: 'Show all articles',
  },
}

/* Persian readers type Arabic ي/ك on some keyboards; fold both to the
   Persian letters so search matches the published text either way. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function ArticlesIndex({ lang }: { lang: Lang }) {
  const data = ARTICLES_INDEX[lang]
  const ui = UI[lang]
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(
    () => [...new Set(data.articles.map((a) => a.category))],
    [data],
  )

  const visible = useMemo(() => {
    const q = norm(query)
    return data.articles.filter((a) => {
      if (category && a.category !== category) return false
      if (!q) return true
      return norm(`${a.title} ${a.excerpt} ${a.category}`).includes(q)
    })
  }, [data, query, category])

  const reset = () => {
    setQuery('')
    setCategory(null)
  }

  return (
    <>
      <section className="art-mast container">
        <p className="art-kicker">{data.kicker}</p>
        <h1>{data.h1}</h1>
        <p className="art-manifesto" dangerouslySetInnerHTML={{ __html: data.manifesto }} />
        <div className="art-stats">
          {data.stats.map((s) => (
            <div className="stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="art-search">
          <div className="art-search-box">
            <svg
              className="art-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20.5 20.5-4.6-4.6" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ui.placeholder}
              aria-label={ui.searchLabel}
            />
          </div>
        </div>
      </section>
      <section className="container art-contents">
        <div className="art-filter-row" role="group" aria-label={ui.searchLabel}>
          <button
            type="button"
            className="art-pill"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
          >
            {ui.all}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="art-pill"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>
        {visible.length > 0 ? (
          <div className="art-grid art-grid-index">
            {visible.map((a) => {
              const TitleTag = data.articles.indexOf(a) === 0 ? 'h2' : 'h3'
              return (
                <a className="art-card" href={a.href} key={a.href}>
                  <span className="art-card-media">
                    <img
                      src={a.cover}
                      alt={a.alt}
                      loading={data.articles.indexOf(a) === 0 ? undefined : 'lazy'}
                    />
                    <span className="art-card-chip">{a.category}</span>
                  </span>
                  <span className="art-card-body">
                    <TitleTag className="art-card-title">{a.title}</TitleTag>
                    <span className="art-card-excerpt">{a.excerpt}</span>
                    <span className="art-card-meta">
                      <span>{a.date}</span>
                      <span className="art-card-dot" aria-hidden="true">
                        ·
                      </span>
                      <span>{a.read}</span>
                    </span>
                  </span>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="art-empty">
            <p>{ui.empty}</p>
            <button type="button" className="art-pill art-empty-reset" onClick={reset}>
              {ui.reset}
            </button>
          </div>
        )}
      </section>
    </>
  )
}
