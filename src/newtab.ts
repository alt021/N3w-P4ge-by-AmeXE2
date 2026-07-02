import './newtab.css'

type Theme = 'auto' | 'light' | 'dark'
type SearchEngine = 'browser' | 'google' | 'duckduckgo'
type Lang = 'en' | 'zh'
type ClockFormat = '12' | '24'
type SearchStyle = 'square' | 'rounded' | 'line'

const STORAGE_KEYS = {
  theme: 'theme',
  showTitle: 'showTitle',
  showTime: 'showTime',
  showGo: 'showGo',
  searchEngine: 'searchEngine',
  showDots: 'showDots',
  lang: 'lang',
  clockFormat: 'clockFormat',
  searchStyle: 'searchStyle',
}

const SEARCH_URLS: Record<Exclude<SearchEngine, 'browser'>, string> = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
}

const I18N: Record<Lang, Record<string, string>> = {
  en: {
    searchTitle: 'Search title',
    timeDisplay: 'Time Display',
    showGo: 'Search button',
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
    clockFormat: 'Clock Format',
    clock12h: '12-hour',
    clock24h: '24-hour',
    placeholder: 'Type to search...',
    go: 'Go',
    searchStyle: 'Search Box Style',
    square: 'Square',
    rounded: 'Rounded',
    line: 'Line',
  },
  zh: {
    searchTitle: '显示标题',
    timeDisplay: '时间显示',
    showGo: '搜索按钮',
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
    clockFormat: '时钟格式',
    clock12h: '12小时制',
    clock24h: '24小时制',
    placeholder: '输入搜索内容...',
    go: '前往',
    searchStyle: '搜索框样式',
    square: '方形',
    rounded: '圆角矩形',
    line: '横线',
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
  const format = getStored(STORAGE_KEYS.clockFormat, ['12', '24'], '24')
  if (format === '12') {
    const h = now.getHours()
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    el.textContent = `${String(h12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`
  } else {
    el.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
}

function updateDots() {
  const showDots = getStored(STORAGE_KEYS.showDots, ['true', 'false'], 'true') === 'true'
  document.body.classList.toggle('show-dots', showDots)
}

function updateGo() {
  const goBtn = document.querySelector('.search-go') as HTMLElement
  const showGo = getStored(STORAGE_KEYS.showGo, ['true', 'false'], 'true') === 'true'
  if (goBtn) goBtn.classList.toggle('hidden', !showGo)
}

function updateSearchStyle() {
  const form = document.getElementById('search-form') as HTMLElement
  const style = getStored(STORAGE_KEYS.searchStyle, ['square', 'rounded', 'line'], 'square')
  if (!form) return
  form.classList.remove('style-square', 'style-rounded', 'style-line')
  form.classList.add(`style-${style}`)
}

function updateUI() {
  const input = document.getElementById('search-input') as HTMLInputElement
  const goBtn = document.querySelector('.search-go') as HTMLElement
  if (input) input.placeholder = t('placeholder')
  if (goBtn) goBtn.textContent = t('go')
}

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/
const IPV6_RE = /^\[[\da-fA-F:]+\]$/
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i
const PORT_RE = /:\d{1,5}$/

function isURL(query: string): boolean {
  if (/^https?:\/\//i.test(query)) return true
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(query)) return true
  const withoutPort = PORT_RE.test(query) ? query.replace(PORT_RE, '') : query
  if (IPV4_RE.test(withoutPort)) return true
  if (IPV6_RE.test(withoutPort)) return true
  if (DOMAIN_RE.test(withoutPort)) return true
  return false
}

function openURL(url: string) {
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(url)) {
    window.location.href = url
  } else {
    window.location.href = 'https://' + url
  }
}

function search(query: string) {
  if (isURL(query)) {
    openURL(query)
    return
  }
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
  const showGo = getStored(STORAGE_KEYS.showGo, ['true', 'false'], 'true') === 'true'
  const theme = getStored(STORAGE_KEYS.theme, ['auto', 'light', 'dark'], 'auto')
  const engine = getStored(STORAGE_KEYS.searchEngine, ['browser', 'google', 'duckduckgo'], 'browser')
  const lang = getStored(STORAGE_KEYS.lang, ['en', 'zh'], 'en')
  const clock = getStored(STORAGE_KEYS.clockFormat, ['12', '24'], '24')
  const searchStyle = getStored(STORAGE_KEYS.searchStyle, ['square', 'rounded', 'line'], 'square')

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
    <button class="menu-item" data-action="toggle-go">
      <span class="menu-label">
        <span class="menu-check ${showGo ? 'checked' : ''}">${showGo ? '&#10003;' : ''}</span>
        ${t('showGo')}
      </span>
    </button>
    <div class="menu-separator"></div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t('theme')}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
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
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t('searchEngine')}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
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
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t('clockFormat')}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-clock" data-value="12">
          <span class="menu-label">
            <span class="menu-radio ${clock === '12' ? 'selected' : ''}"></span>
            ${t('clock12h')}
          </span>
        </button>
        <button class="menu-item" data-action="set-clock" data-value="24">
          <span class="menu-label">
            <span class="menu-radio ${clock === '24' ? 'selected' : ''}"></span>
            ${t('clock24h')}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t('searchStyle')}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
        <button class="menu-item" data-action="set-style" data-value="square">
          <span class="menu-label">
            <span class="menu-radio ${searchStyle === 'square' ? 'selected' : ''}"></span>
            ${t('square')}
          </span>
        </button>
        <button class="menu-item" data-action="set-style" data-value="rounded">
          <span class="menu-label">
            <span class="menu-radio ${searchStyle === 'rounded' ? 'selected' : ''}"></span>
            ${t('rounded')}
          </span>
        </button>
        <button class="menu-item" data-action="set-style" data-value="line">
          <span class="menu-label">
            <span class="menu-radio ${searchStyle === 'line' ? 'selected' : ''}"></span>
            ${t('line')}
          </span>
        </button>
      </div>
    </div>
    <div class="menu-has-sub">
      <button class="menu-item menu-parent">
        <span class="menu-label">${t('language')}</span>
        <span class="menu-arrow">&#9656;</span>
      </button>
      <div class="menu-submenu">
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
      </div>
    </div>
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
          <div class="search-box">
            <input type="text" class="search-input" id="search-input" placeholder="Type to search..." autofocus>
            <button type="submit" class="search-go" title="Go">Go</button>
          </div>
        </form>
      </div>
    `

    updateDots()
    updateGo()
    updateSearchStyle()
    updatePrompt()
    updateTime()
    updateUI()
    setInterval(updateTime, 1000)

    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.id = 'context-menu'
    menu.innerHTML = getMenuHTML()
    document.body.appendChild(menu)

    menu.addEventListener('mouseover', (e) => {
      const sub = (e.target as HTMLElement).closest('.menu-has-sub') as HTMLElement
      if (!sub) return
      const submenu = sub.querySelector('.menu-submenu') as HTMLElement
      if (!submenu) return
      submenu.style.left = ''
      const rect = submenu.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        submenu.style.left = 'auto'
        submenu.style.right = '100%'
      }
    })

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
          case 'toggle-go':
            setStored(STORAGE_KEYS.showGo, getStored(STORAGE_KEYS.showGo, ['true', 'false'], 'true') === 'true' ? 'false' : 'true')
            updateGo()
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
          case 'set-clock':
            setStored(STORAGE_KEYS.clockFormat, value)
            updateTime()
            refreshMenu()
            break
          case 'set-style':
            setStored(STORAGE_KEYS.searchStyle, value)
            updateSearchStyle()
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
