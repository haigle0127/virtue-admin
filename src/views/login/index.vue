<template>
  <div class="login-container">
    <video
      v-if="isVideoBackground"
      class="login-background"
      :src="backgroundUrl"
      autoplay
      muted
      loop
      playsinline
    />
    <div
      v-else
      class="login-background"
      :style="{ backgroundImage: 'url(' + backgroundUrl + ')' }"
    />
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title"> VIRTUE </h3>
      </div>

      <el-form-item prop="account">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="accountRef"
          v-model="loginForm.account"
          placeholder="账号"
          name="account"
          type="account"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model:visible="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="passwordRef"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.prevent="handleLogin">登录</el-button>

      <div style="position:relative">
        <div class="tips">
          <span>账号 : admin</span>
          <span>密码 : 123456</span>
        </div>

        <el-button class="thirdparty-button" type="primary" @click="showDialog = true">
          第三方登录
        </el-button>
      </div>
    </el-form>

    <el-dialog v-model="showDialog" title="Or connect with">
      Can not be simulated on local, so please combine you own business simulation! ! !
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user.js'
import SocialSign from './components/SocialSignin.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const accountRef = ref()
const passwordRef = ref()

const loginForm = reactive({
  account: 'admin',
  password: '123456'
})

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

const loginRules = {
  account: [{ required: true, trigger: 'blur', validator: validateAccount }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }]
}

const passwordType = ref('password')
const capsTooltip = ref(false)
const loading = ref(false)
const showDialog = ref(false)
const redirect = ref(undefined)
const otherQuery = ref({})
const backgroundUrl = ref('https://www.haigle.cn/image/image-4.jpg')
const backgroundUrlData = [
  'https://www.haigle.cn/image/image-1.jpg',
  'https://www.haigle.cn/image/image-2.jpg',
  'https://www.haigle.cn/image/image-3.jpg',
  'https://www.haigle.cn/image/image-4.jpg',
  'https://www.haigle.cn/video/blackhole.mp4'
]

const isVideoBackground = computed(() => {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(backgroundUrl.value)
})

watch(() => route.query, (query) => {
  if (query) {
    redirect.value = query.redirect
    otherQuery.value = getOtherQuery(query)
  }
}, { immediate: true })

onMounted(() => {
  if (loginForm.account === '') {
    accountRef.value.focus()
  } else if (loginForm.password === '') {
    passwordRef.value.focus()
  }
})

const checkCapslock = (e) => {
  const { key } = e
  capsTooltip.value = key && key.length === 1 && (key >= 'A' && key <= 'Z')
}

const showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  nextTick(() => {
    passwordRef.value.focus()
  })
}

const handleLogin = () => {
  loginFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      userStore.login(loginForm)
        .then(() => {
          router.push({ path: redirect.value || '/', query: otherQuery.value })
          loading.value = false
        }).catch(() => {
          console.log('error submit!')
          loading.value = false
        })
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

const getOtherQuery = (query) => {
  return Object.keys(query).reduce((acc, cur) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur]
    }
    return acc
  }, {})
}

const getBackgroundUrl = () => {
  const data = backgroundUrlData
  const index = Math.floor((Math.random() * data.length))
  backgroundUrl.value = data[index]
}

getBackgroundUrl()
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

    .el-input__wrapper {
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
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
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;

  .login-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-size: cover;
    background-position: center;
    z-index: 0;
  }

  .login-form {
    position: relative;
    z-index: 1;
    width: 520px;
    max-width: 100%;
    padding: 240px 35px 0;
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
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
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
