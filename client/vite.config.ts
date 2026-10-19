import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward any requests starting with /api to your Express backend
      '/api': {
        target: 'http://localhost:3000', // Change 3000 to your Express server's port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
