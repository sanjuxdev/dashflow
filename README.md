<div align="center">

# ✦ DashFlow
### Custom Widget Dashboard — A Chrome Extension

**A premium glassmorphism new tab experience that puts you in control.**  
Add, arrange, and personalize widgets your way — with draggable layouts, custom wallpapers, live weather, and a built-in focus timer.

<br>

![Version](https://img.shields.io/badge/version-2.0-blue?style=flat-square)
![Manifest](https://img.shields.io/badge/Manifest-v3-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/built%20with-Vanilla%20JS-yellow?style=flat-square)
![No frameworks](https://img.shields.io/badge/no%20frameworks-%E2%9C%93-purple?style=flat-square)

<br>

> Every new tab is a fresh start. DashFlow makes it beautiful, intentional, and yours.

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Install (Sideloading from GitHub)](#how-to-install-sideloading-from-github)
- [How It Works — After Installation](#how-it-works--after-installation)
- [Widget Reference](#widget-reference)
- [Settings & Customization](#settings--customization)
- [Data Storage Architecture](#data-storage-architecture)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Known Behavior & Caveats](#known-behavior--caveats)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Overview

**DashFlow** replaces Chrome's default new tab page with a fully customizable, glassmorphism-styled personal dashboard. It was built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies — making it lightweight, fast, and easy to hack on.

The core philosophy: **every element should be movable, hideable, and yours**. Whether you want a minimalist clock-and-search setup or a full productivity hub with weather, to-dos, shortcuts, and a Pomodoro timer — DashFlow supports it without ever needing an internet connection to load (except for weather data and wallpaper URLs).

---

## Features

### 🧩 Widgets (All Draggable & Toggleable)

| Widget | Description |
|---|---|
| **🕐 Clock** | Live 24h clock with a full date string below it |
| **📅 Date Card** | Stylized calendar tile showing day, date number, and month |
| **🔍 Search Bar** | Google search or direct URL navigation — smart detection |
| **📌 Quick Links** | Custom shortcut icons with name + URL, click to add/remove |
| **✅ To-Do List** | Persistent task list with checkbox completion and delete |
| **🌤️ Weather** | Live local weather via Open-Meteo API (no API key needed) |
| **⏱️ Focus Timer** | 25-minute Pomodoro countdown with browser notifications |

### 🎨 Visual & Layout

- **Glassmorphism UI** — frosted glass panels with blur, transparency, and subtle borders
- **Dark / Light theme toggle** — persists across sessions
- **Custom wallpaper** — upload an image file or paste a remote image URL
- **Wallpaper zoom** — scale up to 250% with fine-grained pan (X/Y) control
- **Draggable layout** — lock/unlock widget positions via the edit mode toggle
- **Responsive stacking** — on narrow viewports, widgets auto-stack; on wide screens, your custom layout is restored
- **Fade-in animations** — staggered entrance animations on each new tab load

### 🔧 Settings Panel

- Toggle individual widgets on/off
- Change background wallpaper (upload or URL)
- Adjust wallpaper zoom and pan position
- Reset widget positions to default
- Full reset (clears all data)

---

## Demo

🎥 **Want to see DashFlow in action?**  
A full demo video is available on my LinkedIn profile — check it out here:  
👉 [linkedin.com/in/sanjuxdev](https://linkedin.com/in/sanjuxdev)

---

## Tech Stack

| Technology | Usage |
|---|---|
| **HTML5** | Structure and semantic markup |
| **CSS3** | Glassmorphism effects, animations, responsive layout |
| **Vanilla JavaScript (ES2020+)** | All logic, DOM manipulation, event handling |
| **IndexedDB** | Storing wallpaper image files (binary blobs) |
| **localStorage** | Todos, shortcuts, widget prefs, theme, layout positions |
| **Chrome Extensions API (Manifest v3)** | `chrome_url_overrides`, `storage`, `notifications` permissions |
| **Open-Meteo API** | Free, no-key weather data using browser geolocation |
| **Google Fonts** | Plus Jakarta Sans + Sora typefaces |

No npm. No webpack. No React. No Tailwind. Just files.

---

## Project Structure

```
dashflow/
├── manifest.json        # Chrome Extension manifest (v3)
├── newtab.html          # Main dashboard UI — replaces Chrome's new tab
├── script.js            # All JavaScript logic (~727 lines, zero dependencies)
├── styles.css           # All styling — glassmorphism, layout, animations, themes
├── CONTRIBUTING         # Guidelines for contributors
├── LICENSE              # MIT License
└── README.md            # This file
```

### File Roles in Detail

**`manifest.json`**
Declares the extension to Chrome. Key fields:
- `"newtab": "newtab.html"` — tells Chrome to replace the new tab with our page
- Permissions: `storage`, `unlimitedStorage` (for IndexedDB wallpapers), `notifications` (for focus timer alerts)
- Host permissions: allows fetching weather from Open-Meteo and loading wallpaper URLs

**`newtab.html`**
The full dashboard layout. Contains all seven widget DOM structures, the settings modal, the shortcut modal, the help modal, and the layout edit toggle. Everything is present in the HTML; JavaScript shows/hides and positions elements.

**`script.js`**
Organized into clearly separated sections:
- IndexedDB layer (open, save, get, clear wallpaper)
- Time & date update loop
- To-do CRUD (create, toggle, delete)
- Shortcuts CRUD (add, render, delete)
- Wallpaper management (upload handler, URL input, zoom/pan sliders)
- Widget preferences (load, save, toggle)
- Theme toggle (dark/light)
- Layout engine (default positions, drag setup, save, reset)
- Focus timer (start, pause, reset, notification trigger)
- Weather (geolocation → Open-Meteo → render)
- Global reset

**`styles.css`**
CSS custom properties drive all theming. Dark and light modes are controlled via `[data-theme="dark"]` and `[data-theme="light"]` on the `<html>` element. Widget positioning uses `position: absolute` within the container. Glassmorphism is achieved via `backdrop-filter: blur()`, semi-transparent backgrounds, and subtle box shadows.

---

## How to Install (Sideloading from GitHub)

Since DashFlow is not published on the Chrome Web Store, you'll manually load it as an **unpacked extension**. This is a one-time setup that takes about 30 seconds.

### Step-by-Step

**Step 1 — Download the repository**

Option A — Clone with Git:
```bash
git clone https://github.com/sanjuxdev/dashflow.git
```

Option B — Download as ZIP:
- Click the green **Code** button on this GitHub page
- Select **Download ZIP**
- Extract the ZIP to a folder on your computer (remember where you put it)

**Step 2 — Open Chrome Extensions**

In your Chrome address bar, navigate to:
```
chrome://extensions/
```

**Step 3 — Enable Developer Mode**

In the top-right corner of the Extensions page, toggle **Developer mode** to **ON**.
You'll see three new buttons appear: "Load unpacked", "Pack extension", and "Update".

**Step 4 — Load the Extension**

Click **"Load unpacked"** and select the folder where you extracted/cloned the repository.
Make sure you select the folder that directly contains `manifest.json` (not a parent folder).

**Step 5 — Done! ✅**

Open a new tab (`Ctrl+T` on Windows/Linux, `Cmd+T` on Mac).
Your DashFlow dashboard should appear immediately.

---

### Getting Updates

DashFlow doesn't auto-update since it's not on the Web Store. To get the latest version:

1. Pull the latest changes from GitHub:
   ```bash
   git pull origin main
   ```
   Or re-download and re-extract the ZIP.

2. Go to `chrome://extensions/`

3. Find DashFlow and click the **↻ Reload** button (circular arrow icon)

**Your data is safe.** All to-dos, shortcuts, wallpapers, and layout positions are stored in `localStorage` and `IndexedDB` — they survive extension reloads and Chrome restarts.

---

## How It Works — After Installation

Once the extension is loaded, Chrome reads your `manifest.json` and registers:

```json
"chrome_url_overrides": {
    "newtab": "newtab.html"
}
```

This tells Chrome: *"whenever the user opens a new tab, load `newtab.html` instead of the default new tab page."*

**What this means in practice:**

- Every `Ctrl+T` / `Cmd+T` opens your DashFlow dashboard
- Clicking the `+` button in the tab bar opens DashFlow
- The extension persists across Chrome restarts — once loaded, it stays active
- No background service worker is needed — your dashboard loads fresh every time a new tab is opened

**Data persistence:**
Your customizations are stored locally in your browser and survive:
- Chrome restarts ✅
- Extension reloads ✅
- System reboots ✅

They are **not** synced across devices or browsers (Chrome Sync is not used).

---

## Widget Reference

### 🕐 Clock Widget
Displays the current time in 24-hour format (`HH:MM`), updated every second. Below the time, a full readable date string is shown (e.g., "Thursday, February 26, 2026"). The date string uses the browser's locale for natural language formatting.

### 📅 Date Card
A stylized card showing three lines:
- Day of week in uppercase (e.g., `THURSDAY`)
- Date number in large type (e.g., `26`)
- Month abbreviation (e.g., `FEB`)

### 🔍 Search Bar
A full-width search input. On Enter:
- If the input matches a URL pattern (contains a `.` domain or starts with `http://`/`https://`), it navigates directly
- Otherwise, it opens a Google search for the query

### 📌 Quick Links
A grid of shortcut tiles. Each tile shows a favicon fetched from Google's favicon service and the shortcut's label. Clicking the `+` tile opens the "Add Shortcut" modal where you enter a name and URL. Right-clicking a tile removes it. Shortcuts are stored in localStorage.

### ✅ To-Do List
A task list with:
- Text input to add tasks (press Enter or click `+`)
- Checkbox to mark tasks as complete (visually struck-through)
- Delete button (×) on each task
- All tasks persist in localStorage

### 🌤️ Weather Widget
Hidden by default. Click the weather panel (which shows a 🌡️ prompt) to trigger the geolocation request. Once permission is granted:
- Fetches current temperature and weather code from [Open-Meteo](https://open-meteo.com/) — completely free, no API key required
- Displays: weather emoji icon, temperature in °C, condition label, and city/timezone name
- Data is fetched fresh each time you click; it does not auto-refresh

### ⏱️ Focus Timer
A 25-minute Pomodoro countdown timer with three controls:
- **Play** — starts the countdown
- **Pause** — pauses where it is
- **Reset** — resets to 25:00

When the timer reaches 00:00:
- A browser notification is triggered (if permission was granted)
- An `alert()` dialog confirms the session is complete

---

## Settings & Customization

Open the settings panel by clicking the **⚙️** icon (bottom-right corner).

### Wallpaper
- **Upload an image** — click the file input to select any image from your computer. Files are stored in IndexedDB (supports large files without localStorage size limits)
- **Paste a URL** — enter a direct image URL and click "Set URL" to use a remote wallpaper
- **Zoom** — slider from 100% to 250%; scales the background image
- **Horizontal pan** — shifts the wallpaper left/right after zooming
- **Vertical pan** — shifts the wallpaper up/down after zooming

> 💡 Tip: Zoom first, then use pan sliders to fine-tune the composition

### Widget Toggles
Individual on/off switches for every widget. Preferences are saved to localStorage and restored on every new tab.

### Layout
- **Reset Widget Positions** — restores all widgets to their default positions and clears layout preferences

### Theme
Toggle between **dark** and **light** mode using the moon/sun button in the top-right area of the settings panel (or the button accessible from the main dashboard).

### Reset All
The **Reset All** button (in red) clears everything:
- All to-dos
- All shortcuts
- All widget preferences and layout
- Theme preference
- Wallpaper (both URL and uploaded file from IndexedDB)

This is irreversible — a confirmation dialog is shown before proceeding.

---

## Data Storage Architecture

DashFlow uses two browser storage mechanisms, chosen based on data size:

### `localStorage` (Key-Value)

| Key | Type | Contents |
|---|---|---|
| `todos` | JSON array | `[{ text, completed }]` |
| `shortcuts` | JSON array | `[{ name, url }]` |
| `widgetPreferences` | JSON object | `{ clock: bool, date: bool, ... }` |
| `widgetPositions` | JSON object | `{ search: {x, y, w}, ... }` |
| `layoutVersion` | string | Version number to invalidate stale layouts |
| `theme` | string | `"dark"` or `"light"` |
| `wallpaperURL` | string | Remote wallpaper URL (if set) |
| `wallpaperZoom` | string | Zoom level `"100"` to `"250"` |
| `wallpaperPanX` | string | Horizontal pan `"0"` to `"100"` |
| `wallpaperPanY` | string | Vertical pan `"0"` to `"100"` |
| `hasRunBefore` | string | `"true"` after first visit (suppresses help modal) |

### `IndexedDB` (Binary Storage)

| Database | Store | Key | Value |
|---|---|---|---|
| `GlassDashboardDB` | `wallpapers` | `"currentWallpaper"` | `File` blob (uploaded image) |

IndexedDB is used for wallpaper uploads because `localStorage` has a ~5MB size limit per origin, while IndexedDB can store significantly larger files (tens of MB for high-res wallpapers).

### Why Not `chrome.storage`?
DashFlow intentionally uses web-standard storage APIs (`localStorage`, IndexedDB) rather than `chrome.storage`. This keeps the code portable, avoids Chrome API overhead, and means data behaves like any other website's local storage — predictable, inspectable via DevTools, and resettable via "Clear Site Data."

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+T` / `Cmd+T` | Open a new tab (loads DashFlow) |
| `Enter` (in search bar) | Execute search or navigate to URL |
| `Enter` (in to-do input) | Add the typed task |
| `Esc` | Close any open modal (settings, shortcuts, help) |

---

## Known Behavior & Caveats

### ⚠️ Developer Mode Warning
Chrome may show a yellow warning banner on startup: **"Disable developer mode extensions."** This is normal for any unpacked extension loaded via Developer Mode. Simply **dismiss it** — it has no effect on DashFlow's functionality.

### 📐 Responsive vs. Custom Layout
DashFlow has two layout modes:
- **Narrow viewports** (below a CSS breakpoint): widgets stack vertically in a standard flow — your drag positions are temporarily ignored
- **Wide viewports**: your custom drag positions are restored from localStorage

If you resize your window and re-widen it, the saved layout returns automatically.

### 🌤️ Weather Requires Geolocation
The weather widget is off by default. Enabling it requires your browser to request your location. Chrome will show a permission prompt. If you deny it, weather will not load (it shows a tap-to-enable prompt again). The extension does not store your coordinates anywhere.

### 🔒 Wallpaper Uploaded Files
Uploaded wallpaper files are stored in IndexedDB. If you use Chrome's "Clear browsing data" → "Cached images and files" or "Site data," your uploaded wallpaper will be erased. URL-based wallpapers are stored in localStorage and are more resilient to browser data clearing.

### 🔔 Focus Timer Notifications
Browser notifications require explicit permission. Chrome will prompt the first time the timer completes. If you deny it, the `alert()` dialog still fires as a fallback.

### 🔄 Layout Version
The code includes a `LAYOUT_VERSION` constant. When this number is bumped in a new release, any saved widget positions are automatically cleared and reset to the new defaults. This prevents broken layouts when widget geometry changes between versions.

---

## Roadmap

Potential future improvements — contributions welcome!

- [ ] Pomodoro sound effects (start chime, completion bell)
- [ ] Customizable timer duration (not just 25 minutes)
- [ ] Multiple timer modes (Pomodoro, Short Break, Long Break)
- [ ] Temperature unit toggle (°C / °F)
- [ ] Habit tracker widget
- [ ] Notes / scratchpad widget
- [ ] Bookmark import from Chrome
- [ ] Shortcut icon customization (choose emoji or upload icon)
- [ ] Gradient / solid color background options (no image required)
- [ ] Multiple wallpaper slots with a random/rotating option
- [ ] Keyboard navigation improvements (full a11y pass)
- [ ] Internationalization (i18n) support
- [ ] Export / import settings as JSON
- [ ] Tab group or session display widget

---

## Contributing

Contributions are welcome! This project is intentionally kept framework-free (vanilla HTML, CSS, JS), so no build tools or package managers are needed to contribute.

Please read [CONTRIBUTING](./CONTRIBUTING) for the full guidelines. The short version:

1. **Fork** the repository and clone it
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** — keep them focused (one feature/fix per PR)
4. **Test locally** by loading the unpacked extension in Chrome (`chrome://extensions/`)
5. **Commit** with a clear message using [Conventional Commits](https://www.conventionalcommits.org/) format:
   ```
   feat: add notification sounds to focus timer
   fix: prevent weather widget from overlapping on mobile
   docs: update installation steps
   style: improve toggle switch animation
   ```
6. **Push** your branch and **open a Pull Request** with a description and screenshots (for visual changes)

### What to Contribute
- 🎨 New themes, glassmorphism variations, animation polish
- 🧩 New widgets (see Roadmap above for ideas)
- 🌐 Translations / i18n support
- ♿ Accessibility improvements (keyboard nav, ARIA labels, screen reader support)
- 📱 Better responsive/small-screen layout
- 🐛 Bug fixes (check the Issues tab)

### Please Don't
- Add frameworks (React, Vue, Tailwind, etc.) — this project stays vanilla
- Make large sweeping changes without opening an issue first to discuss
- Submit unreviewed AI-generated PRs

---

## Author

**Sanjay**
Engineering student & indie developer

- 🔗 [LinkedIn](https://linkedin.com/in/sanjuxdev)
- 🐙 [GitHub](https://github.com/sanjuxdev)

> *I built this Chrome new-tab extension to create a calmer and more intentional start to every browsing session. Most existing dashboards felt either cluttered or too limited in customization. I wanted a balance — something visually clean, flexible, and genuinely useful for everyday focus.*
>
> *This project started as a personal tool and evolved into a fully customizable dashboard with movable widgets, live wallpapers, and fine-grained layout control.*

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

In short: you're free to use, modify, distribute, and build upon this project for personal or commercial purposes, as long as the original license notice is retained.

---

<div align="center">

**If DashFlow improved your browsing experience, consider giving it a ⭐ on GitHub.**
It helps others discover the project and motivates continued development.

<br>

*Built with ♥ using zero dependencies.*

</div>
