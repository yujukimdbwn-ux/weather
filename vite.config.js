import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'favicon.svg'],
      manifest: {
        name: '인계동 날씨 알림',
        short_name: '날씨 알림',
        description: '수원시 인계동 실시간 날씨 알림 앱',
        theme_color: '#0f2027',
        background_color: '#0f2027',
        display: 'standalone',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
