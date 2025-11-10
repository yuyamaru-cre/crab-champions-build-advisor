import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/crab-champions-build-advisor/', // GitHub Pages用の公開パス。devでも有効ですが問題ありません。
  resolve: {
    alias: {
      // OSに依存しない絶対パス解決（WSL/Windows混在でも安全）
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // 0.0.0.0 でlisten（他デバイスやWSL間アクセスを許可）
    port: 5173,
    strictPort: true,
    // WSL/仮想化/ネットワークドライブでの変更検知のためポーリングを有効化
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      // ローカルアクセスでWSが正しく張れるよう明示
      clientPort: 5173,
    },
  },
})
