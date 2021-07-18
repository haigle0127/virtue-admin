<template>
  <div class="dashboard-panel-container">
    <div class="clearfix">
      <pan-thumb :image="avatar ? avatar : 'https://haigle.gitee.io/static_resources/head.png'" style="float: left">
        权限 : <span v-for="item in roles" :key="item" class="pan-info-roles">{{ item }}</span>
      </pan-thumb>
      <github-corner style="position: absolute; top: 0; border: 0; right: 0;" />
      <div class="info-container">
        <span class="display_name">{{ name }}</span>
        <span style="font-size:20px;padding-top:20px;display:inline-block;">永远相信 美好的事情即将发生</span>
      </div>
    </div>
    <div>
      <img :src="virtuePng" class="virtuePng" alt="">
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'
import GithubCorner from '@/components/GithubCorner'
import virtuePng from '@/assets/dashboard_images/virtue.png'

export default {
  name: 'DashboardPanel',
  components: { PanThumb, GithubCorner },
  data() {
    return {
      virtuePng: virtuePng + '?' + +new Date()
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  }
}
</script>

<style lang="scss" scoped>
  .virtuePng {
    display: block;
    width: 45%;
    margin: 0 auto;
  }

  .dashboard-panel-container {
    background-color: #e3e3e3;
    min-height: 100vh;
    padding: 50px 60px 0;
    .pan-info-roles {
      font-size: 12px;
      font-weight: 700;
      color: #333;
      display: block;
    }
    .info-container {
      position: relative;
      margin-left: 190px;
      height: 150px;
      line-height: 200px;
      .display_name {
        font-size: 48px;
        line-height: 48px;
        color: #212121;
        position: absolute;
        top: 25px;
      }
    }
  }
</style>
