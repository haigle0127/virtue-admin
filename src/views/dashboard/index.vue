<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user.js'
import StatisticDashboard from './statistic/index.vue'
import PanelDashboard from './panel/index.vue'

const userStore = useUserStore()
const currentRole = shallowRef(StatisticDashboard)

onMounted(() => {
  if (!userStore.permissions.includes('home-statistic')) {
    currentRole.value = PanelDashboard
  }
})
</script>
