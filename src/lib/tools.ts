/* Tool data loaders — the estimator / security-check / finder JSON payloads
   extracted verbatim from the v4 pages (scripts/extract.py + the JSON
   extraction in src/data/tools/). Bilingual ([fa, en] pairs) everywhere. */

import type { Lang } from './site'

export type { Lang } from './site'

export type Bilingual = [string, string]

export function t(pair: Bilingual | string, lang: Lang): string {
  if (typeof pair === 'string') return pair
  return lang === 'fa' ? pair[0] : pair[1]
}

export interface EstimatorData {
  lang: string
  services: Record<
    string,
    {
      name: string
      features: string[]
      integrations: boolean
      content: boolean
      security: boolean
      band: [number, number] | null
      feat_pts: [number, number] | null
    }
  >
  integrations: string[]
  content: string[]
  types: string[]
  security: string[]
  deliverables: Record<string, string[]>
  inputs: Record<string, string>
  strings: Record<string, string>
  bandNote: string
  roughNote: string
  responseLine: string
}

export interface SecurityData {
  lang: string
  questions: { n: number; q: Bilingual }[]
  actions: { priority: number; from_q: number; action: Bilingual }[]
  options: string[]
  warnings: string[]
  strings: Record<string, string | string[]>
}

export interface FinderData {
  lang: string
  questions: { q: Bilingual; options: Bilingual[]; multi?: boolean }[]
  services: Record<string, string>
  urls: Record<string, string>
  estimatorUrl: string
  securityUrl: string
  aboutCta: string
  scopeCta: string
  back: string
  nextLabel: string
  reasons: Record<string, string>
  result: { h3: string[]; contradiction: string; footer: string; restart: string }
  why: string
  securityName: string
  securityCta: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toolModules = import.meta.glob<any>('../data/tools/*.json', { eager: true })

function load<T>(name: string): T {
  const key = Object.keys(toolModules).find((k) => k.endsWith(`/${name}.json`))
  if (!key) throw new Error(`tool data missing: ${name}`)
  return toolModules[key].default as T
}

export function estimatorData(lang: Lang): EstimatorData {
  return load<EstimatorData>(lang === 'fa' ? 'tools__estimator__index' : 'en__tools__estimator__index')
}

export function securityData(lang: Lang): SecurityData {
  return load<SecurityData>(lang === 'fa' ? 'tools__security-check__index' : 'en__tools__security-check__index')
}

export function finderData(lang: Lang): FinderData {
  return load<FinderData>(lang === 'fa' ? 'services__index' : 'en__services__index')
}

/** Persian digits for fa, Latin digits for en (v4 faDigits). */
export function faDigits(n: number | string, lang: Lang): string {
  const s = String(n)
  if (lang !== 'fa') return s
  return s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
