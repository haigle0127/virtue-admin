import type { UserInfo } from '~/types/api'

export function useAuth() {
  const api = useApi()
  const session = useSession()
  const user = useState<UserInfo | null>('virtue:user', () => null)

  const isLoggedIn = computed(() => !!session.accessToken.value)

  async function login(username: string, password: string) {
    const tokens = await api.login(username, password)
    session.setTokens(tokens)
    await loadUser(true)
  }

  async function loadUser(force = false) {
    if (user.value && !force) {
      return user.value
    }
    user.value = await api.me()
    return user.value
  }

  async function logout() {
    try {
      if (session.accessToken.value) {
        await api.logout()
      }
    } catch {
      // 退出接口失败也要清掉本地登录态
    } finally {
      session.clear()
      user.value = null
      await navigateTo('/login')
    }
  }

  return { user, isLoggedIn, login, loadUser, logout }
}
