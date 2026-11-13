/* Contact form — React port of the v4 form (same field names, same
   Netlify attributes, same copy). Unlike the raw v4 form it submits with
   fetch and shows an inline success message instead of reloading to an
   empty form. The static HTML in the prerender still carries
   data-netlify="true", so Netlify Forms detection registers it on deploy.
   No data leaves the browser except the POST to Netlify on submit. */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Lang } from '../lib/site'
import { CONTACT } from '../lib/site'

const COPY = {
  fa: {
    name: 'نام (الزامی)',
    email: 'ایمیل (الزامی)',
    service: 'خدمت (الزامی)',
    servicePlaceholder: 'انتخاب کنید',
    message: 'پیام (الزامی)',
    emailHint: 'پاسخ را به همین نشانی می فرستیم.',
    messageHint: 'چه چیزی لازم دارید، برای چه کسی، و تا کی. رمز عبور یا اطلاعات ورود ننویسید.',
    privacy: 'فقط همین چند فیلد را می فرستیم و برای پاسخ به شما استفاده می کنیم. جزئیات در صفحه حریم خصوصی.',
    privacyHref: '/privacy/',
    channelLegend: 'راه ترجیحی برای پاسخ (اختیاری)',
    channels: ['ایمیل', 'واتس اپ', 'تلگرام'],
    services: [
      'ساخت وب سایت',
      'طراحی رابط و تجربه کاربری',
      'طراحی مدل کسب و کار',
      'مستندسازی',
      'تست نفوذ',
      'بازاریابی و تولید محتوا',
      'هنوز مطمئن نیستم',
    ],
    submit: 'فرستادن پیام',
    sending: 'در حال فرستادن…',
    summary: 'لطفاً این موارد را اصلاح کنید:',
    errName: 'لطفاً نام تان را بنویسید.',
    errEmail: 'ایمیل معتبر وارد کنید، مثل name@example.com',
    errService: 'یک خدمت را انتخاب کنید، یا «هنوز مطمئن نیستم».',
    errMessage: 'لطفاً پیام تان را بنویسید.',
    successH: 'درخواست تان رسید.',
    successP: 'در یک روز کاری پاسخ می دهیم.',
    failH: 'فرم اینجا وصل نیست؛ متن شما هنوز در فرم است. از ایمیل یا واتس اپ استفاده کنید یا متن را کپی کنید.',
    again: 'فرستادن پیام دیگر',
  },
  en: {
    name: 'Name (required)',
    email: 'Email (required)',
    service: 'Service (required)',
    servicePlaceholder: 'Choose a service',
    message: 'Message (required)',
    emailHint: 'We reply to this address.',
    messageHint: 'What you need, for whom, and by when. Do not include passwords or login details.',
    privacy: 'We send only these fields and use them only to reply to you. Details on the privacy page.',
    privacyHref: '/en/privacy/',
    channelLegend: 'Preferred way to reply (optional)',
    channels: ['Email', 'WhatsApp', 'Telegram'],
    services: [
      'Website building',
      'UI/UX design',
      'Business model design',
      'Documentation',
      'Penetration testing',
      'Marketing and content',
      'Not sure yet',
    ],
    submit: 'Send message',
    sending: 'Sending…',
    summary: 'Please fix the following:',
    errName: 'Please enter your name.',
    errEmail: 'Enter a valid email address, like name@example.com',
    errService: 'Choose a service, or "Not sure yet".',
    errMessage: 'Please write your message.',
    successH: 'Your request has arrived.',
    successP: 'We reply within one working day.',
    failH: 'The form is not connected here; your text is still in the form. Use email or WhatsApp, or copy your message.',
    again: 'Send another message',
  },
} as const

