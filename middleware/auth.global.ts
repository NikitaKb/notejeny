export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()
  const isAuthPage = to.path === '/auth'

  try {
    await fetchUser()
  } catch {
    user.value = null
  }

  if (!user.value && !isAuthPage) {
    return navigateTo('/auth')
  }

  if (user.value && (isAuthPage || to.path === '/')) {
    return navigateTo('/dashboard')
  }
})
