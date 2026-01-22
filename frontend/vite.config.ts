import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['psms.kulkonisa.co.za', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://ksa_backend:8000',
        changeOrigin: true,
      },
    },
  },
})
