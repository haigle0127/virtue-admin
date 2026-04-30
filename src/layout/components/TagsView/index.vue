<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tagRefs"
        :key="tag.path"
        :class="[isActive(tag)?'active':'', isAffix(tag)?'affix':'']"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        @click.middle="!isAffix(tag)?closeSelectedTag(tag):''"
        @contextmenu.prevent="openMenu(tag,$event)"
      >
        {{ tag.title }}
        <el-icon v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)"><Close /></el-icon>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">Refresh</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">Close</li>
      <li @click="closeOthersTags">Close Others</li>
      <li @click="closeAllTags(selectedTag)">Close All</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScrollPane from './ScrollPane.vue'
import { resolvePath } from '@/utils/resolve-path.js'
import { useTagsViewStore } from '@/store/modules/tagsView.js'
import { usePermissionStore } from '@/store/modules/permission.js'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const permissionStore = usePermissionStore()

const scrollPaneRef = ref(null)
const tagRefs = ref([])
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})
const affixTags = ref([])

const visitedViews = computed(() => tagsViewStore.visitedViews)
const routes = computed(() => permissionStore.routes)

watch(() => route.path, () => {
  addTags()
  moveToCurrentTag()
})

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

onMounted(() => {
  initTags()
  addTags()
})

const isActive = (r) => {
  return r.path === route.path
}

const isAffix = (tag) => {
  return tag.meta && tag.meta.affix
}

const filterAffixTags = (routes, basePath = '/') => {
  let tags = []
  routes.forEach(route => {
    if (route.meta && route.meta.affix) {
      const tagPath = resolvePath(basePath, route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

const initTags = () => {
  affixTags.value = filterAffixTags(routes.value)
  for (const tag of affixTags.value) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

const addTags = () => {
  const { name } = route
  if (name) {
    tagsViewStore.addView(route)
  }
}

const moveToCurrentTag = () => {
  const tags = tagRefs.value
  nextTick(() => {
    for (const tag of tags) {
      if (tag.to.path === route.path) {
        scrollPaneRef.value.moveToTarget(tag)
        if (tag.to.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView(route)
        }
        break
      }
    }
  })
}

const refreshSelectedTag = (view) => {
  tagsViewStore.delCachedView(view)
  const { fullPath } = view
  nextTick(() => {
    router.replace({
      path: '/redirect' + fullPath
    })
  })
}

const closeSelectedTag = (view) => {
  tagsViewStore.delView(view)
  if (isActive(view)) {
    toLastView(tagsViewStore.visitedViews, view)
  }
}

const closeOthersTags = () => {
  router.push(selectedTag.value)
  tagsViewStore.delOthersViews(selectedTag.value)
  moveToCurrentTag()
}

const closeAllTags = (view) => {
  tagsViewStore.delAllViews()
  if (affixTags.value.some(tag => tag.path === view.path)) {
    return
  }
  toLastView(tagsViewStore.visitedViews, view)
}

const toLastView = (visitedViews, view) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    if (view.name === 'Dashboard') {
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

const openMenu = (tag, e) => {
  const menuMinWidth = 105
  const offsetLeft = scrollPaneRef.value.$el.getBoundingClientRect().left
  const offsetWidth = scrollPaneRef.value.$el.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  const l = e.clientX - offsetLeft + 15

  if (l > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = l
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

const closeMenu = () => {
  visible.value = false
}

const handleScroll = () => {
  closeMenu()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);

  .tags-view-wrapper {
    .tags-view-item {
      position: relative;
      top: 3px;
      display: inline-flex;
      align-items: center;
      height: calc(100% - 6px);
      cursor: pointer;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      color: #495060;
      background: #fff;
      padding: 0 15px 0 8px;
      font-size: 12px;
      margin-left: 4px;
      box-sizing: border-box;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &:not(.active):hover {
        color: var(--el-color-primary);
      }

      &.active {
        background-color: var(--el-color-primary);
        color: #fff;
        border-color: var(--el-color-primary);

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }

      &:not(.affix):hover {
        .el-icon-close {
          display: block;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      position: absolute;
      top: 50%;
      right: 5px;
      display: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      text-align: center;
      line-height: 12px;
      transform: translateY(-50%);
      transition: all .3s cubic-bezier(.645, .045, .355, 1);

      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }

    &.active {
      .el-icon-close {
        color: #fff;
      }
    }
  }
}
</style>
