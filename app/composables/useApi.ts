import type { ApiResult, LoginResult } from '~/types/api'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  query?: Record<string, unknown>
  auth?: boolean
}

/** 后端返回的业务错误，code 与 ApiResult.code 一致 */
export class ApiError extends Error {
  code: number

  constructor(message: string, code = 500) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

// 单飞刷新：并发请求同时过期时只发起一次刷新，避免刷新令牌被判定为重放
let refreshPromise: Promise<boolean> | null = null

function errorStatus(error: unknown): number | undefined {
  const e = error as { status?: number, statusCode?: number, response?: { status?: number } }
  return e?.status ?? e?.statusCode ?? e?.response?.status
}

function errorBody(error: unknown): Partial<ApiResult<unknown>> | undefined {
  const e = error as { data?: Partial<ApiResult<unknown>>, response?: { _data?: Partial<ApiResult<unknown>> } }
  return e?.data ?? e?.response?._data
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }
  const body = errorBody(error)
  const message = body?.msg || (error as Error)?.message || '网络异常，请稍后重试'
  return new ApiError(message, body?.code ?? errorStatus(error) ?? 500)
}

export function useApi() {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase || '').replace(/\/+$/, '')
  const session = useSession()

  function endpoint(path: string) {
    return `${base}${path}`
  }

  async function refreshTokens(): Promise<boolean> {
    if (!session.refreshToken.value) {
      return false
    }
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const result = await $fetch<ApiResult<LoginResult>>(endpoint('/admin-api/auth/refresh-token'), {
            method: 'POST',
            body: { refreshToken: session.refreshToken.value }
          })
          if (result.code !== 200 || !result.data) {
            return false
          }
          session.setTokens(result.data)
          return true
        } catch {
          return false
        } finally {
          refreshPromise = null
        }
      })()
    }
    return refreshPromise
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, query, auth = true } = options

    const send = () => {
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
      }
      if (auth && session.accessToken.value) {
        headers.Authorization = `Bearer ${session.accessToken.value}`
      }
      return $fetch<ApiResult<T>>(endpoint(path), { method, body: body as never, query: query as never, headers })
    }

    const sentToken = auth ? session.accessToken.value : null
    let result: ApiResult<T>
    try {
      result = await send()
    } catch (error) {
      const unauthorized = auth && (errorStatus(error) === 401 || errorBody(error)?.code === 401)
      if (!unauthorized) {
        throw toApiError(error)
      }
      // 并发请求期间其他请求已完成刷新时，令牌已变化，直接重试即可
      const tokenChanged = session.accessToken.value && session.accessToken.value !== sentToken
      if (!tokenChanged) {
        const refreshed = await refreshTokens()
        if (!refreshed) {
          session.clear()
          await navigateTo('/login')
          throw new ApiError('登录已过期，请重新登录', 401)
        }
      }
      try {
        result = await send()
      } catch (retryError) {
        throw toApiError(retryError)
      }
    }

    if (result.code !== 200) {
      throw new ApiError(result.msg || '请求失败', result.code)
    }
    return result.data
  }

  return {
    request,
    login(username: string, password: string) {
      return request<LoginResult>('/admin-api/auth/login', {
        method: 'POST',
        body: { username, password },
        auth: false
      })
    },
    logout() {
      return request<boolean>('/admin-api/auth/logout', { method: 'POST' })
    },
    me() {
      return request<import('~/types/api').UserInfo>('/admin-api/auth/me')
    }
  }
}
