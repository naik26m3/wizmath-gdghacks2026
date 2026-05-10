import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallel: false,
    isolate: true,
  },
})
