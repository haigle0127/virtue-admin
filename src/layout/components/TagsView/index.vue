<template>
  <div id="tags-view" class="tags-view">
    <span
      class="tags-view__tool tags-view__tool--first"
      @click="move(-200)"
    >
      <el-icon><DArrowLeft /></el-icon>
    </span>
    <div class="tags-view__scroll">
      <el-scrollbar ref="scrollbarRef" class="h-full" @scroll="scroll">
        <div class="tags-view__wrapper">
          <el-dropdown
            v-for="item in visitedViews"
            :key="item.fullPath"
            ref="dropdownRefs"
            trigger="contextmenu"
            placement="bottom-start"
            popper-class="tags-view-dropdown"
            @visible-change="(visible) => visibleChange(visible, item)"
          >
            <div
              :class="[
                'tags-view__item',
                item?.meta?.affix ? 'tags-view__item--affix' : '',
                { 'is-active': isActive(item) }
              ]"
              @auxclick="closeTabOnMouseMidClick($event, item)"
            >
              <router-link
                :ref="(el) => setTagLinkRef(el, item.fullPath)"
                v-slot="{ navigate }"
                :to="{ ...item }"
                custom
              >
                <div
                  class="tags-view__item--label"
                  @click="navigate"
                >
                  <svg-icon
                    v-if="item?.meta?.icon"
                    :icon-class="item.meta.icon"
                    class="tags-view__item--icon"
                  />
                  {{ item?.meta?.title }}
                  <el-icon
                    v-if="!item?.meta?.affix"
                    class="tags-view__item--close"
                    @click.prevent.stop="closeSelectedTag(item)"
                  >
                    <Close />
                  </el-icon>
                </div>
              </router-link>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :disabled="selectedTag?.fullPath !== item.fullPath"
                  @click="refreshSelectedTag(item)"
                >
                  <el-icon><Refresh /></el-icon>
                  <span>重新加载</span>
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="!!visitedViews?.length && selectedTag?.meta?.affix"
                  @click="closeSelectedTag(item)"
                >
                  <el-icon><Close /></el-icon>
                  <span>关闭标签</span>
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  :disabled="
                    !!visitedViews?.length &&
                      (item.fullPath === visitedViews[0].fullPath ||
                        selectedTag?.fullPath !== item.fullPath)
                  "
                  @click="closeLeftTags(item)"
                >
                  <el-icon><DArrowLeft /></el-icon>
                  <span>关闭左侧标签</span>
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="
                    !!visitedViews?.length &&
                      (item.fullPath === visitedViews[visitedViews.length - 1].fullPath ||
                        selectedTag?.fullPath !== item.fullPath)
                  "
                  @click="closeRightTags(item)"
                >
                  <el-icon><DArrowRight /></el-icon>
                  <span>关闭右侧标签</span>
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  :disabled="selectedTag?.fullPath !== item.fullPath"
                  @click="closeOthersTags(item)"
                >
                  <el-icon><Discount /></el-icon>
                  <span>关闭其他标签</span>
                </el-dropdown-item>
                <el-dropdown-item @click="closeAllTags">
                  <el-icon><Minus /></el-icon>
                  <span>关闭全部标签</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-scrollbar>
    </div>
    <span class="tags-view__tool" @click="move(200)">
      <el-icon><DArrowRight /></el-icon>
    </span>
    <span class="tags-view__tool" @click="refreshSelectedTag(selectedTag)">
      <el-icon><RefreshRight /></el-icon>
    </span>
    <el-dropdown trigger="click" placement="bottom-start">
      <span class="tags-view__tool">
        <el-icon><Menu /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="refreshSelectedTag(selectedTag)">
            <el-icon><Refresh /></el-icon>
            <span>重新加载</span>
          </el-dropdown-item>
          <el-dropdown-item
            :disabled="!!visitedViews?.length && selectedTag?.meta?.affix"
            @click="closeSelectedTag(selectedTag)"
          >
            <el-icon><Close /></el-icon>
            <span>关闭标签</span>
          </el-dropdown-item>
          <el-dropdown-item
            divided
            :disabled="!!visitedViews?.length && selectedTag?.fullPath === visitedViews[0].fullPath"
            @click="closeLeftTags(selectedTag)"
          >
            <el-icon><DArrowLeft /></el-icon>
            <span>关闭左侧标签</span>
          </el-dropdown-item>
          <el-dropdown-item
            :disabled="
              !!visitedViews?.length &&
                selectedTag?.fullPath === visitedViews[visitedViews.length - 1].fullPath
            "
            @click="closeRightTags(selectedTag)"
          >
            <el-icon><DArrowRight /></el-icon>
            <span>关闭右侧标签</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="closeOthersTags(selectedTag)">
            <el-icon><Discount /></el-icon>
            <span>关闭其他标签</span>
          </el-dropdown-item>
          <el-dropdown-item @click="closeAllTags">
            <el-icon><Minus /></el-icon>
            <span>关闭全部标签</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeMount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  DArrowLeft,
  DArrowRight,
  Refresh,
  RefreshRight,
  Close,
  Menu,
  Discount,
  Minus
} from '@element-plus/icons-vue'
import { usePermissionStore } from '@/store/modules/permission.js'
import { useTagsViewStore } from '@/store/modules/tagsView.js'
import SvgIcon from '@/components/SvgIcon/index.vue'

const { currentRoute, push, replace } = useRouter()
const permissionStore = usePermissionStore()
const tagsViewStore = useTagsViewStore()

const visitedViews = computed(() => tagsViewStore.getVisitedViews)
const selectedTag = computed(() => tagsViewStore.getSelectedTag)
const setSelectTag = tagsViewStore.setSelectedTag

