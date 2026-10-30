<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const title = computed(() => String(props.error.statusCode) === '404' ? '页面不存在' : '页面出错了')

useSeoMeta({
  title,
  description: '请求的页面无法访问'
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
