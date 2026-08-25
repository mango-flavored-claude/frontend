import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const normalizeBasePath = (value: string | undefined) => {
  if (!value || value === '/') return '/'
  return `/${value.replace(/^\/+|\/+$/g, '')}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: normalizeBasePath(env.VITE_BASE_PATH),
  }
})
