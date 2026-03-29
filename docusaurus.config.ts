import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Le Ricette Giapponesi di Jeko',
  tagline: 'La Jekucina a casa tua!',
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
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-YZDG2VN7ZG',
          anonymizeIP: true,
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
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'Le ricette giapponesi di Jeko'},
      {
        name: 'twitter:description',
        content:
          'Tutte le ricette giapponesi spiegate passo passo, con foto e video. Scopri i segreti della cucina giapponese con Jeko!'
      },
      {name: 'twitter:image', content: 'img/social_media_card.png'},
      {
        name: 'description',
        content: 'Tutte le ricette giapponesi spiegate passo passo, con foto e video. Scopri i segreti della cucina giapponese con Jeko!'
      },
      // Performance optimizations
      {name: 'referrer', content: 'strict-origin-when-cross-origin'},
      {httpEquiv: 'x-ua-compatible', content: 'IE=edge'},
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Le Ricette Giapponesi di Jeko',
      logo: {
        alt: 'Jeko',
        src: 'img/logo_katakana.png',
        srcDark: 'img/logo_katakana_dark.png',
      },
      items: [
        {
          to: '/negozi_orientali',
          label: 'Pagine Giappe',
          position: 'left'
        },
        {
          to: '/topologia',
          label: 'Topologia',
          position: 'left'
        },
        {
          href: 'https://github.com/amicojeko/japanesecookbook',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Le Ricette Giapponesi di Jeko',
          items: [
            {
              label: 'Pagine giappe - Negozi orientali in Italia',
              to: '/negozi_orientali',
            },
          ],
        },
        {
          title: 'Social media',
          items: [
            {
              label: 'Instagram',
              href: 'https://www.instagram.com/amicojeko',
            },
            {
              label: 'TikTok',
              href: 'https://www.tiktok.com/@amicojeko',
            },
            {
              label: 'Youtube',
              href: 'https://youtube.com/amicojeko',
            },
            {
              label: 'X',
              href: 'https://www.x.com/jeko',
            },
            {
              label: 'Linkedin',
              href: 'https://www.linkedin.com/in/stefanog',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/amicojeko/japanesecookbook',
            },
            {
              label: 'Supportami con PayPal',
              href: 'https://paypal.me/jeko23',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Stefano Guglielmetti. Built with Docusaurus.`,
    },
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
