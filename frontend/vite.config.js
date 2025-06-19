import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6969',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'localhost',
      'faithful-mallard-superb.ngrok-free.app',
      'agreed-dean-delivered-legacy.trycloudflare.com',
    ]
  }
})
