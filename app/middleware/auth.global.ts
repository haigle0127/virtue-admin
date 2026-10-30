export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }
  const { accessToken } = useSession()
  const loggedIn = !!accessToken.value

  if (!loggedIn && to.path !== '/login') {
    return navigateTo({
      path: '/login',
      query: to.fullPath === '/' ? {} : { redirect: to.fullPath }
    })
  }

  if (loggedIn && to.path === '/login') {
    return navigateTo('/')
  }
})
