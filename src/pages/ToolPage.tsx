/* Tool pages: the extracted blocks (page head, rules table) + the React tool
   in place of the v4 tool-layout group (which only held a noscript). */
import type { PageData, Lang } from '../lib/site'
import Blocks, { renderBlock } from '../components/Blocks'
import Estimator from '../components/tools/Estimator'
import SecurityCheck from '../components/tools/SecurityCheck'
import ServiceFinder from '../components/tools/ServiceFinder'

export function EstimatorPage({ page }: { page: PageData }) {
  return (
    <main>
      {page.blocks.map((b, i) => {
        if (b.t === 'group' && String(b.class || '').includes('tool-layout')) {
          // Keep the group's own class (container tool-layout) — dropping it
          // made the tool full-bleed and clipped at the right edge (QA FAIL).
          return (
            <div key={i} className={String(b.class)}>
              <Estimator lang={page.lang} />
            </div>
          )
        }
        return renderBlock(b, i, page.lang)
      })}
    </main>
  )
}

export function SecurityPage({ page }: { page: PageData }) {
  return (
    <main>
      {page.blocks.map((b, i) => {
        if (b.t === 'group' && String(b.class || '').includes('tool-layout')) {
          return (
            <div key={i} className={String(b.class)}>
              <SecurityCheck lang={page.lang} />
            </div>
          )
        }
        return renderBlock(b, i, page.lang)
      })}
    </main>
  )
}

/* Services index: the page blocks + the finder at the #finder anchor
   (the v4 finder root div is skipped by the Blocks renderer).
   The finder title is the approved Stage B copy — v4 left the h2/p empty,
   so it is restored here verbatim, not invented. */
const FINDER_HEAD = {
  fa: {
    h2: 'نمی دانید از کدام شروع کنید؟',
    p: 'شش سؤال، یک پیشنهاد اصلی و یک پیشنهاد دوم، با دلیل هر کدام. پاسخ ها فقط در مرورگر شما می ماند و جایی ذخیره یا ارسال نمی شود. این یک نمونه اولیه است.',
  },
  en: {
    h2: 'Not sure where to start?',
    p: 'Six questions, one primary and one secondary suggestion, each with a reason. Your answers stay in your browser and are not stored or sent. This is a prototype.',
  },
} as const

export function ServicesPage({ page, lang }: { page: PageData; lang: Lang }) {
  const head = FINDER_HEAD[lang]
  // The finder group in the page data holds the (empty) v4 heading/p and
  // the JSON payload — the finder itself is rendered below, so drop it.
  const blocks = page.blocks.filter(
    (b) => !(b.t === 'group' && String(b.class || '').split(' ').includes('finder')),
  )
  return (
    <main>
      <Blocks blocks={blocks} lang={lang} />
      <section className="finder container" id="finder">
        {/* .glitchable restored 2026-11-06 (owner order: glitch is back). */}
        <h2 className="glitchable">{head.h2}</h2>
        <p>{head.p}</p>
        <div className="finder-app">
          <ServiceFinder lang={lang} />
        </div>
      </section>
    </main>
  )
}
