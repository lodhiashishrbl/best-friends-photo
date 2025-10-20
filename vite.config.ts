import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/best-friends-photo/', // 👈 your repo name here
  plugins: [react()],
})
