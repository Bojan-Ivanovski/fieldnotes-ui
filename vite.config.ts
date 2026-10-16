import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    lib: {
      entry: Object.fromEntries(
        [
          'index',
          'primitives',
          'core',
          'composites',
          'patterns',
          'themes',
          'hooks',
        ].map((name) => [
          name,
          resolve(
            import.meta.dirname,
            `src/${name === 'index' ? name : name + '/index'}.ts`,
          ),
        ]),
      ),
      formats: ['es'],
      cssFileName: 'styles',
      fileName: (_, name) => `${name}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/'),
      output: {
        banner: '"use client";',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
});
