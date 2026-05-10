import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Shared Firebase helpers live in repo `backend/lib` — single source of truth. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@wizmath/lib': path.resolve(__dirname, '../backend/lib'),
    },
  },
})
