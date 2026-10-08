import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // La demo se publica en https://<usuario>.github.io/ZaHub/admin/
  base: mode === 'demo' ? '/ZaHub/admin/' : '/',
  server: { fs: { allow: ['..'] } }, // permite importar ../shared (backend simulado)
}))
