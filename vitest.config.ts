import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: {
    alias: {
      '@gregui/tokens': fileURLToPath(new URL('./packages/tokens/src/index.ts', import.meta.url)),
      '@gregui/localization': fileURLToPath(
        new URL('./packages/localization/src/index.tsx', import.meta.url),
      ),
      '@gregui/react': fileURLToPath(new URL('./packages/react/src/index.tsx', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
  },
});
