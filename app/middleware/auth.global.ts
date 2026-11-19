const PUBLIC_ROUTES = ['/login', '/register']

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useAuth()
  const isPublic = PUBLIC_ROUTES.includes(to.path)
  if (!loggedIn.value && !isPublic) return navigateTo('/login')
  if (loggedIn.value && isPublic) return navigateTo('/travel')
})
