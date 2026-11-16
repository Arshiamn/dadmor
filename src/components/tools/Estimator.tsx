/* Project estimator — React port of the v4 logic (main.js), rules unchanged:
   - per-service band thresholds (svc.band [2,5]); pen-test has NO band
   - featPts from feat_pts [3,7]: <=3 -> 0, <=7 -> 1, else 2
   - integPts: 0 / <=2 -> 1 / >=3 -> 2; contentPts = chosen content value;
     typePts: type "2" -> 0 else 1; total -> S/M/L
   - "Not sure yet" service links to the finder; dot D1 on service, D2 on all answered
   - brief: printable, copyable, clearable; send-brief links to contact */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { estimatorData, faDigits, type Lang } from '../../lib/tools'

interface State {
  service: string | null
  type: string | null
  /* Features/integrations are keyed by INDEX, not by display label: the
     labels differ per language, so label keys broke on language switch
     (the "Web application" checkbox unchecked itself and the EN brief
     printed the Persian label — QA FAIL). FA/EN feature arrays have
     identical lengths and order (verified), so indices are stable. */
  features: Record<number, boolean>
  other: string
  pages: number
  integrations: Record<number, boolean>
  content: string | null
  timeline: string | null
  date: string
  security: string | null
}

const EMPTY: State = {
  service: null,
  type: null,
  features: {},
  other: '',
  pages: 1,
  integrations: {},
  content: null,
  timeline: null,
  date: '',
  security: null,
}

function pointsForCount(n: number, pts: [number, number]): number {
  if (n <= pts[0]) return 0
  if (n <= pts[1]) return 1
  return 2
}

