import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'www.cats-up.fun',
      'cats-up.fun',
      'localhost',
      '.localhost'
    ],
    host: true,
    port: 3000,
    strictPort: true
  }
})