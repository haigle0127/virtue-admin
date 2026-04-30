<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div>
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size===item.value" :command="item.value">
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app.js'
import { useTagsViewStore } from '@/store/modules/tagsView.js'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()

const sizeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Medium', value: 'medium' },
  { label: 'Small', value: 'small' },
  { label: 'Mini', value: 'mini' }
]

const size = computed(() => appStore.size)

const handleSetSize = (size) => {
  appStore.setSize(size)
  refreshView()
  ElMessage({
    message: 'Switch Size Success',
    type: 'success'
  })
}

const refreshView = () => {
  tagsViewStore.delAllCachedViews()
  const { fullPath } = route
  router.replace({
    path: '/redirect' + fullPath
  })
}
</script>