const routers = computed(() => permissionStore.routes)

// 过滤 affix tags
const filterAffixTags = (routes, parentPath = '') => {
  let tags = []
  routes.forEach((route) => {
    const tagPath = parentPath ? parentPath + '/' + route.path : route.path
    const cleanPath = tagPath.replace(/\/+/g, '/')
    if (route.meta && route.meta.affix) {
      tags.push({
        ...route,
        path: cleanPath,
        fullPath: cleanPath
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, cleanPath)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

// 初始化 affix tag
const initTags = () => {
  const affixTags = filterAffixTags(routers.value)
  for (const tag of affixTags) {
    if (tag.name) {
      tagsViewStore.addVisitedView(JSON.parse(JSON.stringify(tag)))
    }
  }
}

// 新增 tag
const addTags = () => {
  const { name } = currentRoute.value
  if (name) {
    setSelectTag(currentRoute.value)
    tagsViewStore.addView(currentRoute.value)
  }
}

// 是否是当前 tag
const isActive = (route) => {
  return route.fullPath === currentRoute.value.fullPath
}

// 关闭选中的 tag
const closeSelectedTag = (view) => {
  if (!view) return
  if (view.meta && view.meta.affix) return
  tagsViewStore.delView(view)
  if (isActive(view)) {
    toLastView()
  }
}

// 去最后一个
const toLastView = () => {
  const latestView = visitedViews.value.slice(-1)[0]
  if (latestView) {
    push(latestView)
  } else {
    push('/')
  }
}

// 关闭全部
const closeAllTags = () => {
  tagsViewStore.delAllViews()
  toLastView()
}

// 关闭其它
const closeOthersTags = (view) => {
  if (!view) return
  tagsViewStore.delOthersViews(view)
}

// 关闭左侧
const closeLeftTags = (view) => {
  if (!view) return
  tagsViewStore.delLeftViews(view)
}

// 关闭右侧
const closeRightTags = (view) => {
  if (!view) return
  tagsViewStore.delRightViews(view)
}

// 重新加载
const refreshSelectedTag = async(view) => {
  const target = view || currentRoute.value
  tagsViewStore.delCachedView()
  const { path, query } = target
  await nextTick()
  replace({
    path: '/redirect' + path,
    query: query
  })
}

// 滚动相关
const scrollbarRef = ref()
const scrollLeftNumber = ref(0)

const scroll = ({ scrollLeft }) => {
  scrollLeftNumber.value = scrollLeft
}

const move = (to) => {
  const wrap = scrollbarRef.value?.$el.querySelector('.el-scrollbar__wrap')
  if (wrap) {
    wrap.scrollTo({
      left: scrollLeftNumber.value + to,
      behavior: 'smooth'
    })
  }
}

// 滚动到当前 tag
const tagLinksRefs = ref({})
const setTagLinkRef = (el, fullPath) => {
  if (el) {
    tagLinksRefs.value[fullPath] = el
  }
}

const moveToCurrentTag = async() => {
  await nextTick()
  const wrap = scrollbarRef.value?.$el.querySelector('.el-scrollbar__wrap')
  if (!wrap) return

  const itemEls = document.querySelectorAll('.tags-view__item')
  const currentIndex = Array.from(itemEls).findIndex((el) =>
    el.classList.contains('is-active')
  )
  if (currentIndex > -1) {
    const targetEl = itemEls[currentIndex]
    const offsetLeft = targetEl.offsetLeft
    wrap.scrollTo({
      left: offsetLeft - wrap.offsetWidth / 2 + targetEl.offsetWidth / 2,
      behavior: 'smooth'
    })
  }
}

// 右键菜单 visible 变化
const dropdownRefs = ref([])

const visibleChange = (visible, tagItem) => {
  if (visible) {
    setSelectTag(tagItem)
  }
}

// 中键关闭
const closeTabOnMouseMidClick = (e, item) => {
  if (e.button === 1) {
    e.preventDefault()
    e.stopPropagation()
    closeSelectedTag(item)
  }
}

onBeforeMount(() => {
  initTags()
  addTags()
})

watch(
  () => currentRoute.value,
  () => {
    addTags()
    moveToCurrentTag()
  }
)
</script>

<style lang="scss" scoped>
.tags-view {
  position: relative;
  display: flex;
  width: 100%;
  height: 34px;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  &__scroll {
    flex: 1;
    overflow: hidden;
  }

  &__wrapper {
    display: flex;
    height: 34px;
  }

  &__tool {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    font-size: 14px;
    color: var(--el-text-color-placeholder);
    cursor: pointer;
    border-left: 1px solid var(--el-border-color);

    &:hover {
      color: var(--el-color-black);
    }

    &--first {
      border-right: 1px solid var(--el-border-color);
      border-left: none;
    }
  }

  &__item {
    position: relative;
    top: 3px;
    display: inline-flex;
    align-items: center;
    height: calc(100% - 6px);
    margin-left: 2px;
    font-size: 12px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    box-sizing: border-box;

    &:first-of-type {
      margin-left: 8px;
    }

    &:last-of-type {
      margin-right: 8px;
    }

    &--label {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 17px 0 8px;
      white-space: nowrap;
    }

    &--icon {
      margin-right: 5px;
    }

    &--close {
      position: absolute;
      top: 50%;
      right: 4px;
      display: none;
      width: 12px;
      height: 12px;
      transform: translateY(-50%);
    }

    &:not(.tags-view__item--affix):hover {
      .tags-view__item--close {
        display: block;
      }
    }

    &:not(.is-active):hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      color: #fff;
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);

      .tags-view__item--close {
        color: #fff;
      }
    }
  }
}
</style>

<style lang="scss">
.tags-view-dropdown {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
