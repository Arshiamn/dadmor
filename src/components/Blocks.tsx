/* Block renderer — turns the extracted v4 page blocks into React.
   Copy is verbatim (inner HTML preserved). Presentation is v5. */
import { useId, useState } from 'react'
import type { Block, Lang } from '../lib/site'
import { slogan } from '../lib/slogans'
import DotStream from './DotStream'
import ContactForm from './ContactForm'
import { ChannelLinks, CHANNEL_CAPTIONS } from './Chrome'

function stripH3(html: string): string {
  return html.replace(/<h3[^>]*>.*?<\/h3>/s, '').trim()
}

function FaqItem({ q, aHtml }: { q: string; aHtml: string }) {
  // The HOME faq is static in v4 (h3 + answer, always visible) — only the
  // FAQ page is an accordion. Keep it that way.
  return (
    <div className="home-faq-item">
      <h3>{q}</h3>
      <div dangerouslySetInnerHTML={{ __html: stripH3(aHtml) }} />
    </div>
  )
}

function FaqGroup({ cls, inner, lang }: { cls: string; inner: Block[]; lang: Lang }) {
  // The FAQ page items are v4 accordions: h3.faq-q > button + .faq-a,
  // hidden until opened (the +/- indicator comes from legacy CSS).
  // v33: the question heading is an h2, not h3 — the FAQ page has no
  // h2 above the items, so h3 skipped a level (R-39). .faq-q is
  // class-based (margin 0, body size), so the look is unchanged.
  // The button now also carries aria-controls + the answer region an
  // id (useId), so assistive tech can find the panel.
  const [open, setOpen] = useState(false)
  const answerId = useId()
  const heading = inner.find((b) => b.t === 'heading')
  const q = String((heading?.html as string) ?? '').replace(/<[^>]+>/g, '')
  const answer = inner.filter((b) => b !== heading)
  return (
    <div className={cls}>
      <h2 className="faq-q">
        <button type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setOpen((v) => !v)}>
          {q}
        </button>
      </h2>
      {open && (
        <div className="faq-a" id={answerId}>
          {answer.map((ib, i) => renderBlock(ib, i, lang))}
        </div>
      )}
    </div>
  )
}

