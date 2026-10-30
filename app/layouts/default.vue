<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const router = useRouter()
const open = ref(false)

function closeSidebar() {
  open.value = false
}

const pageLinks = computed<NavigationMenuItem[]>(() => [{
  label: '仪表盘',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: closeSidebar
}, {
  label: '系统管理',
  icon: 'i-lucide-settings-2',
  type: 'trigger',
  defaultOpen: true,
  children: [{
    label: '用户管理',
    icon: 'i-lucide-users',
    to: '/system/users',
    onSelect: closeSidebar
  }, {
    label: '角色管理',
    icon: 'i-lucide-shield-check',
    to: '/system/roles',
    onSelect: closeSidebar
  }, {
    label: '字典管理',
    icon: 'i-lucide-book-open',
    to: '/system/dict',
    onSelect: closeSidebar
  }]
}, {
  label: '个人设置',
  icon: 'i-lucide-user-cog',
  to: '/settings',
  onSelect: closeSidebar
}])

const searchGroups = computed(() => [{
  id: 'pages',
  label: '页面',
  items: [{
    label: '仪表盘',
    icon: 'i-lucide-layout-dashboard',
    to: '/'
  }, {
    label: '用户管理',
    icon: 'i-lucide-users',
    to: '/system/users'
  }, {
    label: '角色管理',
    icon: 'i-lucide-shield-check',
    to: '/system/roles'
  }, {
    label: '字典管理',
    icon: 'i-lucide-book-open',
    to: '/system/dict'
  }, {
    label: '个人设置',
    icon: 'i-lucide-user-cog',
    to: '/settings'
  }]
}, {
  id: 'actions',
  label: '快捷操作',
  items: [{
    label: '新建用户',
    icon: 'i-lucide-user-plus',
    to: '/system/users?create=1'
  }, {
    label: '新建角色',
    icon: 'i-lucide-shield-plus',
    to: '/system/roles?create=1'
  }, {
    label: '新建字典类型',
    icon: 'i-lucide-book-plus',
    to: '/system/dict?create=1'
  }]
}])

defineShortcuts({
  'g-h': () => router.push('/'),
  'g-u': () => router.push('/system/users'),
  'g-r': () => router.push('/system/roles'),
  'g-d': () => router.push('/system/dict')
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <AppLogo :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="pageLinks"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <AppUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="searchGroups" />

    <slot />
  </UDashboardGroup>
</template>
