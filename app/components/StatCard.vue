<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  icon: string
  loading?: boolean
}>()
</script>

<template>
  <UPageCard variant="subtle" :ui="{ container: 'gap-3' }">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-sm text-muted">
          {{ label }}
        </p>
        <p class="mt-2 text-3xl font-semibold tracking-tight text-highlighted">
          <UIcon v-if="loading" name="i-lucide-loader-circle" class="size-6 animate-spin text-dimmed" />
          <span v-else>{{ value }}</span>
        </p>
      </div>
      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <UIcon :name="icon" class="size-5 text-primary" />
      </div>
    </div>
    <p v-if="hint" class="text-xs text-dimmed">
      {{ hint }}
    </p>
  </UPageCard>
</template>