export function renderBlock(b: Block, key: number, lang: Lang): React.ReactNode {
  switch (b.t) {
    case 'heading': {
      const level = (b.level as number) ?? 2
      const html = slogan(b.html as string)
      // v4 leaves some headings empty (the finder h2); an empty heading
      // is a defect in the DOM, never content — skip it.
      if (!html.replace(/<[^>]+>/g, '').trim()) return null
      if (level === 2) {
        /* .glitchable restored 2026-11-06 (owner order: the glitch effects
           are back — «خیلی خوب بودن»). The v7 removal had fixed the
           Finder-heading double-vision, but the owner prefers the glitch;
           it stays on h1, eyebrow, lion AND section headings. */
        return <h2 key={key} className="glitchable" dangerouslySetInnerHTML={{ __html: html }} />
      }
      return <h3 key={key} dangerouslySetInnerHTML={{ __html: html }} />
    }
    case 'p': {
      const html = (b.html as string) ?? ''
      if (!html.replace(/<[^>]+>/g, '').trim() && !/<(img|svg|video|iframe)/.test(html)) return null
      return <p key={key} dangerouslySetInnerHTML={{ __html: html }} />
    }
    case 'list': {
      const items = b.items as string[]
      const Tag = b.ordered ? 'ol' : 'ul'
      /* The extractor drops the <ul>/<li> classes, so the legacy row
         styles never applied: the home services rendered as a plain
         bulleted list (the violet dots in the owner's screenshot) with no
         borders, no padding and no 2-column field — and the process steps
         lost their step styling too. Restore the classes by content:
         service rows carry service-row-main, process steps carry step-head.
         Plain content lists keep their bullets/numbers. */
      const isServiceList = items.some((it) => it.includes('service-row-main'))
      const isProcessList = items.some((it) => it.includes('step-head'))
      const ulClass = isServiceList ? 'service-list' : isProcessList ? 'process-list' : undefined
      const liClass = isServiceList ? 'service-row' : isProcessList ? 'process-step' : undefined
      return (
        <Tag key={key} className={ulClass}>
          {items.map((it, i) => (
            <li key={i} className={liClass} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </Tag>
      )
    }
    case 'table': {
      const headers = (b.headers as string[]) ?? []
      const rows = (b.rows as string[][]) ?? []
      return (
        <table key={key}>
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} dangerouslySetInnerHTML={{ __html: h }} />
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} dangerouslySetInnerHTML={{ __html: c }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    case 'cards': {
      const items = (b.items as { html: string }[]) ?? []
      return (
        <div
          key={key}
          dangerouslySetInnerHTML={{ __html: items.map((i) => i.html).join('') }}
        />
      )
    }
    case 'faq-item':
      return <FaqItem key={key} q={b.q as string} aHtml={b.a_html as string} />
    case 'divider':
      return <DotStream key={key} />
    case 'group': {
      const cls = (b.class as string) ?? ''
      const inner = (b.blocks as Block[]) ?? []
      // The contact form's fallback + success notices are state UI of the
      // React form now (ContactForm shows its own success/failure panels);
      // rendering them always made the page claim "the form is not
      // connected" (QA FAIL), so they are not rendered at all.
      if (cls.includes('form-fallback') || cls.includes('form-success')) {
        return null
      }
      // The FAQ page items are group.faq-item (heading + faq-a group), not
      // faq-item blocks — render them as the same accordion as the home FAQ.
      if (cls.split(' ').includes('faq-item')) {
        return <FaqGroup key={key} cls={cls} inner={inner} lang={lang} />
      }
      /* The contact side column ("other ways") gets the channel pills right
         after its heading — the contact options are not footer-only.
         v27 (owner order 2026-11-06): each pill carries its purpose text
         directly underneath it (no channel name — the pill already names
         it), and the three items stack VERTICALLY: Email, then Telegram,
         then WhatsApp. The three purpose sentences that used to sit below
         the pills are removed from the contact data — the captions carry
         that text now, so it is not duplicated. */
      const side = cls.includes('contact-side') ? (
        <ChannelLinks captions={CHANNEL_CAPTIONS[lang]} layout="vertical" />
      ) : null
      const rendered = inner.map((ib, i) => renderBlock(ib, i, lang))
      return (
        <section key={key} className={cls}>
          {rendered[0]}
          {side}
          {rendered.slice(1)}
        </section>
      )
    }
    case 'cta': {
      const href = b.href as string
      const external = /^https?:/.test(href)
      return external ? (
        <a key={key} className={b.class as string} href={href} target="_blank" rel="noreferrer">
          {b.text as string}
        </a>
      ) : (
        <a key={key} className={b.class as string} href={href}>
          {b.text as string}
        </a>
      )
    }
    case 'raw': {
      const html = (b.html as string) ?? ''
      // The service-finder JSON payload and no-JS notes are handled by
      // React components instead; never render <script> tags.
      // The finder root div is also React-managed (ServicesPage).
      if (/^\s*<(script|noscript)/i.test(html)) return null
      if (html.includes('data-finder')) return null
      /* The contact form lives in the data as raw v4 <form> markup. Render
         the React form instead — same field names, same copy, but it
         submits with fetch and shows an inline success message rather than
         reloading to an empty form. The prerender still contains the form
         markup, so Netlify Forms detection registers it on deploy. */
      if (html.trim().startsWith('<form') && html.includes('data-contact-form')) {
        return <ContactForm key={key} lang={lang} />
      }
      /* The wrapper div carries NO class: the extractor stored the root
         element's class on the block as well as in the html, so the old
         code rendered e.g. <div class="service-link"><a
         class="service-link"> — a pill inside a pill, the "double button"
         the owner reported (also on work-item cards and the copy button).
         The inner element already carries every class it needs. */
      return <div key={key} dangerouslySetInnerHTML={{ __html: html }} />
    }
    default:
      return null
  }
}

export default function Blocks({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  return <>{blocks.map((b, i) => renderBlock(b, i, lang))}</>
}
