import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [
    {
      name: 'consumer-bundle-report',
      generateBundle(_options, bundle) {
        const chunks = Object.fromEntries(
          Object.entries(bundle)
            .filter(([, entry]) => entry.type === 'chunk')
            .map(([name, entry]) =>
              entry.type === 'chunk'
                ? [
                    name,
                    {
                      imports: entry.imports,
                      modules: Object.keys(entry.modules),
                      entry: entry.facadeModuleId,
                      bytes: entry.code.length,
                    },
                  ]
                : [name, {}],
            ),
        );
        this.emitFile({
          type: 'asset',
          fileName: 'bundle-report.json',
          source: JSON.stringify(chunks, null, 2),
        });
      },
    } satisfies Plugin,
    react(),
    ...(process.env.CONSUMER_TAILWIND ? [tailwind()] : []),
  ],
  build: {
    outDir: process.env.CONSUMER_TAILWIND ? 'dist-tailwind' : 'dist',
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        minimal: resolve(import.meta.dirname, 'minimal.html'),
        milestone: resolve(import.meta.dirname, 'milestone.html'),
        library: resolve(import.meta.dirname, 'library.html'),
        navigation: resolve(import.meta.dirname, 'navigation.html'),
        search: resolve(import.meta.dirname, 'search.html'),
        branchPrototype: resolve(import.meta.dirname, 'branch-prototype.html'),
        explorer: resolve(import.meta.dirname, 'explorer.html'),
      },
      output: { manualChunks: undefined },
    },
  },
});
