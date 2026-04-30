<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolveMenuPath(onlyOneChild.path)">
        <el-menu-item :index="resolveMenuPath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolveMenuPath(item.path)" teleported>
      <template #title>
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolveMenuPath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { isExternal } from '@/utils/validate.js'
import { resolvePath } from '@/utils/resolve-path.js'
import Item from './Item.vue'
import AppLink from './Link.vue'
import { useAppStore } from '@/store/modules/app.js'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})

const appStore = useAppStore()
const subMenu = ref(null)
const onlyOneChild = ref(null)

function hasOneShowingChild(children = [], parent) {
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    } else {
      onlyOneChild.value = item
      return true
    }
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

function resolveMenuPath(routePath) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return resolvePath(props.basePath, routePath)
}

onMounted(() => {
  const $subMenu = subMenu.value
  if ($subMenu) {
    const handleMouseleave = $subMenu.handleMouseleave
    $subMenu.handleMouseleave = (e) => {
      if (appStore.device === 'mobile') {
        return
      }
      handleMouseleave(e)
    }
  }
})
</script>
