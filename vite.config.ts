import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// 상대 경로 base + HashRouter 조합이라 Vercel·GitHub Pages 어느 경로에 올려도 동작한다.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '초록 친구 – 실내 화초 가이드',
        short_name: '초록 친구',
        description: '그림과 짧은 설명으로 따라 하는 실내 화초 키우기',
        lang: 'ko',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        background_color: '#f4f8f3',
        theme_color: '#2f6b45',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 앱 전체(화초 데이터·일러스트 포함)를 설치 시점에 미리 캐시 → 비행기 모드에서도 열림
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
