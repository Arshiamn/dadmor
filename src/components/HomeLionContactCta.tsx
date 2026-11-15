import type { Lang } from '../lib/site'

const LABEL: Record<Lang, string> = {
  fa: 'رفتن به فرم تماس',
  en: 'Go to Contact Form',
}

/** The supplied lion states are layered into a single button background composition. */
export default function HomeLionContactCta({
  href,
  lang,
}: {
  href: string
  lang: Lang
}) {
  return (
    <a className="contact-lion-cta" href={href} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <span className="contact-lion-composition" aria-hidden="true">
        <span className="contact-lion-art">
          <span className="contact-lion-state contact-lion-closed" />
          <span className="contact-lion-state contact-lion-open" />
        </span>
      </span>
      <svg
        className="contact-lion-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12h14m-7-7 7 7-7 7" />
      </svg>
      <span className="contact-lion-label">{LABEL[lang]}</span>
    </a>
  )
}
