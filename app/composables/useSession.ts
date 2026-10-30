import type { LoginResult } from '~/types/api'

const COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7
}

/**
 * 登录令牌存储。访问令牌有效期 15 分钟，过期后由 useApi 单飞刷新
 */
export function useSession() {
  // cookie 负责持久化，useState 负责同一页面内所有 useApi 实例共享最新令牌
  const accessCookie = useCookie<string | null>('virtue_access_token', COOKIE_OPTIONS)
  const refreshCookie = useCookie<string | null>('virtue_refresh_token', COOKIE_OPTIONS)
  const accessToken = useState<string | null>('virtue:access-token', () => accessCookie.value ?? null)
  const refreshToken = useState<string | null>('virtue:refresh-token', () => refreshCookie.value ?? null)

  function setTokens(data: LoginResult) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    accessCookie.value = data.accessToken
    refreshCookie.value = data.refreshToken
  }

  function clear() {
    accessToken.value = null
    refreshToken.value = null
    accessCookie.value = null
    refreshCookie.value = null
  }

  return { accessToken, refreshToken, setTokens, clear }
}
