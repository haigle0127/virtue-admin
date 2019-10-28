/** 系统配置路由表 **/
import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: 'noRedirect',
  name: 'System',
  meta: {
    title: 'systemManage',
    icon: 'system-manage'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user'),
      name: 'User',
      meta: { title: 'userManage' }
    },
    {
      path: 'role',
      component: () => import('@/views/system/role'),
      name: 'Role',
      meta: { title: 'roleManage' }
    },
    {
      path: 'menu',
      component: () => import('@/views/system/menu'),
      name: 'Menu',
      meta: { title: 'menuManage' }
    }
  ]
}

export default systemRouter
