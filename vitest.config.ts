import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        exclude: ['tests/adversarial/stretch-round2.test.ts'],
        globals: true,
    },
});
