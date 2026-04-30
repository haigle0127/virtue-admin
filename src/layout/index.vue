<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&appStore.sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{hasTagsView:settingsStore.tagsView}" class="main-container">
      <div :class="{'fixed-header':settingsStore.fixedHeader}">
        <navbar />
        <tags-view v-if="settingsStore.tagsView" />
      </div>
      <app-main />
      <right-panel v-if="settingsStore.showSettings">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RightPanel from '@/components/RightPanel/index.vue'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components/index.js'
import useResizeHandler from './composables/useResizeHandler.js'
import { useAppStore } from '@/store/modules/app.js'
import { useSettingsStore } from '@/store/modules/settings.js'

const appStore = useAppStore()
const settingsStore = useSettingsStore()

useResizeHandler()

const classObj = computed(() => {
  const sidebar = appStore.sidebar
  return {
    hideSidebar: !sidebar.opened,
    openSidebar: sidebar.opened,
    withoutAnimation: sidebar.withoutAnimation,
    mobile: appStore.device === 'mobile'
  }
})

const device = computed(() => appStore.device)

const handleClickOutside = () => {
  appStore.closeSideBar(false)
}
</script>

<style lang="scss" scoped>
  @use "@/styles/mixin.scss" as *;
  @use "@/styles/variables.scss" as *;

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 64px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
