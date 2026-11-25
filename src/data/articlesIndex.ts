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
    h1: "چیزهایی که کاش قبل از سفارش سایت، یکی به ما گفته بود",
    manifesto: "این ها مقاله های معمول بازار نیستند. ما این جا چیزهایی را می نویسیم که بقیه فقط در جلسه فروش می گویند: پول طراحی سایت دقیقا چه می خرد، چرا پیج اجاره ای است و ساختن خانه یعنی چه. <strong>اگر بعد از خواندن این ها پیش استودیوی دیگری هم بروید، پروژه بهتری می خرید.</strong>",
    stats: [
      { value: "۲۰+", label: "پروژه تحویل شده" },
      { value: "۵+", label: "سال تجربه ساخت و تحویل" },
      { value: "۰", label: "قول رتبه و نتیجه تضمینی در این مقاله ها" },
    ],
    articles: [
    {
      href: "/articles/instagram-vs-website/",
      cover: "/covers/cover-instagram.svg",
      alt: "کاور مقاله: گوشی قفل شده در کنار خانه ای که مال خودتان است",
      category: "فروش آنلاین",
      title: "پیج اینستاگرام یا سایت؟ چرا فروشگاه اینستاگرامی شما به سایت خودش نیاز دارد",
      excerpt: "ساعت هفت صبح است. اینستاگرام را باز می کنید و پیج فروشگاهتان نیست: سه سال محتوا، چند هزار مشتری و همه سفارش های باز، داخل حسابی که دست شما نیست. این مقاله از همان صبح شروع می شود و به یک سؤال جواب می دهد: کدام بخش کسب و کارتان روی زمین خودتان ایستاده است؟",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/website-cost/",
      cover: "/covers/cover-cost.svg",
      alt: "کاور مقاله: برچسب قیمت و سکه ها",
      category: "هزینه و قیمت",
      title: "هزینه طراحی سایت چقدر است؟ کالبدشکافی صادقانه قیمت",
      excerpt: "یک درخواست واحد، دو پیش فاکتور: پنج میلیون و پنجاه میلیون. هر دو می توانند صادقانه باشند. این جا ساعت به ساعت باز می کنیم پول شما چه می خرد و قیمت ارزان از کجا کم می گذارد.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۸ دقیقه خواندن",
    },
    {
      href: "/articles/project-scope/",
      cover: "/covers/cover-scope.svg",
      alt: "کاور مقاله: سند امضاشده با مهر تایید",
      category: "اسکوپ پروژه",
      title: "اسکوپ پروژه سایت چیست؟ قالب واقعی دادمور را همین جا بردارید",
      excerpt: "ما قالب اسکوپی را که قبل از هر پروژه امضا می کنیم کامل منتشر کرده ایم: ده بخش، با مثال پرشده و دلیل وجود هر خط. بردارید و امشب اسکوپ پروژه تان را بنویسید.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۸ دقیقه خواندن",
    },
    {
      href: "/articles/shop-builder-vs-own-site/",
      cover: "/covers/cover-builder.svg",
      alt: "کاور مقاله: غرفه ای با سایبان راه راه در پاساژ در کنار مغازه ای با در سبز که مال خودتان است",
      category: "فروش آنلاین",
      title: "فروشگاه ساز یا سایت خودت؟ اجاره نشینی در پاساژ دیگران یا مغازه خودت",
      excerpt: "با ماهی چند صد هزار تومان فروشگاهت باز می شود و همه چیز آماده است. ولی غرفه مال پاساژ است: اجاره اش تا ابد ادامه دارد، قانونش را او می گذارد و روزی که بیرون بروی، مشتری ها همان جا می مانند.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/instagram-hacked/",
      cover: "/covers/cover-hacked.svg",
      alt: "کاور مقاله: گوشی با سپری ترک خورده و تیک سبز روی نیمه سالم سپر",
      category: "امنیت",
      title: "پیج فروشگاهت هک شد؟ اول این کارها را بکن",
      excerpt: "صبح بیدار می شوی و پیجت دست تو نیست: رمز عوض شده و استوری های عجیب می رود. ساعت اول تعیین می کند پیج برمی گردد یا نه. این جا ترتیب درست برگرداندن و قفل هایی است که واقعا جواب می دهند.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    {
      href: "/articles/traffic-but-no-sales/",
      cover: "/covers/cover-nosales.svg",
      alt: "کاور مقاله: قیفی که بازدیدکننده ها واردش می شوند و سبد خریدی زیر ذره بین",
      category: "فروش آنلاین",
      title: "بازدید داری، فروش نداری؟ این هفت جا را چک کن",
      excerpt: "دیروز چهارصد نفر آمدند و هیچ کس نخرید. مشکل بیشتر فروشگاه ها آدم نیست؛ جایی بین در مغازه و صندوق است که مشتری برمی گردد و می رود. این هفت جا را به ترتیب چک کن.",
      date: "۳۰ آبان ۱۴۰۵",
      read: "۹ دقیقه خواندن",
    },
    ],
  },
  en: {
    kicker: "dadmor articles",
    h1: "Things we wish someone had told us before ordering a website",
    manifesto: "These are not the market’s usual articles. We write here what others only say in a sales meeting: what website money actually buys and why a page is rented land. <strong>If you read these and then go to another studio, you will buy a better project.</strong>",
    stats: [
      { value: "20+", label: "projects delivered" },
      { value: "5+", label: "years of building and delivery" },
      { value: "0", label: "ranking promises or guaranteed results in these articles" },
    ],
    articles: [
    {
      href: "/en/articles/instagram-vs-website/",
      cover: "/covers/cover-instagram.svg",
      alt: "Article cover: a locked phone beside a house of your own",
      category: "Selling online",
      title: "Instagram page or website? Why your Instagram shop needs a website of its own",
      excerpt: "It is seven in the morning. You open Instagram and your shop page is gone: three years of content, thousands of customers and every open order, inside an account that is not in your hands. This article starts on that morning and answers one question: which part of your business stands on your own land?",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/website-cost/",
      cover: "/covers/cover-cost.svg",
      alt: "Article cover: a price tag and coins",
      category: "Cost and pricing",
      title: "How much does a website cost? An honest anatomy of the price",
      excerpt: "One brief, two quotes: five million and fifty million. Both can be honest. Here we open up, hour by hour, what your money buys and where a cheap quote quietly cuts.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/project-scope/",
      cover: "/covers/cover-scope.svg",
      alt: "Article cover: a signed document with a seal of approval",
      category: "Project scope",
      title: "What is a project scope? Take dadmor’s real template, free",
      excerpt: "We publish the exact scope template we sign before every project: ten sections, a filled example and the fight each line prevents. Take it and write your project scope tonight.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/shop-builder-vs-own-site/",
      cover: "/covers/cover-builder.svg",
      alt: "Article cover: a market stall with a striped awning beside your own shop with a green door",
      category: "Selling online",
      title: "Shop builder or your own website? Renting a stall in someone else’s mall or owning your shop",
      excerpt: "For a few hundred thousand tomans a month your shop opens and everything is ready. But the stall belongs to the mall: its rent runs forever, its rules are set by someone else, and on the day you leave, the customers stay behind.",
      date: "21 November 2026",
      read: "8 min read",
    },
    {
      href: "/en/articles/instagram-hacked/",
      cover: "/covers/cover-hacked.svg",
      alt: "Article cover: a phone with a cracked shield and a green check on its intact half",
      category: "Security",
      title: "Your shop page got hacked? Do these things first",
      excerpt: "You wake up and the page is not in your hands: the password has changed and strange stories are going up. The first hour decides whether the page comes back. Here is the right recovery order, and the locks that actually work.",
      date: "21 November 2026",
      read: "9 min read",
    },
    {
      href: "/en/articles/traffic-but-no-sales/",
      cover: "/covers/cover-nosales.svg",
      alt: "Article cover: a funnel visitors enter and a shopping cart under a magnifier",
      category: "Selling online",
      title: "Traffic but no sales? Check these seven places",
      excerpt: "Yesterday four hundred people came and nobody bought. Most shops do not have a people problem; somewhere between the door and the till the customer turns around and leaves. Check these seven places, in order.",
      date: "21 November 2026",
      read: "8 min read",
    },
    ],
  },
}
