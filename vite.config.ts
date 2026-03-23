import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve:{
    alias: {
      '@':"/src"
    }
  },
  server: {
    // allowedHosts: 'all',
    host: true,
    port: 5275,
    proxy: {
      '/api': {
        target: 'http://localhost:8809',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8809',
        ws: true,
      }
    }
  }
})
