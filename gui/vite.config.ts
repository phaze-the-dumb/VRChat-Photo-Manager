import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    cssMinify: 'lightningcss',
    minify: 'terser',
    outDir: '../ui',
    emptyOutDir: true
  },
  base: './'
})
