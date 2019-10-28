<template>
  <div class="login-container" :style="'background:url('+ backgroundUrl +');'">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">
          {{ $t('login.title') }}
        </h3>
        <lang-select class="set-language" />
      </div>

      <el-form-item prop="account">
        <span class="svg-container">
          <svg-icon icon-class="account" />
        </span>
        <el-input
          ref="account"
          v-model="loginForm.account"
          :placeholder="$t('login.account')"
          name="account"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            :placeholder="$t('login.password')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button :loading="loading" type="info" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">
        {{ $t('login.login') }}
      </el-button>

      <div style="position:relative">
        <div class="tips">
          <span>{{ $t('login.account') }}: 940121265@qq.com</span>
          <span>{{ $t('login.password') }}: 123456</span>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import LangSelect from '@/components/LangSelect'
// import SocialSign from './components/SocialSignin'

// import { login } from '@/api/user'

export default {
  name: 'Login',
  components: { LangSelect },
  data() {
    const validateAccount = (rule, value, callback) => {
      if (value.length < 3) {
        callback(new Error('请输入邮箱、手机或用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码必须大于五位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        account: '940121265@qq.com',
        password: '123456'
      },
      loginRules: {
        account: [{ required: true, trigger: 'blur', validator: validateAccount }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      backgroundUrl: 'https://haigle.gitee.io/static_resources/around/image/architectural-architectural-design-architecture-921319.png',
      backgroundUrlData: [
        'https://haigle.gitee.io/static_resources/around/image/architectural-architectural-design-architecture-921319.png',
        'https://haigle.gitee.io/static_resources/around/image/webdesign-layout-sketching-picjumbo-com.png',
        'https://haigle.gitee.io/static_resources/around/image/blur-bright-close-up-1405773.png',
        'https://haigle.gitee.io/static_resources/around/image/beach-coast-daytime-884169.png',
        'https://haigle.gitee.io/static_resources/around/image/dirt-road-fashion-girl-144474.png',
        'https://haigle.gitee.io/static_resources/around/image/back-view-beach-best-friends-2647973.png',
        'https://haigle.gitee.io/static_resources/around/image/ancient-architecture-building-1010657.png',
        'https://haigle.gitee.io/static_resources/around/image/delicious-freshness-fruits-2209382.png'
      ]
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
    this.getBackgroundUrl()
  },
  mounted() {
    if (this.loginForm.account === '') {
      this.$refs.account.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            console.log(this.otherQuery)
            this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            this.loading = false
          }).catch(() => {
            // 登录参数可能有误，请看store/modules/user.js
            console.log('error submit!')
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    // eslint-disable-next-line vue/no-dupe-keys
    getBackgroundUrl() {
      const data = this.backgroundUrlData
      const index = Math.floor((Math.random() * data.length))
      this.backgroundUrl = data[index]
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #4a4b57;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
