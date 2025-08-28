import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/backend/, ''),
        ws: true,
      },
      '/ticketing-service': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ticketing-service/, ''),
        ws: true,
      },
    },
  },
})
