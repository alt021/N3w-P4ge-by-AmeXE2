import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, cpSync } from 'fs'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'newtab.html'),
      },
    },
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(distDir, 'manifest.json'))
        // Copy icon.png to dist root
        const iconSrc = resolve(__dirname, 'icon.png')
        if (existsSync(iconSrc)) copyFileSync(iconSrc, resolve(distDir, 'icon.png'))
        // Copy _locales directory
        const localesSrc = resolve(__dirname, '_locales')
        if (existsSync(localesSrc)) cpSync(localesSrc, resolve(distDir, '_locales'), { recursive: true })
      },
    },
  ],
})
