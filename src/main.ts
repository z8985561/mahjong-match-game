import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'

// 创建Vue应用
const app = createApp(App)

// 使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
}

// 生产模式警告设置
if (import.meta.env.PROD) {
  app.config.warnHandler = (msg, instance, trace) => {
    // 生产环境忽略某些警告
    const ignoreWarnings = [
      'Component is missing template or render function',
      'Failed to resolve component'
    ]
    
    if (!ignoreWarnings.some(warning => msg.includes(warning))) {
      console.warn('Vue警告:', msg)
      console.warn('Trace:', trace)
    }
  }
}

// 挂载应用
app.mount('#app')

// 开发模式下的热更新
if (import.meta.hot) {
  import.meta.hot.accept()
}

// 全局性能监控
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
  })
}