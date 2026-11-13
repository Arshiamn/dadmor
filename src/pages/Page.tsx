/* Generic page: h1 + breadcrumb (raw blocks) + the extracted sections. */
import { useLocation } from 'react-router-dom'
import type { PageData, Lang } from '../lib/site'
import Blocks from '../components/Blocks'
import { HeroLion } from '../components/Lion'

export default function Page({ page, lang }: { page: PageData; lang: Lang }) {
  return (
    <main>
      <Blocks blocks={page.blocks} lang={lang} />
    </main>
  )
}

/* 404: v4's centred layout (p404-main) + the lion. The generic <main> has
   no class, so the 404 content ran flush to the right edge (QA FAIL).
   v33: the data carries BOTH language blocks (p404-fa + p404-en), so
   both h1s rendered (double h1, R-39). Only the block matching the
   current route's language renders now — /en/* shows EN, everything
   else FA. The static 404.html is prerendered from '/__not-found__'
   (not /en), so it carries the FA block. */
export function NotFound({ page }: { page: PageData }) {
  const loc = useLocation()
  const lang: Lang = loc.pathname.startsWith('/en') ? 'en' : 'fa'
  const blocks = page.blocks.filter((b) => {
    const cls = (b.class as string) ?? ''
    if (!cls.includes('p404-lang')) return true
    return cls.includes(lang === 'fa' ? 'p404-fa' : 'p404-en')
  })
  return (
    <main className="p404-main">
      <span className="lion-stack p404-lion" aria-hidden="true">
        <HeroLion density="d3" breathing={false} />
      </span>
      <Blocks blocks={blocks} lang={lang} />
    </main>
  )
}
