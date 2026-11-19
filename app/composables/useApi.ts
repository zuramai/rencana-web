/** `useFetch` bound to the API client (base URL, credentials, 401 handling). */
export const useApi = ((url: Parameters<typeof useFetch>[0], options?: object) =>
  useFetch(url, { ...options, $fetch: useNuxtApp().$api as typeof $fetch })) as typeof useFetch

export function apiUrl(path: string): string {
  return useRuntimeConfig().public.apiBase.replace(/\/$/, '') + path
}
