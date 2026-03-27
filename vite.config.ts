import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
      // Explicitly pull PORT from the loaded environment
      port: Number(env.PORT) || 3000,
      strictPort: true
    }
  }
})