/** 系统配置路由表 **/
import Layout from '@/layout/index.vue'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: 'noRedirect',
  name: 'System',
  meta: { title: '系统管理', icon: 'system-manage' },
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user.vue'),
      name: 'User',
      meta: { title: '用户管理' }
    },
    {
      path: 'role',
      component: () => import('@/views/system/role.vue'),
      name: 'Role',
      meta: { title: '角色管理' }
    },
    {
      path: 'menu',
      component: () => import('@/views/system/menu.vue'),
      name: 'Menu',
      meta: { title: '权限管理' }
    }
  ]
}

export default systemRouter
