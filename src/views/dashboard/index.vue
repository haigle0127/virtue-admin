<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import statisticDashboard from './statistic'
import panelDashboard from './panel'

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
      'roles'
    ])
  },
  created() {
    if (!this.permissions.includes('home-statistic')) {
      this.currentRole = 'panelDashboard'
    }
  }
}
</script>
