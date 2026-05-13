import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Pagine Giappe',
  tagline: 'La Jekucina a casa tua!',
  // Use a typographic middle dot in <title> tags ("Page · Site") instead of
  // the default pipe — cleaner on the SERP and the browser tab.
  titleDelimiter: '·',
  favicon: 'img/favicon.ico',
  trailingSlash: true,
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw'
    },
  },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://paginegiappe.it',
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'amicojeko', // Usually your GitHub org/user name.
  projectName: 'japanesecookbook', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  i18n: {
    defaultLocale: 'it',
    locales: ['it'],
  },

  // Google Fonts: linked from <head> (not @import'd in CSS) so font discovery
  // doesn't wait for custom.css to download/parse. Preconnect to gstatic warms
  // the TLS handshake before woff2 requests fire — saves a round-trip on first paint.
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=Shippori+Mincho:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
      rel: 'stylesheet',
    },
  ],
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          path: './blog',
          routeBasePath: '/blog',
          blogTitle: 'Blog · Pagine Giappe',
          blogDescription:
            'Appunti, novità e riflessioni dal taccuino di cucina giapponese di Pagine Giappe: ricette, ingredienti, negozi orientali in Italia e viaggi in Giappone.',
          blogSidebarTitle: 'Ultimi post',
          blogSidebarCount: 10,
          postsPerPage: 10,
          authorsMapPath: 'authors.yml',
          showReadingTime: true,
          // Honor `hide_reading_time: true` in a post's frontmatter to
          // suppress the strip on a single post. Otherwise use 350 wpm
          // (Docusaurus default is 200; we bump it to better match how
          // people actually skim editorial-blog content). Keep this in
          // sync with READING_WPM in scripts/generate-blog-index.js so the
          // homepage strip and the post header show the same number.
          readingTime: ({content, frontMatter, defaultReadingTime}) =>
            frontMatter.hide_reading_time
              ? undefined
              : defaultReadingTime({content, options: {wordsPerMinute: 350}}),
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Pagine Giappe — Blog',
            description:
              'Appunti dal taccuino di cucina giapponese in italiano di Stefano "Jeko" Guglielmetti.',
            copyright: `© ${new Date().getFullYear()} Stefano Guglielmetti — paginegiappe.it`,
            language: 'it',
          },
          onInlineTags: 'throw',
          onInlineAuthors: 'throw',
          onUntruncatedBlogPosts: 'throw',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        // gtag plugin only in production builds. In dev its route-update
        // callback can fire before window.gtag is bound (HMR / build-while-dev
        // races), throwing "window.gtag is not a function". Disabling in dev
        // also keeps local pageviews out of GA.
        gtag:
          process.env.NODE_ENV === 'production'
            ? {
                trackingID: 'G-YZDG2VN7ZG',
                anonymizeIP: true,
              }
            : undefined,
        // Sitemap: explicit config (preset-classic enables the plugin by
        // default with priority 0.5 and no ignorePatterns). We pin priority
        // to 0.7 to signal these pages as above-average importance, and skip
        // the auto-generated /tags/** pages to free crawl budget — they
        // showed up empty / "Crawled - currently not indexed" in GSC.
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    algolia: {
      appId: '9DWNYPKJD0',
      apiKey: 'b31d01c5282cee1939baf74e884ce829',
      indexName: 'ricettegiapponesi',
      contextualSearch: true,
      insights: true,
      placeholder: 'Cerca ricette e ingredienti',
      searchParameters: {
        distinct: 1,
      },
      // Optional: path for search page that enabled by default (`false` to disable it)
      // searchPagePath: 'search',
    },
    image: 'img/social_media_card.png',
    metadata: [
      // Card format only. Twitter/X falls back to og:title / og:description
      // when twitter:title / twitter:description aren't set — and Docusaurus
      // auto-generates og:* per page from frontmatter (title / description
      // / image), so setting twitter:title / twitter:description here would
      // hardcode site-wide strings on every page (already happened: blog
      // posts showed "Le ricette giapponesi di Jeko" instead of the post
      // title on X cards). Keep this minimal; let og:* be the single source
      // of truth. twitter:image is auto-emitted per page by Docusaurus.
      {name: 'twitter:card', content: 'summary_large_image'},
      {
        name: 'description',
        content: 'Tutte le ricette giapponesi spiegate passo passo, con foto e video. Scopri i segreti della cucina giapponese con Jeko!'
      },
      // Performance optimizations
      {name: 'referrer', content: 'strict-origin-when-cross-origin'},
      {httpEquiv: 'x-ua-compatible', content: 'IE=edge'},
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Pagine Giappe',
      logo: {
        alt: 'Jeko',
        src: 'img/logo_katakana.png',
      },
      items: [
        {
          to: '/negozi_orientali',
          label: 'Negozi',
          position: 'left'
        },
        {
          to: '/viaggi',
          label: 'Viaggi',
          position: 'left'
        },
        {
          to: '/libri',
          label: 'Libri',
          position: 'left'
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left'
        },
        {
          href: 'https://github.com/amicojeko/japanesecookbook',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    // No `footer:` block here on purpose. The footer is fully swizzled in
    // src/theme/Footer/index.tsx (custom 4-column layout with PayPal CTA, kanji
    // brand mark, etc.) and never reads from themeConfig.footer. Keeping a
    // config-side footer here would silently drift from what's actually
    // rendered — edit src/theme/Footer/index.tsx to change footer content.
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      { quality: 80, max: 1600, min: 320, steps: 4, disableInDev: false }
    ]
  ]
};

export default config;
