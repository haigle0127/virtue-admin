import { defineStore } from 'pinia'
import { asyncRoutes, constantRoutes } from '@/router/index.js'

function hasPermission(permissions, route) {
  if (route.meta && route.meta.permissions) {
    return permissions.some(role => route.meta.permissions.includes(role))
  } else {
    return true
  }
}

export function filterAsyncRoutes(routes, permissions) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })

  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: []
  }),

  getters: {
    permissionRoutes: (state) => state.routes
  },

  actions: {
    generateRoutes(permissions) {
      let accessedRoutes
      if (permissions.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions)
      }
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      return accessedRoutes
    }
  }
})
