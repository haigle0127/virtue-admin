import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters.js'

Vue.use(Vuex)

// you do not need `import app from './modules/app.js'`
// it will auto require all vuex module from modules file
const modulesFiles = import.meta.glob('./modules/**/*.js', { eager: true })

const modules = {}
Object.keys(modulesFiles).forEach(modulePath => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')
  modules[moduleName] = modulesFiles[modulePath].default
})

const store = new Vuex.Store({
  modules,
  getters
})

export default store
