import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/crab-champions-build-advisor/', // GitHubのリポジトリ名に合わせて変更してください
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
