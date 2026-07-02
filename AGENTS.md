# AGENTS.md — Chrome MV3 New Tab Extension

## Project Overview

Chrome Manifest V3 extension that replaces the default new tab page.

## Tech Stack

- **Runtime**: Chrome Extension (MV3)
- **Build**: Vite
- **Language**: TypeScript
- **Manifest**: `chrome_url_overrides.newtab`

## Key Files

- `manifest.json` — Chrome MV3 manifest (requires `search` permission for omnibox search)
- `newtab.html` — Entry HTML loaded as new tab
- `src/newtab.ts` — Main script (search + theme toggle logic)
- `src/newtab.css` — Styles with CSS custom properties for theming
- `vite.config.ts` — Build config (copies manifest + icons to dist)

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Build to dist/
npm run typecheck    # Type-check without emitting
npm run lint         # Lint src/
```

## Loading Extension in Chrome

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/` folder

## Important Notes

- Vite builds to `dist/`, which is what you load in Chrome
- `manifest.json` is copied to `dist/` during build (not processed by Vite)
- Icons must be placed in `icons/` directory as PNG files (16, 48, 128px)
- For MV3, service workers replace background scripts
- Content Security Policy is enforced; no remote code execution
- `chrome_url_overrides.newtab` must point to an HTML file in the extension root
- Theme preference stored in `localStorage` (key: `theme`, values: `auto`/`light`/`dark`)
- `chrome.search.query()` requires the `search` permission in manifest

## Common Pitfalls

- forgetting to rebuild after manifest changes
- missing icon files causes extension load errors
- MV3 does not support `background.scripts` — use `service_worker` instead
- Use `chrome.*` APIs, not `browser.*` (unless using polyfill)
