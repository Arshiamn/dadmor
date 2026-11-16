/* Security self-check — React port of the v4 logic (main.js), rules unchanged:
   - 12 questions, answers Yes(2) / Partly(1) / No(0) / Not sure(0), max 24
   - result only when all 12 answered; bands 20-24 / 12-19 / 0-11
   - actions in the verified order (HTTPS is priority 3, manual test last);
     "partly" answers get the finishPrefix; "not sure" questions are listed
   - top 3 actions always shown; the rest only when score < 12
   - never asks passwords / secret URLs / internal IPs; never diagnoses */
import { useMemo, useState } from 'react'
import { securityData, faDigits, t, type Lang } from '../../lib/tools'

const OPTS = [
  { key: 'yes', pts: 2 },
  { key: 'partly', pts: 1 },
  { key: 'no', pts: 0 },
  { key: 'notsure', pts: 0 },
] as const

export default function SecurityCheck({ lang }: { lang: Lang }) {
  const SC = useMemo(() => securityData(lang), [lang])
  const T = SC.strings
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [copied, setCopied] = useState(false)

  const score = useMemo(() => {
    let s = 0
    let answered = 0
    const notSure: number[] = []
    for (const q of SC.questions) {
      const a = answers[q.n]
      if (!a) continue
      answered += 1
      s += OPTS.find((o) => o.key === a)?.pts ?? 0
      if (a === 'notsure') notSure.push(q.n)
    }
    return { score: s, answered, notSure }
  }, [answers, SC])

  const actions = useMemo(() => {
    const list: { priority: number; fromQ: number; text: string; notSure: boolean }[] = []
    for (const act of SC.actions) {
      const a = answers[act.from_q]
      if (!a || a === 'yes') continue
      let text = t(act.action, lang)
      if (a === 'partly') text = (T.finishPrefix as string) + text
      list.push({ priority: act.priority, fromQ: act.from_q, text, notSure: a === 'notsure' })
    }
    return list
  }, [answers, SC, T, lang])

  const band = score.score >= 20 ? (T.band1 as string[]) : score.score >= 12 ? (T.band2 as string[]) : (T.band3 as string[])
  const top3 = actions.slice(0, 3)
  const rest = actions.slice(3)

  const resultText = useMemo(() => {
    const lines: string[] = [(T.result as string).replace('{score}', faDigits(score.score, lang))]
    lines.push(band[0])
    if (!actions.length && score.answered === 12) lines.push(T.allYes as string)
    actions.forEach((a) => lines.push(`${faDigits(a.priority, lang)}. ${a.text}`))
    if (score.notSure.length) {
      lines.push(`${T.checkThis as string}: ${T.checkText as string}`)
      score.notSure.forEach((n) => {
        const q = SC.questions.find((qq) => qq.n === n)
        if (q) lines.push(`- ${t(q.q, lang)}`)
      })
    }
    SC.warnings.forEach((w) => lines.push(w))
    lines.push(T.footer as string)
    return lines.join('\n')
  }, [score, actions, band, T, SC, lang])

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="tool-app">
      {/* Aesthetic fix 2026-11-16: questions in their own column
          (.tool-fields), result (.tool-output) beside them — see
          Estimator.tsx. */}
      <div className="tool-fields">
      {SC.questions.map((q) => (
        <fieldset key={q.n}>
          <legend>
            {faDigits(q.n, lang)}. {t(q.q, lang)}
          </legend>
          {OPTS.map((o, i) => (
            <label key={o.key} className="radio">
              <input
                type="radio"
                name={`q${q.n}`}
                value={o.key}
                checked={answers[q.n] === o.key}
                onChange={() => setAnswers({ ...answers, [q.n]: o.key })}
              />
              <span>{SC.options[i]}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <p className="tool-hint">{(T.progress as string).replace('{n}', faDigits(score.answered, lang))}</p>
      </div>
      <div className="tool-output" aria-live="polite">
        {score.answered < 12 && (
          <p className="brief-empty">{(T.needAll as string).replace('{n}', faDigits(12 - score.answered, lang))}</p>
        )}
        {score.answered === 12 && (
          <>
            <h2>{(T.result as string).replace('{score}', faDigits(score.score, lang))}</h2>
            {/* The band sentence IS the verdict — set it apart so it reads
                as one, and number the actions by their verified priority so
                the order (HTTPS 3rd, manual test last) is checkable. */}
            <p className="band-line">{band[0]}</p>
            {!actions.length && <p>{T.allYes as string}</p>}
            {actions.length > 0 && (
              <>
                <h3>{T.actions as string}</h3>
                <ol>
                  {top3.map((a) => (
                    <li key={a.priority}>
                      {faDigits(a.priority, lang)}. {a.text}
                    </li>
                  ))}
                </ol>
                {score.score < 12 && rest.length > 0 && (
                  <>
                    <p>{T.after3 as string}</p>
                    <ol>
                      {rest.map((a) => (
                        <li key={a.priority}>
                          {faDigits(a.priority, lang)}. {a.text}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </>
            )}
            {score.notSure.length > 0 && (
              <>
                <h3>{T.checkThis as string}</h3>
                <p>{T.checkText as string}</p>
                <ul>
                  {score.notSure.map((n) => {
                    const q = SC.questions.find((qq) => qq.n === n)
                    return q ? <li key={n}>{t(q.q, lang)}</li> : null
                  })}
                </ul>
              </>
            )}
            <div className="notice-note">
              {SC.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
              <p>
                <a href={T.serviceUrl as string}>{T.footer as string}</a>
              </p>
            </div>
            <div className="result-actions">
              <button type="button" className="btn btn-ghost btn-small" onClick={() => window.print()}>
                {lang === 'fa' ? 'چاپ' : 'Print'}
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={copyResult}>
                {lang === 'fa' ? 'کپی متن' : 'Copy text'}
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setAnswers({})}>
                {lang === 'fa' ? 'پاک کردن همه پاسخ ها' : 'Clear all answers'}
              </button>
            </div>
            <p className="tool-hint" aria-live="polite">
              {copied ? (lang === 'fa' ? 'کپی شد.' : 'Copied.') : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