export default function ContactForm({ lang }: { lang: Lang }) {
  const T = COPY[lang]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState('')
  const [message, setMessage] = useState('')
  const [channel, setChannel] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  // v33 (R-39): which fields are invalid, so each one can point at the
  // error summary (aria-invalid + aria-describedby) instead of the
  // errors floating unattached. The summary takes focus on submit so
  // keyboard and screen-reader users land on the problem list.
  const badName = errors.includes(T.errName)
  const badEmail = errors.includes(T.errEmail)
  const badService = errors.includes(T.errService)
  const badMessage = errors.includes(T.errMessage)
  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus()
  }, [errors])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (!name.trim()) errs.push(T.errName)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.push(T.errEmail)
    if (!service) errs.push(T.errService)
    if (!message.trim()) errs.push(T.errMessage)
    setErrors(errs)
    if (errs.length > 0) return
    setSending(true)
    setFailed(false)
    try {
      const body = new URLSearchParams()
      body.set('form-name', 'contact')
      body.set('name', name.trim())
      body.set('email', email.trim())
      body.set('service', service)
      body.set('message', message.trim())
      if (channel) body.set('channel', channel)
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) throw new Error(String(res.status))
      setDone(true)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="form-success" role="status">
        <h3>{T.successH}</h3>
        <p>{T.successP}</p>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => {
            setDone(false)
            setName('')
            setEmail('')
            setService('')
            setMessage('')
            setChannel('')
            setErrors([])
          }}
        >
          {T.again}
        </button>
      </div>
    )
  }

  return (
    // noValidate stays: the custom error summary (not the browser's
    // native bubbles) is the designed experience. `required` on the
    // fields below still gives assistive tech the correct semantics.
    <form
      name="contact"
      method="POST"
      action="/contact/"
      data-netlify="true"
      netlify-honeypot="bot-field"
      noValidate
      onSubmit={submit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p hidden aria-hidden="true">
        <label>
          {lang === 'fa' ? 'برای ربات ها:' : 'For bots:'}
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      {errors.length > 0 && (
        <div className="form-errors" role="alert" id="cf-errors" tabIndex={-1} ref={summaryRef}>
          <p>{T.summary}</p>
          <ul>
            {errors.map((er) => (
              <li key={er}>{er}</li>
            ))}
          </ul>
        </div>
      )}
      {failed && (
        <div className="form-errors" role="alert">
          <p>{T.failH}</p>
          <p>
            {lang === 'fa' ? 'ایمیل: ' : 'Email: '}
            <a href={`mailto:${CONTACT.email}`} dir="ltr">
              {CONTACT.email}
            </a>
            {' · WhatsApp: '}
            <a href={CONTACT.whatsapp} rel="noreferrer">
              {CONTACT.whatsappLabel}
            </a>
          </p>
        </div>
      )}
      <div className="field">
        <label htmlFor="cf-name">{T.name}</label>
        <input id="cf-name" name="name" type="text" autoComplete="name" required aria-invalid={badName || undefined} aria-describedby={badName ? 'cf-errors' : undefined} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="cf-email">{T.email}</label>
        <input id="cf-email" name="email" type="email" dir="ltr" autoComplete="email" required aria-invalid={badEmail || undefined} aria-describedby={badEmail ? 'cf-errors' : undefined} value={email} onChange={(e) => setEmail(e.target.value)} />
        <p className="field-hint">{T.emailHint}</p>
      </div>
      <div className="field">
        <label htmlFor="cf-service">{T.service}</label>
        <select id="cf-service" name="service" required aria-invalid={badService || undefined} aria-describedby={badService ? 'cf-errors' : undefined} value={service} onChange={(e) => setService(e.target.value)}>
          <option value="" disabled>
            {T.servicePlaceholder}
          </option>
          {T.services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="cf-message">{T.message}</label>
        <textarea id="cf-message" name="message" rows={6} required aria-invalid={badMessage || undefined} aria-describedby={badMessage ? 'cf-errors' : undefined} value={message} onChange={(e) => setMessage(e.target.value)} />
        <p className="field-hint">{T.messageHint}</p>
      </div>
      <fieldset className="field">
        <legend>{T.channelLegend}</legend>
        {T.channels.map((c) => (
          <label key={c} className="radio">
            <input type="radio" name="channel" value={c} checked={channel === c} onChange={() => setChannel(c)} />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
      <button className="btn btn-primary" type="submit" disabled={sending}>
        {sending ? T.sending : T.submit}
      </button>
      <p className="field-hint">
        <Link to={T.privacyHref}>{T.privacy}</Link>
      </p>
    </form>
  )
}
