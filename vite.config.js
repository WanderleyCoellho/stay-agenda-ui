import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Stay Agenda', // Nome completo
        short_name: 'StayAgenda', // Nome que aparece embaixo do ícone no celular
        description: 'Sistema de Gestão para Estética e Barbearia',
        theme_color: '#6f42c1', // Cor da barra de status do celular (Roxo)
        background_color: '#ffffff',
        display: 'standalone', // Remove a barra de URL do navegador (Parece nativo)
        orientation: 'portrait', // Bloqueia a rotação se quiser (opcional)
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // Você precisa criar essa imagem
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Você precisa criar essa imagem
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})