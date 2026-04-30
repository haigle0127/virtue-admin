<template>
  <div :class="{'has-logo':settingsStore.sidebarLogo}">
    <logo v-if="settingsStore.sidebarLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="menuRoute in permissionStore.routes" :key="menuRoute.path" :item="menuRoute" :base-path="menuRoute.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/styles/variables.module.scss'
import { usePermissionStore } from '@/store/modules/permission.js'
import { useAppStore } from '@/store/modules/app.js'
import { useSettingsStore } from '@/store/modules/settings.js'

const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const isCollapse = computed(() => {
  return !appStore.sidebar.opened
})
</script>
