import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'www.cats-up.fun',
      'cats-up.fun',
      '.localhost'
    ]
  },
  preview: {
    allowedHosts: [
      'www.cats-up.fun',
      'cats-up.fun'
    ],
    host: true,
    port: Number(process.env.PORT) || 3000
  }
})