export default function Estimator({ lang }: { lang: Lang }) {
  const E = useMemo(() => estimatorData(lang), [lang])
  const S = E.strings
  const [st, setSt] = useState<State>(EMPTY)
  // Preselect the service from ?service= after mount (client-only; the
  // server render must not read window, or prerendering breaks).
  // Aliases: the v3 QA used ?service=pen-test, which is not a service key.
  const SERVICE_ALIASES: Record<string, string> = {
    'pen-test': 'penetration-testing',
    pentest: 'penetration-testing',
    pen_test: 'penetration-testing',
  }
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const raw = q.get('service')
    const svcKey = raw ? SERVICE_ALIASES[raw] ?? raw : null
    if (svcKey && E.services[svcKey]) setSt({ ...EMPTY, service: svcKey })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [copied, setCopied] = useState(false)
  const [otherOpen, setOtherOpen] = useState(false)

  const svc = st.service ? E.services[st.service] : null

  /* The "pages" feature (website-building) counts once per page, not once:
     its index is 1 in both languages (verified FA/EN parity). */
  const featCount = useMemo(() => {
    let n = Object.keys(st.features).filter((k) => st.features[+k]).length
    if (st.other.trim()) n += 1
    if (st.service === 'website-building' && svc) {
      const pageIdx = svc.features.findIndex(
        (f) => f === 'صفحه خدمت یا محصول (هر کدام یک مورد)' || f === 'Service or product pages (each counts as one)',
      )
      if (pageIdx >= 0 && st.features[pageIdx]) n += st.pages - 1
    }
    return n
  }, [st.features, st.other, st.pages, st.service, svc])

  const computed = useMemo(() => {
    if (!svc || !svc.feat_pts) return null
    const featPts = pointsForCount(featCount, svc.feat_pts)
    const integCount = Object.keys(st.integrations).filter((k) => st.integrations[+k]).length
    const integPts = !svc.integrations ? 0 : integCount === 0 ? 0 : integCount <= 2 ? 1 : 2
    const contentPts = !svc.content || st.content === null ? 0 : parseInt(st.content, 10)
    const typePts = st.type === null ? 0 : st.type === '2' ? 0 : 1
    const total = featPts + integPts + contentPts + typePts
    const band = svc.band ? (total <= svc.band[0] ? 'S' : total <= svc.band[1] ? 'M' : 'L') : null
    return { featPts, integCount, integPts, contentPts, typePts, total, band }
  }, [svc, featCount, st.integrations, st.content, st.type])

  const allAnswered = useMemo(() => {
    if (!svc || !st.service) return false
    return (
      st.type !== null &&
      (!svc.content || st.content !== null) &&
      st.timeline !== null &&
      (!svc.security || st.security !== null)
    )
  }, [svc, st])

  const risks = useMemo(() => {
    const r: string[] = []
    if (st.content === '2') r.push(S.riskContent)
    if (st.content === '1') r.push(S.riskPartly)
    if (st.timeline === 'fixed') r.push(S.riskDate.replace('{date}', st.date || S.notAnswered))
    if (Object.keys(st.integrations).filter((k) => st.integrations[+k]).length >= 3) r.push(S.riskIntegrations)
    if (st.security === '1') r.push(S.riskPentest)
    if (st.security === '2') r.push(S.riskSecurity)
    return r
  }, [st, S])

  /* v33: the chosen-features list is computed ONCE and shared by the
     copy-text brief and the on-screen brief — they used to build it
     twice in two places (a sync risk, not a current bug). The two
     briefs still format digits differently on purpose (copy-text uses
     Latin digits for pasting, the screen brief uses faDigits), so
     only the shared list is unified, not the formatting. */
  const briefFeatures = useMemo(() => {
    if (!svc) return [] as string[]
    const feats = Object.keys(st.features)
      .filter((k) => st.features[+k])
      .map((k) => svc.features[+k] ?? k)
    if (st.other.trim()) feats.push(`${S.other}: "${st.other.trim()}"`)
    return feats
  }, [st.features, st.other, svc])

  const briefText = useMemo(() => {
    if (!st.service || !svc) return ''
    const lines: string[] = []
    const svcName = st.service === 'not-sure' ? S.serviceTbd : svc.name
    lines.push(`${S.title}: ${svcName}`)
    lines.push(`${S.service}: ${svcName}`)
    lines.push(`${S.scope}: ${briefFeatures.length ? briefFeatures.join(' · ') : S.notAnswered}`)
    if (st.service === 'penetration-testing') {
      lines.push(S.fixedScope)
    } else if (computed) {
      lines.push(
        `${S.band}: ${computed.band}. ${S.why}: ${S.features} ${featCount} (${computed.featPts}), ` +
          `${S.integrations} ${computed.integCount} (${computed.integPts}), ` +
          `${S.content} ${st.content === null ? S.notAnswered : E.content[+st.content]} (${computed.contentPts}), ` +
          `${S.type} ${st.type === null ? S.notAnswered : E.types[+st.type]} (${computed.typePts}). ` +
          `${S.total}: ${computed.total}.`,
      )
    }
    if (E.bandNote && st.service !== 'penetration-testing') lines.push(E.bandNote)
    ;(E.deliverables[st.service] || []).forEach((d) => lines.push(`- ${d}`))
    if (E.inputs[st.service]) lines.push(`${S.inputs}: ${E.inputs[st.service]}`)
    lines.push(`${S.risks}: ${risks.length ? risks.join(' ') : S.noRisk}`)
    lines.push(`${S.next}: ${S.nextText}`)
    lines.push(S.disclaimer)
    return lines.join('\n')
  }, [st, svc, S, E, computed, featCount, risks, briefFeatures])

  const setService = (s: string) => {
    setSt({ ...EMPTY, service: s })
    setOtherOpen(false)
  }

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const fieldset = (legend: string, children: React.ReactNode) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  )

  return (
    <div className="tool-app">
      {/* Aesthetic fix 2026-11-16: the fieldsets live in their own column
          (.tool-fields) so the brief (.tool-output) can sit beside them in
          the second .tool-layout column instead of everything stacking in
          one narrow column with the other half of the page left empty. */}
      <div className="tool-fields">
      {fieldset(
        S.title,
        <>
          {Object.keys(E.services).map((s) => (
            <label key={s} className="radio">
              <input type="radio" name="service" value={s} checked={st.service === s} onChange={() => setService(s)} />
              <span>{E.services[s].name}</span>
            </label>
          ))}
          {st.service === 'not-sure' && (
            <p className="tool-hint">
              <Link to={lang === 'fa' ? '/services/#finder' : '/en/services/#finder'}>{S.serviceFinderHint}</Link>
            </p>
          )}
        </>,
      )}
      {svc && st.service && (
        <>
          {fieldset(
            S.legendType,
            E.types.map((t, i) => (
              <label key={i} className="radio">
                <input type="radio" name="type" value={String(i)} checked={st.type === String(i)} onChange={() => setSt({ ...st, type: String(i) })} />
                <span>{t}</span>
              </label>
            )),
          )}
          {fieldset(
            S.legendFeatures,
            <>
              <div className="check-group">
                {svc.features.map((f, fi) => (
                  <label key={fi} className="check">
                    <input
                      type="checkbox"
                      name="feature"
                      value={String(fi)}
                      checked={!!st.features[fi]}
                      onChange={(e) => setSt({ ...st, features: { ...st.features, [fi]: e.target.checked } })}
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
              {st.service === 'website-building' && (
                <label className="count-field">
                  <span>{S.pages}</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={st.pages}
                    onChange={(e) => setSt({ ...st, pages: Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1)) })}
                  />
                </label>
              )}
              <label className="check">
                <input
                  type="checkbox"
                  checked={otherOpen}
                  onChange={(e) => {
                    setOtherOpen(e.target.checked)
                    if (!e.target.checked) setSt({ ...st, other: '' })
                  }}
                />
                <span>{S.other}</span>
              </label>
              {otherOpen && (
                <label className="other-field">
                  <span>{S.otherInWords}</span>
                  <input
                    type="text"
                    maxLength={200}
                    className="field"
                    style={{ maxWidth: 340 }}
                    value={st.other}
                    onChange={(e) => setSt({ ...st, other: e.target.value.slice(0, 200) })}
                  />
                </label>
              )}
            </>,
          )}
          {svc.integrations &&
            fieldset(
              S.legendIntegrations,
              E.integrations.map((t, ti) => (
                <label key={ti} className="check">
                  <input
                    type="checkbox"
                    name="integ"
                    value={String(ti)}
                    checked={!!st.integrations[ti]}
                    onChange={(e) => setSt({ ...st, integrations: { ...st.integrations, [ti]: e.target.checked } })}
                  />
                  <span>{t}</span>
                </label>
              )),
            )}
          {svc.content &&
            fieldset(
              S.legendContent,
              E.content.map((t, i) => (
                <label key={i} className="radio">
                  <input type="radio" name="content" value={String(i)} checked={st.content === String(i)} onChange={() => setSt({ ...st, content: String(i) })} />
                  <span>{t}</span>
                </label>
              )),
            )}
          {fieldset(
            S.legendTimeline,
            <>
              <label className="radio">
                <input type="radio" name="timeline" value="flex" checked={st.timeline === 'flex'} onChange={() => setSt({ ...st, timeline: 'flex' })} />
                <span>{S.flexible}</span>
              </label>
              <label className="radio">
                <input type="radio" name="timeline" value="fixed" checked={st.timeline === 'fixed'} onChange={() => setSt({ ...st, timeline: 'fixed' })} />
                <span>{S.fixedDate}</span>
              </label>
              {st.timeline === 'fixed' && (
                <label className="count-field">
                  <span>{S.targetDate}</span>
                  <input type="date" value={st.date} onChange={(e) => setSt({ ...st, date: e.target.value })} />
                </label>
              )}
            </>,
          )}
          {svc.security &&
            fieldset(
              S.legendSecurity,
              E.security.map((t, i) => (
                <label key={i} className="radio">
                  <input type="radio" name="security" value={String(i)} checked={st.security === String(i)} onChange={() => setSt({ ...st, security: String(i) })} />
                  <span>{t}</span>
                </label>
              )),
            )}
        </>
      )}
      </div>
      <div className="tool-output" aria-live="polite">
        {!st.service && (
          <>
            <p className="brief-empty">{S.empty}</p>
            <p className="dot-tag">
              <span className="dot-ring dot-d0" aria-hidden="true" />
              {S.d0}
            </p>
          </>
        )}
        {/* The brief renders once a service is chosen. It used to be gated
            on `computed`, which is null for pen-test (no feat_pts) — so
            pen-test showed NO brief and NO fixed-scope line at all (QA FAIL).
            The band section itself still needs computed (non-pen-test only). */}
        {st.service && svc && (
          <>
            <p className="dot-tag">
              <span className={`dot-ring ${allAnswered ? 'dot-d2' : 'dot-d1'}`} aria-hidden="true" />
              {allAnswered ? S.d2 : S.d1}
            </p>
            <div className="brief-output">
              <h3>{S.title}</h3>
              <p>
                {S.service}: {st.service === 'not-sure' ? S.serviceTbd : svc.name}
              </p>
              {st.type !== null && (
                <p>
                  {S.legendType}: {E.types[+st.type]}
                </p>
              )}
              <p>
                {S.scope}: {briefFeatures.length ? briefFeatures.join(' · ') : S.notAnswered}
              </p>
              {st.service === 'penetration-testing' ? (
                <p>{S.fixedScope}</p>
              ) : computed ? (
                <>
                  <p>
                    <strong>
                      {S.band}: {computed.band}
                    </strong>
                  </p>
                  <p>
                    {S.why}: {S.features} {faDigits(featCount, lang)} ({faDigits(computed.featPts, lang)}), {S.integrations}{' '}
                    {faDigits(computed.integCount, lang)} ({faDigits(computed.integPts, lang)}), {S.content}{' '}
                    {st.content === null ? S.notAnswered : E.content[+st.content]} ({faDigits(computed.contentPts, lang)}), {S.type}{' '}
                    {st.type === null ? S.notAnswered : E.types[+st.type]} ({faDigits(computed.typePts, lang)}). {S.total}:{' '}
                    {faDigits(computed.total, lang)}.
                  </p>
                  {E.bandNote && <p className="tool-hint">{E.bandNote}</p>}
                </>
              ) : null}
              {(E.deliverables[st.service] || []).length > 0 && (
                <>
                  <h3>{S.deliverables}</h3>
                  <ul>
                    {E.deliverables[st.service].map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </>
              )}
              {E.inputs[st.service] && (
                <>
                  <h3>{S.inputs}</h3>
                  <p>{E.inputs[st.service]}</p>
                </>
              )}
              <h3>{S.risks}</h3>
              {risks.length ? risks.map((r) => <p key={r}>{r}</p>) : <p>{S.noRisk}</p>}
              <h3>{S.next}</h3>
              <p>{S.nextText}</p>
              <p>{S.disclaimer}</p>
            </div>
            <div className="result-actions">
              <button type="button" className="btn btn-ghost btn-small" onClick={() => window.print()}>
                {S.printBtn}
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={copyBrief}>
                {S.copyBtn}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => {
                  setSt(EMPTY)
                  setOtherOpen(false)
                }}
              >
                {S.clearAll}
              </button>
              <Link className="btn btn-ghost btn-small" to={S.contactUrl}>
                {S.sendBrief}
              </Link>
            </div>
            <p className="tool-hint" aria-live="polite">
              {copied ? S.copied : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
