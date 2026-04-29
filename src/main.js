import { createApp } from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css'

import ElementPlus, { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import 'element-plus/dist/index.css'

import '@/styles/index.scss'

import App from './App.vue'
import store from './store/index.js'
import router from './router/index.js'

import SvgIcon from '@/components/SvgIcon/index.vue'
import * as filters from './filters/index.js'

import 'virtual:svg-icons-register'

import './permission'

// directives
import waves from '@/directive/waves/waves.js'
import permission from '@/directive/permission/permission.js'
import clipboard from '@/directive/clipboard/clipboard.js'
import drag from '@/directive/el-drag-dialog/drag.js'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { isString, isArray } from '@/utils/validate.js'
import settings from '@/settings.js'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, {
  size: Cookies.get('size') || 'medium'
})

app.use(store)
app.use(router)

app.component('SvgIcon', SvgIcon)

app.config.globalProperties.$filters = filters
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$notify = ElNotification
app.config.globalProperties.$icons = ElementPlusIconsVue

app.directive('waves', waves)
app.directive('permission', permission)
app.directive('clipboard', clipboard)
app.directive('el-drag-dialog', drag)

const { errorLog: needErrorLog } = settings

function checkNeed() {
  const env = import.meta.env.MODE
  if (isString(needErrorLog)) {
    return env === needErrorLog
  }
  if (isArray(needErrorLog)) {
    return needErrorLog.includes(env)
  }
  return false
}

if (checkNeed()) {
  app.config.errorHandler = function(err, vm, info) {
    store.dispatch('errorLog/addErrorLog', {
      err,
      vm,
      info,
      url: window.location.href
    })
    console.error(err, info)
  }
}

app.mount('#app')
