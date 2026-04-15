import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    base: './'  // 使用相对路径
  }
})