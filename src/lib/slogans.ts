/* Gen Z slogan overrides (owner order, 2026-11-05).
   ONLY slogan-adjacent lines change: the hero eyebrow, the hero CTA labels,
   and the home contact-strip heading. The tagline («ساختاری که می ماند» /
   "A structure that lasts") and ALL other approved copy stay word-for-word.
   Every change is listed here so the delivery notes can quote it.
   Spelling (owner order 2026-11-06 00:49, revoking the 2026-11-05 22:32
   half-space exception): NO half-space (ZWNJ) anywhere — the slogans
   are colloquial with plain spaces («پروژه ت»، «می سازیم»، «می کنیم»).
   EXCEPTION (owner order 2026-11-06 00:59, "فقط همین شعار چسبیده
   باشه"): the home contact-strip heading alone is JOINED, no space
   and no ZWNJ — «پروژت رو بگو، بقیش با ما». The tagline and the
   other three slogans stay spaced.
   EXCEPTION 2 (owner order 2026-11-06 07:25): the hero primary CTA is
   ALSO joined — «اسکوپ پروژت رو بساز», not «اسکوپ پروژه ت رو بساز»
   (spaced «پروژه ت» is wrong). So TWO slogans are joined now: the
   contact heading and the hero primary CTA. The eyebrow and the
   secondary CTA stay spaced.
   The faBefore strings must match the (spaced) data exactly. */

export interface SloganChange {
  where: string
  faBefore: string
  faAfter: string
  enBefore: string
  enAfter: string
}

export const SLOGAN_CHANGES: SloganChange[] = [
  {
    where: 'hero eyebrow',
    faBefore: 'استودیوی مستقل و فنی طراحی و ساخت دیجیتال',
    faAfter: 'ساختار می سازیم، نه فقط سایت',
    enBefore: 'An independent, technical design-and-build studio',
    enAfter: 'We build structure, not just websites.',
  },
  {
    where: 'hero primary CTA',
    faBefore: 'برآورد اسکوپ بگیرید',
    faAfter: 'اسکوپ پروژت رو بساز',
    enBefore: 'Scope your project',
    enAfter: 'Scope your project',
  },
  {
    where: 'hero secondary CTA',
    faBefore: 'خدمت ها را ببینید',
    faAfter: 'ببین چی کار می کنیم',
    enBefore: 'See the services',
    enAfter: 'See what we do',
  },
  {
    where: 'home contact heading',
    faBefore: 'پروژه تان را در چند خط بنویسید',
    faAfter: 'پروژت رو بگو، بقیش با ما',
    enBefore: 'Describe your project in a few lines',
    enAfter: 'Tell us your project — the rest is on us.',
  },
]

/** Replace a slogan line with its Gen Z version (exact match, either lang). */
export function slogan(text: string): string {
  for (const c of SLOGAN_CHANGES) {
    if (text === c.faBefore) return c.faAfter
    if (text === c.enBefore) return c.enAfter
  }
  return text
}
