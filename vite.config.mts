import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, cpSync } from 'fs'
import { fileURLToPath } from 'url'

const configDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: resolve(configDir, 'newtab.html'),
      },
    },
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        const distDir = resolve(configDir, 'dist')
        if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
        copyFileSync(resolve(configDir, 'manifest.json'), resolve(distDir, 'manifest.json'))
        // Copy icon.png to dist root
        const iconSrc = resolve(configDir, 'icon.png')
        if (existsSync(iconSrc)) copyFileSync(iconSrc, resolve(distDir, 'icon.png'))
        // Copy scrshot.png for onboarding
        const scrshotSrc = resolve(configDir, 'scrshot.png')
        if (existsSync(scrshotSrc)) copyFileSync(scrshotSrc, resolve(distDir, 'scrshot.png'))
        // Copy _locales directory
        const localesSrc = resolve(configDir, '_locales')
        if (existsSync(localesSrc)) cpSync(localesSrc, resolve(distDir, '_locales'), { recursive: true })
      },
    },
  ],
})
