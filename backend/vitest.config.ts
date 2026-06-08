import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
