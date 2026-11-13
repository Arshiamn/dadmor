/* Home page: hero + the extracted sections. */
import type { PageData, Lang } from '../lib/site'
import Hero from '../components/Hero'
import Blocks from '../components/Blocks'
import { ChannelLinks, CHANNEL_CAPTIONS } from '../components/Chrome'

export default function Home({ page, lang, dark }: { page: PageData; lang: Lang; dark: boolean }) {
  return (
    <main>
      <Hero page={page} lang={lang} dark={dark} />
      <Blocks blocks={page.blocks} lang={lang} />
      {/* Contact options also live under the home contact strip — not
          footer-only. Each pill carries its purpose text directly
          underneath it (v25, owner order 2026-11-06); the channel name
          is NOT repeated in the caption — the pill already names it.
          The single caption line under the whole row (v24) is gone.
          The captions live in CHANNEL_CAPTIONS (Chrome.tsx), shared
          with the contact page so the wording stays identical. */}
      <div className="home-channels">
        <ChannelLinks captions={CHANNEL_CAPTIONS[lang]} />
      </div>
    </main>
  )
}
