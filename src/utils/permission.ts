import { useUserStore } from '@/store/modules/user.js'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    const userStore = useUserStore()
    const permissions = userStore.permissions
    const permissionRoles = value

    const hasPermission = permissions.some(role => {
      return permissionRoles.includes(role)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need permissions! Like v-permission="['admin','editor']"`)
    return false
  }
}
