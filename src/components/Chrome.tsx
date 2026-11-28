/* Site chrome: sticky glass header + footer, built as React from the
   extracted v4 chrome (exact labels/links). The HUD corner brackets are
   NOT rendered (v4 bug B8 — the stray L-shaped lines). */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CHROME, CONTACT, CTA_ESTIMATOR, NAV, THEME_LABELS, otherLangPath, type Lang } from '../lib/site'
import { LionIcon, LionWordmark } from './Lion'

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/* Small nav icons (same hand-drawn stroke style as the channel icons).
   Keyed by the page the link points to; the CTA keeps its button look. */
function NavIcon({ href }: { href: string }) {
  const key = href.includes('/services/')
    ? 'services'
    : href.includes('/process/')
      ? 'process'
      : href.includes('/work/')
        ? 'work'
        : href.includes('/about/')
          ? 'about'
          : href.includes('/faq/')
            ? 'faq'
            : 'contact'
  const paths: Record<string, ReactNode> = {
    services: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
    process: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
      </>
    ),
    work: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4.5 18 5-5 3 3 3.5-3.5 3.5 3.5" />
      </>
    ),
    about: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5M12 7.5h.01" />
      </>
    ),
    faq: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1 1-1.1 1.9M12 17h.01" />
      </>
    ),
    contact: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </>
    ),
  }
  return (
    <span className="nav-ico" aria-hidden="true">
      <svg {...ICON_PROPS}>{paths[key]}</svg>
    </span>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <path d="M5 5l14 14M19 5 5 19" />
        </>
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  )
}

/* Channel purpose texts (v25/v27, owner order 2026-11-06): one caption
   per button, WITHOUT the channel name — the pill already names it.
   Shared by the home strip (Home.tsx) and the contact page (Blocks.tsx,
   vertical layout), so the wording stays identical in both places. */
export const CHANNEL_CAPTIONS: Record<Lang, { email: string; telegram: string; whatsapp: string }> = {
  fa: {
    email: 'برای پیش‌پیمان، فایل و هر چیزی که باید مکتوب بماند.',
    telegram: 'برای پرسش کوتاه.',
    whatsapp: 'برای پرسش کوتاه و هماهنگی زمان گفت وگو.',
  },
  en: {
    email: 'For briefs, files and anything that should stay in writing.',
    telegram: 'For short questions.',
    whatsapp: 'For short questions and scheduling a conversation.',
  },
}

/* Channel links with their designed icons — used in the footer, on the
   contact page and under the home contact strip (not footer-only).
   `captions` (home strip only, v25, owner order 2026-11-06): when given,
   each pill gets its purpose text directly underneath it — the channel
   name is NOT repeated in the caption, the pill already names it. The
   single caption line under the whole row (v24) was removed; the owner
   called it lifeless and wants one caption per button.
   `layout` (v27): 'horizontal' (default — footer, home strip) or
   'vertical' (contact page — Email, then Telegram, then WhatsApp, each
   with its caption underneath). */
export function ChannelLinks({
  captions,
  layout = 'horizontal',
  iconOnly = false,
  lang = 'en',
}: {
  captions?: { email: string; telegram: string; whatsapp: string }
  layout?: 'horizontal' | 'vertical'
  iconOnly?: boolean
  /* Footer contact items (owner order 2026-11-26): in the FA footer
     the channel pills carry NO label word at all, only the icon and
     the value itself (address/handle/number) in a dir="ltr" span;
     the Persian labels tried earlier («ایمیل»، «تلگرام»، «واتساپ»)
     made the mixed-direction lines look messier. The EN footer keeps
     its English labels. Other call sites keep the default. */
  lang?: Lang
}) {
  const fa = lang === 'fa'
  const email = (
    <a className="channel-pill" href={`mailto:${CONTACT.email}`} aria-label={iconOnly ? (CONTACT.email) : undefined}>
      <EmailIcon />
      {!iconOnly && <span dir="ltr">{CONTACT.email}</span>}
    </a>
  )
  const telegram = (
    <a className="channel-pill" href={CONTACT.telegram} target="_blank" rel="noreferrer" aria-label={iconOnly ? (CONTACT.telegramHandle) : 'Telegram'}>
      <TelegramIcon />
      {!iconOnly && (fa
        ? <span dir="ltr">{CONTACT.telegramHandle}</span>
        : <span dir="ltr">Telegram {CONTACT.telegramHandle}</span>)}
    </a>
  )
  const whatsapp = (
    <a className="channel-pill" href={CONTACT.whatsapp} target="_blank" rel="noreferrer" aria-label={iconOnly ? CONTACT.whatsappLabel : 'WhatsApp'}>
      <WhatsAppIcon />
      {/* dir="ltr": the phone number's digit groups are reordered by
          the bidi algorithm in an RTL page ("0826 140 939 98+");
          forcing LTR keeps "+98 939 140 0826" in order. Owner
          report 2026-11-06 01:10. */}
      {!iconOnly && (fa
        ? <span dir="ltr">{CONTACT.whatsappLabel}</span>
        : <span dir="ltr">WhatsApp {CONTACT.whatsappLabel}</span>)}
    </a>
  )
  const rowClass = layout === 'vertical' ? 'channel-row channel-column' : 'channel-row'
  if (!captions) {
    return (
      <div className={rowClass}>
        {email}
        {telegram}
        {whatsapp}
      </div>
    )
  }
  return (
    <div className={rowClass}>
      <div className="channel-item">
        {email}
        <span className="channel-caption">{captions.email}</span>
      </div>
      <div className="channel-item">
        {telegram}
        <span className="channel-caption">{captions.telegram}</span>
      </div>
      <div className="channel-item">
        {whatsapp}
        <span className="channel-caption">{captions.whatsapp}</span>
      </div>
    </div>
  )
}

