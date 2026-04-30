import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/user.js'
import { getToken, setToken, removeToken } from '@/utils/auth.js'
import router, { resetRouter } from '@/router/index.js'
import { usePermissionStore } from './permission.js'
import { useTagsViewStore } from './tagsView.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    permissions: []
  }),

  getters: {
    hasToken: (state) => !!state.token
  },

  actions: {
    async login(userInfo) {
      const { account, password } = userInfo
      const response = await login({ account: account.trim(), password: password })
      const { data } = response
      this.token = data
      setToken(data)
    },

    async getInfo() {
      const response = await getInfo()
      const { data } = response

      if (!data) {
        throw new Error('验证失败, 请重新登录.')
      }

      const { username, avatar, roles, permissions } = data

      if (!permissions || permissions.length <= 0) {
        throw new Error('暂无权限访问!')
      }

      this.roles = roles
      this.permissions = permissions
      this.name = username
      this.avatar = avatar

      return data
    },

    async logout() {
      await logout()
      this.token = ''
      this.roles = []
      this.permissions = []
      removeToken()
      resetRouter()
    },

    resetToken() {
      this.token = ''
      this.roles = []
      this.permissions = []
      removeToken()
    },

    async changeRoles(menu) {
      const token = menu + '-token'
      this.token = token
      setToken(token)

      await this.getInfo()

      resetRouter()

      const permissionStore = usePermissionStore()
      const accessRoutes = await permissionStore.generateRoutes(this.permissions)
      accessRoutes.forEach(route => {
        router.addRoute(route)
      })

      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
    }
  }
})
