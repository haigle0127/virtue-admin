<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import statisticDashboard from './statistic/index.vue'
import panelDashboard from './panel/index.vue'

export default {
  name: 'Dashboard',
  components: { statisticDashboard, panelDashboard },
  data() {
    return {
      currentRole: 'statisticDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles',
      'permissions'
    ])
  },
  created() {
    if (!this.permissions.includes('home-statistic')) {
      this.currentRole = 'panelDashboard'
    }
  }
}
</script>
