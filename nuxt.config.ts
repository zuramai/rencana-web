// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],
  ssr: false,

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'Rencana',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#14B8A6' },
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        { name: 'description', content: 'Plan trips, itineraries and budgets with Koper.' }
      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }]
    }
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8787'
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' }
    ]
  },

  icon: {
    provider: 'none',
    fallbackToApi: false,
    clientBundle: {
      scan: true,
      icons: [
        'lucide:arrow-left',
        'lucide:bed-double',
        'lucide:bus',
        'lucide:calendar',
        'lucide:calendar-plus',
        'lucide:check',
        'lucide:chevron-down',
        'lucide:circle-alert',
        'lucide:circle-dot',
        'lucide:download',
        'lucide:external-link',
        'lucide:file-spreadsheet',
        'lucide:file-text',
        'lucide:globe',
        'lucide:image-plus',
        'lucide:landmark',
        'lucide:link',
        'lucide:map-pin',
        'lucide:party-popper',
        'lucide:pencil',
        'lucide:plane',
        'lucide:plus',
        'lucide:ship',
        'lucide:shopping-bag',
        'lucide:sparkles',
        'lucide:ticket',
        'lucide:train-front',
        'lucide:trash-2',
        'lucide:triangle-alert',
        'lucide:utensils',
        'lucide:wallet',
        'lucide:x',
        'lucide:loader-circle',
        'lucide:chevron-up',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:minus',
        'lucide:search',
        'lucide:circle-check',
        'lucide:circle-x',
        'lucide:info',
        'lucide:eye',
        'lucide:eye-off',
        'lucide:ellipsis',
        'fluent-emoji-flat:airplane',
        'fluent-emoji-flat:luggage',
        'fluent-emoji-flat:world-map',
        'fluent-emoji-flat:compass',
        'fluent-emoji-flat:beach-with-umbrella',
        'fluent-emoji-flat:desert-island',
        'fluent-emoji-flat:mount-fuji',
        'fluent-emoji-flat:snow-capped-mountain',
        'fluent-emoji-flat:sunrise-over-mountains',
        'fluent-emoji-flat:national-park',
        'fluent-emoji-flat:camping',
        'fluent-emoji-flat:cityscape-at-dusk',
        'fluent-emoji-flat:japanese-castle',
        'fluent-emoji-flat:ferris-wheel',
        'fluent-emoji-flat:sushi',
        'fluent-emoji-flat:camera'
      ],
      sizeLimitKb: 2048
    }
  }
})
