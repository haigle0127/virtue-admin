import router from './router/index.js'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth.js'
import getPageTitle from '@/utils/get-page-title.js'
import { useUserStore } from '@/store/modules/user.js'
import { usePermissionStore } from '@/store/modules/permission.js'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)

  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const userStore = useUserStore()
      const hasPermissions = userStore.permissions && userStore.permissions.length > 0
      if (hasPermissions) {
        next()
      } else {
        try {
          const { permissions } = await userStore.getInfo()
          const permissionStore = usePermissionStore()
          const accessRoutes = await permissionStore.generateRoutes(permissions)
          accessRoutes.forEach(route => router.addRoute(route))
          next({ ...to, replace: true })
        } catch (error) {
          await userStore.resetToken()
          if (!(error instanceof Error)) {
            ElMessage.error(error || '有错误。')
          }
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
