/* Home page: hero + the extracted sections. */
import type { PageData, Lang } from '../lib/site'
import Hero from '../components/Hero'
import Blocks from '../components/Blocks'

export default function Home({ page, lang, dark }: { page: PageData; lang: Lang; dark: boolean }) {
  return (
    <main>
      <Hero page={page} lang={lang} dark={dark} />
      <Blocks blocks={page.blocks} lang={lang} />
    </main>
  )
}