/* Designed channel icons (hand-drawn for dadmor, inline SVG, no emoji,
   no stock-icon-library look). v5 §5.9. */
export function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 3.5 10.2 14.3" />
      <path d="M21 3.5 14.8 21l-4.6-6.7L21 3.5z" />
      <path d="M21 3.5 3.5 10.2l6.7 4.1L21 3.5z" />
    </svg>
  )
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z" />
      <path d="M9 9.2c.5 2.4 2.4 4.3 4.8 4.8l.9-1.2 1.8.9c-.3 1.1-1.4 1.6-2.5 1.2-2.9-.9-5.2-3.2-6.1-6.1-.4-1.1.1-2.2 1.2-2.5l.9 1.8-1 1.1z" />
    </svg>
  )
}

export function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="icon-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M20.4 14.2A8.3 8.3 0 0 1 9.8 3.6a8.3 8.3 0 1 0 10.6 10.6z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="icon-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function Header({ lang, theme, onToggleTheme }: { lang: Lang; theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  // v33: Escape closes the mobile menu and returns focus to the menu
  // button (R-39 — the menu already closed on link click and carried
  // correct aria-expanded/aria-controls, but had no keyboard close).
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])
  const labels = THEME_LABELS[lang]
  const homeHref = lang === 'fa' ? '/' : '/en/'
  // The language switch must keep the query string (e.g. ?service= on the
  // estimator) — the v5 QA caught it being dropped.
  const otherHref = otherLangPath(loc.pathname === '' ? '/' : loc.pathname, lang) + loc.search
  const cta = CTA_ESTIMATOR[lang]
  return (
    <header className="site-header">
      <nav className="nav container" aria-label={lang === 'fa' ? 'منوی اصلی' : 'Main menu'}>
        <Link className="brand" to={homeHref} aria-label={lang === 'fa' ? 'dadmor، صفحه اصلی' : 'dadmor, home'}>
          <LionIcon breathing={false} />
          <LionWordmark />
        </Link>
        <ul className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
          {NAV[lang].map((l) => (
            <li key={l.href}>
              <Link to={l.href} onClick={() => setMenuOpen(false)}>
                <NavIcon href={l.href} />
                {l.text}
              </Link>
            </li>
          ))}
          <li className="nav-cta-item">
            <Link className="btn btn-primary btn-small" to={cta.href} onClick={() => setMenuOpen(false)}>
              {cta.text}
            </Link>
          </li>
        </ul>
        <div className="nav-actions">
          <nav className="lang-switch" aria-label={lang === 'fa' ? 'زبان' : 'Language'}>
            <Link to={lang === 'fa' ? loc.pathname + loc.search : otherHref} hrefLang="fa" lang="fa" aria-current={lang === 'fa' ? 'true' : undefined}>
              FA
            </Link>
            <span className="lang-sep" aria-hidden="true" />
            <Link to={lang === 'en' ? loc.pathname + loc.search : otherHref} hrefLang="en" lang="en" aria-current={lang === 'en' ? 'true' : undefined}>
              EN
            </Link>
          </nav>
          <button
            type="button"
            className="theme-toggle"
            data-state={theme}
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? labels.toLight : labels.toDark}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="menu-btn"
            ref={menuBtnRef}
            aria-expanded={menuOpen}
            aria-controls="nav-links"
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MenuIcon open={menuOpen} />
            <span className="visually-hidden">{menuOpen ? labels.closeMenu : labels.openMenu}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}

export function Footer({ lang }: { lang: Lang }) {
  const chrome = CHROME[lang]
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-cols">
          {chrome.columns.map((col) => (
            <div key={col.heading}>
              <h2 className="footer-h">{col.heading}</h2>
              <ul>
                {col.links.map((l) => {
                  // Contact links (WhatsApp number, email, Telegram) are
                  // Latin text with digits — in an RTL footer the bidi
                  // algorithm scrambles the phone-number groups, so force
                  // LTR on the link text. Owner report 2026-11-06 01:10.
                  const contact = /^(https:\/\/wa\.me\/|mailto:|https:\/\/t\.me\/)/.test(l.href)
                  return (
                    <li key={l.href}>
                      <Link to={l.href}>{contact ? <span dir="ltr">{l.text}</span> : l.text}</Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-contact">
          <h2 className="footer-h">{lang === 'fa' ? 'ارتباط' : 'Contact'}</h2>
          {/* Aesthetic fix 2026-11-16: was iconOnly — three bare icons with
              no visible address/handle/number, so visitors had to click
              blind. Show the text labels, stacked vertically. */}
          <ChannelLinks layout="vertical" lang={lang} />
        </div>
        {/* Brand placement (owner order 2026-11-26, after checking
            comparable studios): the logo + tagline no longer sit as a
            block in the columns row; they live in the bottom bar next
            to the © line, the pattern Work & Co and Websima use. */}
        <div className="footer-bottom">
          <span className="footer-brandline">
            <span className="footer-lockup">
              <LionIcon breathing={false} />
              <LionWordmark />
            </span>
            <span className="tagline">{chrome.tagline}</span>
          </span>
          <p className="footer-note">
            © dadmor {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
