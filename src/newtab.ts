import './newtab.css'

type Theme = 'auto' | 'light' | 'dark'
type SearchEngine = 'browser' | 'google' | 'duckduckgo'
type Lang = 'en' | 'zh'

const STORAGE_KEYS = {
  theme: 'theme',
  showTitle: 'showTitle',
  showTime: 'showTime',
  searchEngine: 'searchEngine',
  showDots: 'showDots',
  lang: 'lang',
}

const SEARCH_URLS: Record<Exclude<SearchEngine, 'browser'>, string> = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
}

const I18N: Record<Lang, Record<string, string>> = {
  en: {
    searchTitle: '$ Search Title',
    timeDisplay: 'Time Display',
    dotBackground: 'Dot Background',
    theme: 'Theme',
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark',
    searchEngine: 'Search Engine',
    browserDefault: 'Browser Default',
    google: 'Google',
    duckduckgo: 'DuckDuckGo',
    language: 'Language',
    english: 'English',
    chinese: '中文',
    placeholder: 'Type to search...',
    go: 'Go',
  },
  zh: {
    searchTitle: '$ 搜索标题',
    timeDisplay: '时间显示',
    dotBackground: '点阵背景',
    theme: '主题',
    auto: '自动',
    light: '浅色',
    dark: '深色',
    searchEngine: '搜索引擎',
    browserDefault: '跟随浏览器',
    google: 'Google',
    duckduckgo: 'DuckDuckGo',
    language: '语言',
    english: 'English',
    chinese: '中文',
    placeholder: '输入搜索内容...',
    go: '前往',
  },
}

function t(key: string): string {
  const lang = getStored(STORAGE_KEYS.lang, ['en', 'zh'], 'en')
  return I18N[lang][key] || key
}

function getStored<T extends string>(key: string, valid: T[], fallback: T): T {
  const v = localStorage.getItem(key) as T | null
  return valid.includes(v!) ? v! : fallback
}

function setStored(key: string, value: string) {
  localStorage.setItem(key, value)
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  setStored(STORAGE_KEYS.theme, theme)
}

function updatePrompt() {
  const prompt = document.querySelector('.prompt') as HTMLElement
  const showTitle = getStored(STORAGE_KEYS.showTitle, ['true', 'false'], 'true') === 'true'
  prompt.classList.toggle('hidden', !showTitle)
}

