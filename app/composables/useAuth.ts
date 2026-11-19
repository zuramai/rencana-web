import type { MeDto } from '#shared/types/dto'

export function useAuth() {
  const user = useState<MeDto | null>('rencana-user', () => null)
  const loggedIn = computed(() => !!user.value)
  const { $api } = useNuxtApp()

  async function refresh() {
    user.value = await $api<MeDto>('/api/me').catch(() => null)
  }

  function clear() {
    user.value = null
  }

  return { user, loggedIn, refresh, clear }
}
