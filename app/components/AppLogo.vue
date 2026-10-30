<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2.5 overflow-hidden">
    <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/25">
      <UIcon name="i-lucide-hexagon" class="size-5 text-white" />
    </div>
    <div v-if="!collapsed" class="min-w-0 leading-tight">
      <p class="truncate text-sm font-semibold text-highlighted">
        Virtue
      </p>
      <p class="truncate text-[11px] text-muted">
        管理后台
      </p>
    </div>
  </NuxtLink>
</template>
