import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true, // fail fast if 5173 is already in use — prevents silent port drift
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
