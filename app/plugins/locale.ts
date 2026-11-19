export default defineNuxtPlugin({
  name: 'rencana-locale',
  dependsOn: ['i18n:plugin', 'rencana-auth'],
  setup(nuxtApp) {
    const { user } = useAuth()
    const cookie = useCookie<'en' | 'id' | null>('rencana_locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    const i18n = nuxtApp.$i18n
    const apply = () => {
      const next = user.value?.locale ?? cookie.value ?? 'en'
      if (i18n.locale.value !== next) return i18n.setLocale(next)
    }
    nuxtApp.hook('app:created', apply)
    watch(() => user.value?.locale, apply)
  }
})
