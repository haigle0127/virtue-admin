import router from './router/index.js'
import store from './store/index.js'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth.js'
import getPageTitle from '@/utils/get-page-title.js'

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
      const hasPermissions = store.getters.permissions && store.getters.permissions.length > 0
      if (hasPermissions) {
        next()
      } else {
        try {
          const { permissions } = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', permissions)
          accessRoutes.forEach(route => router.addRoute(route))
          next({ ...to, replace: true })
        } catch (error) {
          await store.dispatch('user/resetToken')
          ElMessage.error(error || '有错误。')
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
