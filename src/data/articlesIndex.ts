/* Articles index content, verbatim from the extracted page data
   (src/data/pages/{en__}articles__index.json). The masthead copy, card
   titles, excerpts, categories, dates and reading times are the site's
   real published content; only the presentation moved into React so
   the index can search and filter. */

export interface ArticleCard {
  href: string
  cover: string
  alt: string
  category: string
  title: string
  excerpt: string
  date: string
  read: string
}

export interface ArticlesIndexData {
  kicker: string
  h1: string
  manifesto: string
  stats: { value: string; label: string }[]
  articles: ArticleCard[]
}

export const ARTICLES_INDEX: Record<'fa' | 'en', ArticlesIndexData> = {
  fa: {
    kicker: "مقالات دادمور",
    h1: "قبل از اینکه سایت سفارش بدی",
    manifesto: "از تجربه پروژه‌ها: چیزهایی که درباره سایت، فروش و مشتری یاد گرفتیم تا موقع سفارش سایت و فروش آنلاین تصمیم اشتباه نگیری. هر مقاله یک مسئله واقعی را باز می‌کند و راهش را می‌گوید.",
    stats: [
      { value: "۲۰+", label: "پروژه تحویل شده" },
      { value: "۵+", label: "سال تجربه ساخت و تحویل" },
      { value: "۰", label: "قول رتبه و نتیجه تضمینی در این مقاله ها" },
    ],
    articles: [
    {
      href: "/articles/payment-gateway-trust-symbol/",
      cover: "/covers/cover-payment.svg",
      alt: "کاور مقاله: کارت بانکی با تیک سبز در کنار نشان اعتماد",
      category: "پرداخت و اعتماد",
      title: "درگاه پرداخت و نماد اعتماد: چطور فروشگاهت را به پول واقعی وصل می کنی",
      excerpt: "درگاه پرداخت اینترنتی و نماد اعتماد را چطور می گیری؟ ما فرق درگاه مستقیم بانکی و پرداخت یار، قدم های گرفتن نماد اعتماد از اینماد و چک لیستی را می گوییم که قبل از درخواست باید روی سایتت کامل باشد.",
      date: "۴ آذر ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/seo-for-small-shops/",
      cover: "/covers/cover-seo.svg",
      alt: "کاور مقاله: ذره بین روی صفحه ای با نمودار و نوشته",
      category: "سئو و دیده شدن",
      title: "سئو چیست؟ راهنمای شروع سئو برای فروشگاه کوچکی مثل فروشگاه تو",
      excerpt: "سئو چیست و از کجا باید شروعش کنی؟ ما به زبان ساده می گوییم: کلمه هایی که مشتری واقعا سرچ می کند، صفحه محصول درست، سرچ کنسول گوگل و قدم هایی که اول از همه باید برداری.",
      date: "۴ آذر ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/website-speed-and-sales/",
      cover: "/covers/cover-speed.svg",
      alt: "کاور مقاله: سرعت سنجی با عقربه بالا و یک ساعت کوچک",
      category: "سرعت سایت",
      title: "سرعت سایت چرا برای فروشت مهم است و چه چیزهایی سایتت را کند می کند",
      excerpt: "سرعت سایت روی فروشت اثر مستقیم دارد: مشتری موبایلی برای باز شدن صفحه صبر نمی کند. ما شایع ترین دلیل های کندی یک سایت فروشگاهی، راه سنجیدن سرعت با موبایل و ترتیب درست رفع کندی را می گوییم.",
      date: "۴ آذر ۱۴۰۵",
      read: "۷ دقیقه خواندن",
    },
    {
      href: "/articles/instagram-vs-website/",
      cover: "/covers/cover-instagram.svg",
      alt: "کاور مقاله: گوشی قفل شده در کنار خانه ای که مال خودتان است",
      category: "فروش آنلاین",
      title: "پیج اینستاگرام یا سایت؟ فروشگاهتان به سایت خودش نیاز دارد",
      excerpt: "صبحی را تصور کنید که پیج فروشگاهتان نیست. پیج چه چیزی را به شما اجاره می دهد و سایت چه چیزی را مال خودتان می کند؟ و اصلا کی همان پیج به تنهایی کافی است؟ این را ما، رکسانا نگارش و عرشیا امانی، بی پرده نوشته ایم.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/website-cost/",
      cover: "/covers/cover-cost.svg",
      alt: "کاور مقاله: برچسب قیمت و سکه ها",
      category: "هزینه و قیمت",
      title: "هزینه ساخت سایت چقدر است؟ قیمت را صادقانه باز می کنیم",
      excerpt: "هزینه ساخت سایت از چه چیزهایی ساخته می شود؟ ما، رکسانا نگارش و عرشیا امانی در دادمور، ساعت به ساعت باز می کنیم پول شما چه می خرد و چرا یک پیش فاکتور پنج میلیون می گوید و یکی پنجاه میلیون، و هر دو هم می توانند راست بگویند.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۸ دقیقه خواندن",
    },
    {
      href: "/articles/project-scope/",
      cover: "/covers/cover-scope.svg",
      alt: "کاور مقاله: سند امضاشده با مهر تایید",
      category: "پیمان پروژه",
      title: "پیمان پروژه سایت چیست؟ قالب واقعی ما را همین جا بردارید",
      excerpt: "پیمان پروژه همان سندی است که پیش از ساخت سایت، همه چیز را روی کاغذ ثابت می کند. ما در دادمور قالب واقعی پیمان خودمان را کامل این جا گذاشته ایم: هر ده بخش، با یک مثال پرشده برای هر کدام.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۸ دقیقه خواندن",
    },
    {
      href: "/articles/shop-builder-vs-own-site/",
      cover: "/covers/cover-builder.svg",
      alt: "کاور مقاله: غرفه ای با سایبان راه راه در پاساژ در کنار مغازه ای با در سبز که مال خودتان است",
      category: "فروش آنلاین",
      title: "فروشگاه ساز یا سایت خودت؟ غرفه اجاره ای یا مغازه ای که مال توست",
      excerpt: "فروشگاه ساز یا سایت خودت؟ ما اجاره ماهانه و قانون پاساژ را می گذاریم کنار هزینه یک باره و مالکیت کامل: فروشگاه ساز دقیقا چه چیزی به تو می فروشد و از کی باید بروی سراغ مغازه خودت.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/instagram-hacked/",
      cover: "/covers/cover-hacked.svg",
      alt: "کاور مقاله: گوشی با سپری ترک خورده و تیک سبز روی نیمه سالم سپر",
      category: "امنیت",
      title: "پیج هک شده؟ پیج فروشگاهت هک شد، اول این کارها را بکن",
      excerpt: "پیج فروشگاهتان هک شده؟ این جا ترتیب درست برگرداندن حساب از مسیر رسمی متا را می خوانید، دام کلاه بردارهای «بازیابی فوری» را می شناسید و پیشگیری هایی را که واقعا جواب می دهند: تایید دو مرحله ای، ایمیل جدا و کدهای پشتیبان.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/traffic-but-no-sales/",
      cover: "/covers/cover-nosales.svg",
      alt: "کاور مقاله: قیفی که بازدیدکننده ها واردش می شوند و سبد خریدی زیر ذره بین",
      category: "فروش آنلاین",
      title: "بازدید داری، فروش نداری؟ این هفت جا را به همین ترتیب چک کن",
      excerpt: "سایتت بازدید دارد ولی فروش نه؟ این هفت جا را به ترتیب چک کن: اعتماد در ده ثانیه اول، جواب های صفحه محصول، صندوق روی گوشی ارزان، سرعت و پیگیری سبد رها شده.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    ],
  },
  en: {
    kicker: "dadmor articles",
    h1: "Before you order a website",
    manifesto: "From our own project experience: what we have learned about websites, sales and customers, so you do not make the wrong call when ordering a website and selling online. Every article opens one real problem and explains the way through it.",
    stats: [
      { value: "20+", label: "projects delivered" },
      { value: "5+", label: "years of building and delivery" },
      { value: "0", label: "ranking promises or guaranteed results in these articles" },
    ],
    articles: [
    {
      href: "/en/articles/payment-gateway-trust-symbol/",
      cover: "/covers/cover-payment.svg",
      alt: "Article cover: a bank card with a green check beside a trust badge",
      category: "Payments and trust",
      title: "Payment gateway and trust symbol: how your shop starts taking real money",
      excerpt: "How to get a payment gateway and the Iranian trust symbol (eNAMAD) for your shop: a direct bank gateway or a payment facilitator, the steps involved, and the checklist your site has to pass before you apply.",
      date: "25 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/seo-for-small-shops/",
      cover: "/covers/cover-seo.svg",
      alt: "Article cover: a magnifier over a page with a chart and lines of text",
      category: "SEO and visibility",
      title: "What is SEO? A plain starter guide for small shops",
      excerpt: "What is SEO, and where do you actually start? A practical guide for small shops: the words your customers really search, product pages that answer their questions, Search Console, and the first steps that matter.",
      date: "25 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/website-speed-and-sales/",
      cover: "/covers/cover-speed.svg",
      alt: "Article cover: a speedometer with its needle high and a small clock",
      category: "Site speed",
      title: "Website speed and sales: why your slow page loses buyers, and what makes it slow",
      excerpt: "Website speed hits your sales directly: a customer on mobile data will not wait for a slow page. The usual causes of a slow shop site, how to measure yours with your own phone, and the right order to fix it.",
      date: "25 November 2026",
      read: "7 min read",
    },
    {
      href: "/en/articles/instagram-vs-website/",
      cover: "/covers/cover-instagram.svg",
      alt: "Article cover: a locked phone beside a house of your own",
      category: "Selling online",
      title: "Instagram page or website? Why your shop needs a website of its own",
      excerpt: "It is 7 a.m., you open Instagram, and your shop page is just gone. What a page only rents you, what a website actually gives you, and when a page on its own is honestly enough.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/website-cost/",
      cover: "/covers/cover-cost.svg",
      alt: "Article cover: a price tag and coins",
      category: "Cost and pricing",
      title: "How much does a website cost? An honest look inside the price",
      excerpt: "One brief, two quotes: five million and fifty million, both can be honest. We open the website price stage by stage, so you can see what your money buys, and where a cheap quote cuts corners.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/project-scope/",
      cover: "/covers/cover-scope.svg",
      alt: "Article cover: a signed document with a seal of approval",
      category: "Project scope",
      title: "What is a project scope? Take dadmor’s real template, free",
      excerpt: "A project scope is the sheet of paper that settles everything before a website gets built. Here is dadmor’s actual template, all ten sections, plus a filled in example. Take it to anyone.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/shop-builder-vs-own-site/",
      cover: "/covers/cover-builder.svg",
      alt: "Article cover: a market stall with a striped awning beside your own shop with a green door",
      category: "Selling online",
      title: "Shop builder or your own website? Renting a stall vs owning your shop",
      excerpt: "Shop builder or your own website? A builder gets you selling fast, but the rent never stops and the address is not yours. What you are really paying for, and when owning your own site makes more sense.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/instagram-hacked/",
      cover: "/covers/cover-hacked.svg",
      alt: "Article cover: a phone with a cracked shield and a green check on its intact half",
      category: "Security",
      title: "Hacked Instagram account? What to do first with your shop page",
      excerpt: "Your hacked Instagram account, step by step: email first, Meta’s official recovery path, then lock it down. Plus the recovery scammers to avoid, and the prevention that stops a repeat.",
      date: "21 November 2026",
      read: "9 min read",
    },
    {
      href: "/en/articles/traffic-but-no-sales/",
      cover: "/covers/cover-nosales.svg",
      alt: "Article cover: a funnel visitors enter and a shopping cart under a magnifier",
      category: "Selling online",
      title: "Traffic but no sales? Work through these seven places, in order",
      excerpt: "Traffic but no sales? Visitors come and do not buy. Check seven places in order: trust in the first ten seconds, product page answers, checkout on a cheap phone, speed, and cart follow up.",
      date: "21 November 2026",
      read: "8 min read",
    },
    ],
  },
}