function updateTime() {
  const el = document.getElementById('time')
  const showTime = getStored(STORAGE_KEYS.showTime, ['true', 'false'], 'false') === 'true'
  if (!el) return
  el.classList.toggle('hidden', !showTime)
  if (!showTime) return
  const now = new Date()
  el.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function updateDots() {
  const showDots = getStored(STORAGE_KEYS.showDots, ['true', 'false'], 'true') === 'true'
  document.body.classList.toggle('show-dots', showDots)
}

function updateUI() {
  const input = document.getElementById('search-input') as HTMLInputElement
  const goBtn = document.querySelector('.search-go') as HTMLElement
  if (input) input.placeholder = t('placeholder')
  if (goBtn) goBtn.textContent = t('go')
}

function search(query: string) {
  const engine = getStored(STORAGE_KEYS.searchEngine, ['browser', 'google', 'duckduckgo'], 'browser')
  if (engine === 'browser' && typeof chrome !== 'undefined' && chrome.search) {
    chrome.search.query({ text: query })
  } else {
    window.location.href = SEARCH_URLS[engine] + encodeURIComponent(query)
  }
}

function getMenuHTML(): string {
  const showTitle = getStored(STORAGE_KEYS.showTitle, ['true', 'false'], 'true') === 'true'
  const showTime = getStored(STORAGE_KEYS.showTime, ['true', 'false'], 'false') === 'true'
  const showDots = getStored(STORAGE_KEYS.showDots, ['true', 'false'], 'true') === 'true'
  const theme = getStored(STORAGE_KEYS.theme, ['auto', 'light', 'dark'], 'auto')
  const engine = getStored(STORAGE_KEYS.searchEngine, ['browser', 'google', 'duckduckgo'], 'browser')
  const lang = getStored(STORAGE_KEYS.lang, ['en', 'zh'], 'en')

  return `
    <button class="menu-item" data-action="toggle-title">
      <span class="menu-label">
        <span class="menu-check ${showTitle ? 'checked' : ''}">${showTitle ? '&#10003;' : ''}</span>
        ${t('searchTitle')}
      </span>
    </button>
    <button class="menu-item" data-action="toggle-time">
      <span class="menu-label">
        <span class="menu-check ${showTime ? 'checked' : ''}">${showTime ? '&#10003;' : ''}</span>
        ${t('timeDisplay')}
      </span>
    </button>
    <button class="menu-item" data-action="toggle-dots">
      <span class="menu-label">
        <span class="menu-check ${showDots ? 'checked' : ''}">${showDots ? '&#10003;' : ''}</span>
        ${t('dotBackground')}
      </span>
    </button>
    <div class="menu-separator"></div>
    <div class="menu-group-title">${t('theme')}</div>
    <button class="menu-item" data-action="set-theme" data-value="auto">
      <span class="menu-label">
        <span class="menu-radio ${theme === 'auto' ? 'selected' : ''}"></span>
        ${t('auto')}
      </span>
    </button>
    <button class="menu-item" data-action="set-theme" data-value="light">
      <span class="menu-label">
        <span class="menu-radio ${theme === 'light' ? 'selected' : ''}"></span>
        ${t('light')}
      </span>
    </button>
    <button class="menu-item" data-action="set-theme" data-value="dark">
      <span class="menu-label">
        <span class="menu-radio ${theme === 'dark' ? 'selected' : ''}"></span>
        ${t('dark')}
      </span>
    </button>
    <div class="menu-separator"></div>
    <div class="menu-group-title">${t('searchEngine')}</div>
    <button class="menu-item" data-action="set-engine" data-value="browser">
      <span class="menu-label">
        <span class="menu-radio ${engine === 'browser' ? 'selected' : ''}"></span>
        ${t('browserDefault')}
      </span>
    </button>
    <button class="menu-item" data-action="set-engine" data-value="google">
      <span class="menu-label">
        <span class="menu-radio ${engine === 'google' ? 'selected' : ''}"></span>
        ${t('google')}
      </span>
    </button>
    <button class="menu-item" data-action="set-engine" data-value="duckduckgo">
      <span class="menu-label">
        <span class="menu-radio ${engine === 'duckduckgo' ? 'selected' : ''}"></span>
        ${t('duckduckgo')}
      </span>
    </button>
    <div class="menu-separator"></div>
    <div class="menu-group-title">${t('language')}</div>
    <button class="menu-item" data-action="set-lang" data-value="en">
      <span class="menu-label">
        <span class="menu-radio ${lang === 'en' ? 'selected' : ''}"></span>
        ${t('english')}
      </span>
    </button>
    <button class="menu-item" data-action="set-lang" data-value="zh">
      <span class="menu-label">
        <span class="menu-radio ${lang === 'zh' ? 'selected' : ''}"></span>
        ${t('chinese')}
      </span>
    </button>
  `
}

function refreshMenu() {
  const menu = document.getElementById('context-menu')
  if (menu) menu.innerHTML = getMenuHTML()
}

let menuVisible = false

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getStored(STORAGE_KEYS.theme, ['auto', 'light', 'dark'], 'auto'))

  const app = document.getElementById('app')
  if (app) {
    app.innerHTML = `
      <div class="main">
        <div class="prompt"><span>$</span> search</div>
        <div class="time" id="time"></div>
        <form class="search-form" id="search-form">
          <div class="search-wrapper">
            <input type="text" class="search-input" id="search-input" placeholder="Type to search..." autofocus>
            <button type="submit" class="search-go" title="Go">Go</button>
          </div>
        </form>
      </div>
    `

    updateDots()
    updatePrompt()
    updateTime()
    updateUI()
    setInterval(updateTime, 1000)

    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.id = 'context-menu'
    menu.innerHTML = getMenuHTML()
    document.body.appendChild(menu)

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      const menuRect = menu.getBoundingClientRect()
      const menuW = menuRect.width || 200
      const menuH = menuRect.height || 300
      const x = Math.min(e.clientX, window.innerWidth - menuW - 8)
      const y = Math.min(e.clientY, window.innerHeight - menuH - 8)
      menu.style.left = `${Math.max(0, x)}px`
      menu.style.top = `${Math.max(0, y)}px`
      menu.classList.add('visible')
      menuVisible = true
    })

    document.addEventListener('click', () => {
      if (menuVisible) {
        menu.classList.remove('visible')
        menuVisible = false
      }
    })

    menu.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('[data-action]') as HTMLElement
      if (item) {
        const action = item.dataset.action!
        const value = item.dataset.value || ''
        switch (action) {
          case 'toggle-title':
            setStored(STORAGE_KEYS.showTitle, getStored(STORAGE_KEYS.showTitle, ['true', 'false'], 'true') === 'true' ? 'false' : 'true')
            updatePrompt()
            refreshMenu()
            break
          case 'toggle-time':
            setStored(STORAGE_KEYS.showTime, getStored(STORAGE_KEYS.showTime, ['true', 'false'], 'false') === 'true' ? 'false' : 'true')
            updateTime()
            refreshMenu()
            break
          case 'toggle-dots':
            setStored(STORAGE_KEYS.showDots, getStored(STORAGE_KEYS.showDots, ['true', 'false'], 'true') === 'true' ? 'false' : 'true')
            updateDots()
            refreshMenu()
            break
          case 'set-theme':
            applyTheme(value as Theme)
            refreshMenu()
            break
          case 'set-engine':
            setStored(STORAGE_KEYS.searchEngine, value)
            refreshMenu()
            break
          case 'set-lang':
            setStored(STORAGE_KEYS.lang, value)
            updateUI()
            refreshMenu()
            break
        }
      }
    })

    const form = document.getElementById('search-form') as HTMLFormElement
    const input = document.getElementById('search-input') as HTMLInputElement

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const query = input.value.trim()
      if (query) search(query)
    })
  }
})
