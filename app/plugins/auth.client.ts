export default defineNuxtPlugin(() => {
  const session = useSession()
  if (!session.accessToken.value) {
    return
  }
  // 同步当前用户信息，失败时由 useApi 统一处理令牌失效
  useAuth().loadUser().catch(() => {})
})
