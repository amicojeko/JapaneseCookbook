import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw'
    },
  },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ricettegiapponesi.jeko.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'amicojeko', // Usually your GitHub org/user name.
  projectName: 'japanesecookbook', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'it',
    locales: ['it'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
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
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Le Ricette Giapponesi di Jeko',
      logo: {
        alt: 'My Site Logo',
        src: 'img/icon_128.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Ricette',
        },
        // {to: '/ingredienti', label: 'Ingredienti', position: 'left'},
        // {to: '/blog', label: 'Blog', position: 'left'},
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
              label: 'Ingredienti',
              to: '/ingredienti',
            },
            {
              label: 'Ricette',
              to: '/ricette',
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
            // {
            //   label: 'Blog',
            //   to: '/blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/amicojeko/japanesecookbook',
            },
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
};

export default config;
