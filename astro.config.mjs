import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sqlrenshu.com',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { exclude: ['@electric-sql/pglite'] },
    worker: { format: 'es' },
  },
});
