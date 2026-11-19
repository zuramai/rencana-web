export default defineNuxtPlugin({
  name: 'rencana-api',
  setup() {
    const config = useRuntimeConfig()
    const $api = $fetch.create({
      baseURL: config.public.apiBase,
      credentials: 'include',
      onResponseError({ request, response }) {
        const path = typeof request === 'string' ? request : request.url
        if (response.status !== 401 || path.startsWith('/api/me')) return
        const { user, clear } = useAuth()
        if (!user.value) return
        clear()
        void navigateTo('/login')
      }
    })
    return { provide: { api: $api } }
  }
})
