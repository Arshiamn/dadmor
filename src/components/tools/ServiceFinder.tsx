/* Service finder (prototype) — React port of the v4 logic (main.js),
   weights unchanged: 6 questions -> 1 primary + 1 secondary service.
   "security" maps to the security self-check tool, not a service page. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { finderData, faDigits, t, type Lang } from '../../lib/tools'

export default function ServiceFinder({ lang }: { lang: Lang }) {
  const F = useMemo(() => finderData(lang), [lang])
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({})
  const [q, setQ] = useState(0)
  const qi = lang === 'fa' ? 0 : 1

  const current = F.questions[q]
  const answered = current ? answers[q] : undefined
  const canNext = answered !== undefined && !(Array.isArray(answered) && answered.length === 0)

  const weights = useMemo(() => {
    const w: Record<string, number> = {}
    const add = (s: string, n: number) => {
      w[s] = (w[s] || 0) + n
    }
    const q0 = answers[0] as number | undefined
    const q1 = answers[1] as number | undefined
    const q3 = answers[3] as number | undefined
    const q4 = (answers[4] as number[] | undefined) || []
    if (q0 === 0) add('website-building', 2)
    if (q0 === 1) {
      add('ui-ux-design', 1)
      add('website-building', 1)
    }
    if (q0 === 2) add('business-model', 2)
    if (q0 === 3) add('documentation', 2)
    if (q0 === 4) add('security', 2)
    if (q0 === 5) add('marketing-content', 2)
    if (q1 === 0) add('business-model', 1)
    if (q1 === 2) {
      add('ui-ux-design', 1)
      add('website-building', 1)
    }
    if (q3 === 1) {
      add('website-building', 1)
      add('ui-ux-design', 1)
    }
    if (q3 === 2) add('business-model', 2)
    if (q3 === 3) add('documentation', 2)
    if (q3 === 4) add('security', 1)
    if (q3 === 5) add('marketing-content', 2)
    if (q4.indexOf(1) > -1) add('website-building', 1)
    if (q4.indexOf(2) > -1) add('documentation', 1)
    if (q4.indexOf(3) > -1) add('security', 1)
    if (q4.indexOf(4) > -1) add('marketing-content', 1)
    return w
  }, [answers])

  const result = useMemo(() => {
    if (q < F.questions.length) return null
    const keys = Object.keys(weights).sort((a, b) => weights[b] - weights[a])
    if (!keys.length) return null
    const primary = keys[0]
    /* The Stage B spec promises 1 primary + 1 secondary, but some answer
       sets weight only ONE service (e.g. security alone) — then keys[1] is
       undefined and the second card never renders (QA FAIL). The weights
       themselves stay exactly as v4; only when no second service has any
       weight, the closest companion service is shown as the second
       suggestion. A tie is only reported between two really weighted
       services, never for this fallback pairing. */
    const FALLBACK_SECOND: Record<string, string> = {
      security: 'website-building',
      'website-building': 'ui-ux-design',
      'ui-ux-design': 'website-building',
      'business-model': 'website-building',
      documentation: 'business-model',
      'marketing-content': 'website-building',
    }
    const secondary = keys[1] || FALLBACK_SECOND[primary] || null
    const tie = keys.length > 1 && weights[keys[0]] === weights[keys[1]]
    const reasons: string[] = []
    if (primary === 'security') {
      reasons.push(F.reasons.security)
    } else if (answers[0] !== undefined) {
      reasons.push(F.reasons.need.replace('{need}', F.questions[0].options[answers[0] as number][qi]))
    }
    if (answers[3] === 3) reasons.push(F.reasons.docs)
    if (answers[3] === 5) reasons.push(F.reasons.found)
    if (answers[1] === 0 && answers[3] === 2) reasons.push(F.reasons.noProduct)
    if (((answers[4] as number[]) || []).indexOf(1) > -1) reasons.push(F.reasons.payment)
    if (answers[5] === 1) reasons.push(F.reasons.fixedDate)
    return { primary, secondary, tie, reasons }
  }, [q, weights, F, answers, qi])

  const restart = () => {
    setAnswers({})
    setQ(0)
  }

  if (result) {
    const card = (key: string, heading: string) => {
      const name = key === 'security' ? F.securityName : F.services[key]
      if (key === 'security') {
        return (
          <div key={key} className="find-card">
            <h3>
              {heading}: {name}
            </h3>
            <p>
              <Link className="btn btn-ghost btn-small" to={F.securityUrl}>
                {F.securityCta}
              </Link>
            </p>
          </div>
        )
      }
      return (
        <div key={key} className="find-card">
          <h3>
            {heading}: {name}
          </h3>
          <p>
            <Link className="service-link" to={F.urls[key]}>
              {F.aboutCta.replace('{service}', F.services[key])}
            </Link>
            {' · '}
            <Link className="service-link" to={`${F.estimatorUrl}?service=${key}`}>
              {F.scopeCta}
            </Link>
          </p>
        </div>
      )
    }
    return (
      <div className="find-result">
        {card(result.primary, F.result.h3[0])}
        {result.secondary && card(result.secondary, F.result.h3[1])}
        <h3>{F.why}</h3>
        <ul>
          {result.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        {result.tie && <p className="find-note">{F.result.contradiction}</p>}
        <p className="find-note">{F.result.footer}</p>
        <div className="btn-row">
          <button type="button" className="btn btn-ghost btn-small" onClick={restart}>
            {F.result.restart}
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null
  return (
    <div className="find-q">
      <h3>
        {faDigits(q + 1, lang)}. {t(current.q, lang)}
      </h3>
      <fieldset>
        <legend className="visually-hidden">{t(current.q, lang)}</legend>
        {current.options.map((o, oi) => {
          const checked = current.multi
            ? ((answers[q] as number[] | undefined) || []).indexOf(oi) > -1
            : answers[q] === oi
          return (
            <label key={oi} className="radio">
              <input
                type={current.multi ? 'checkbox' : 'radio'}
                name={`fq${q}`}
                value={oi}
                checked={checked}
                onChange={(e) => {
                  if (current.multi) {
                    const arr = [...((answers[q] as number[] | undefined) || [])]
                    const pos = arr.indexOf(oi)
                    if (e.target.checked && pos === -1) arr.push(oi)
                    if (!e.target.checked && pos > -1) arr.splice(pos, 1)
                    setAnswers({ ...answers, [q]: arr })
                  } else {
                    setAnswers({ ...answers, [q]: oi })
                  }
                }}
              />
              <span>{o[qi]}</span>
            </label>
          )
        })}
      </fieldset>
      <div className="btn-row" style={{ marginTop: 'var(--space-3)' }}>
        {q > 0 && (
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setQ(q - 1)}>
            {F.back}
          </button>
        )}
        <button type="button" className="btn btn-primary btn-small" disabled={!canNext} onClick={() => setQ(q + 1)}>
          {F.nextLabel}
        </button>
      </div>
    </div>
  )
}
