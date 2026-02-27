const DB_NAME = "GlassDashboardDB";
const DB_VERSION = 1;
const STORE_NAME = "wallpapers";

const DEFAULT_WIDGETS = {
  clock: true,
  date: true,
  search: true,
  shortcuts: true,
  todo: true,
  weather: false,
  focus: false,
};

const LAYOUT_VERSION = 10;
let layoutEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
  updateTime();
  loadTodos();
  loadShortcuts();
  loadWallpaper();
  loadWidgetPreferences();
  loadTheme();
  loadWallpaperSettings();
  initWidgetPositions();

  setInterval(updateTime, 1000);

  // To-Do
  document.getElementById("add-todo-btn").addEventListener("click", addTodo);
  document.getElementById("new-todo").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  // Settings modal
  document.getElementById("settings-trigger").addEventListener("click", () => {
    document.getElementById("settings-modal").classList.remove("hidden");
  });

  // Help modal
  document.getElementById("help-trigger").addEventListener("click", () => {
    document.getElementById("help-modal").classList.remove("hidden");
  });

  // Close modals
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.target.closest(".modal").classList.add("hidden");
    });
  });
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", () => {
      backdrop.closest(".modal").classList.add("hidden");
    });
  });

  // Esc key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal:not(.hidden)")
        .forEach((m) => m.classList.add("hidden"));
    }
  });

  // Wallpaper
  document
    .getElementById("wallpaper-upload")
    .addEventListener("change", handleWallpaperUpload);
  setupWallpaperSliders();

  // Search
  document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (query) {
        if (
          query.match(/^https?:\/\//) ||
          query.match(/^[a-z0-9-]+\.[a-z]{2,}/i)
        ) {
          window.location.href = query.startsWith("http")
            ? query
            : "https://" + query;
        } else {
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
      }
    }
  });

  // Shortcuts
  document
    .getElementById("add-shortcut-btn")
    .addEventListener("click", () => openShortcutModal());
  document
    .getElementById("save-shortcut-btn")
    .addEventListener("click", saveShortcut);

  // Widget toggles
  document.querySelectorAll(".widget-toggle").forEach((toggle) => {
    toggle.addEventListener("change", handleWidgetToggle);
  });

  // Focus timer
  document.getElementById("timer-start").addEventListener("click", startTimer);
  document.getElementById("timer-pause").addEventListener("click", pauseTimer);
  document.getElementById("timer-reset").addEventListener("click", resetTimer);

  // Theme toggle
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

  // Layout edit toggle
  document
    .getElementById("layout-toggle")
    .addEventListener("click", toggleLayoutEdit);

  // Reset layout
  document
    .getElementById("reset-layout")
    .addEventListener("click", resetLayout);

  // Global reset
  document.getElementById("reset-all").addEventListener("click", resetAll);

  // Weather click-to-enable
  document.getElementById("weather").addEventListener("click", (e) => {
    const content = document.getElementById("weather-content");
    if (content.querySelector(".weather-loading")) {
      loadWeather();
    }
  });

  // First-time visit check
  if (!localStorage.getItem("hasRunBefore")) {
    setTimeout(() => {
      document.getElementById("help-modal").classList.remove("hidden");
      localStorage.setItem("hasRunBefore", "true");
    }, 1000);
  }
});

/* ========== IndexedDB ========== */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveWallpaperToDB(file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(file, "currentWallpaper");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getWallpaperFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get("currentWallpaper");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clearWallpaperDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete("currentWallpaper");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ========== Time & Date ========== */
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("time").textContent = `${hours}:${minutes}`;

  // Calendar card
  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  document.getElementById("day-name").textContent = dayNames[now.getDay()];
  document.getElementById("date-number").textContent = now.getDate();
  document.getElementById("month-name").textContent =
    monthNames[now.getMonth()];

  // Clock date text
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("clock-date").textContent = now.toLocaleDateString(
    undefined,
    dateOptions,
  );
}

/* ========== To-Do List ========== */
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.innerHTML = `
            <div class="todo-check" onclick="toggleTodo(${index})"></div>
            <span class="todo-text" onclick="toggleTodo(${index})">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${index})">&times;</button>
        `;
    list.appendChild(li);
  });
}

function addTodo() {
  const input = document.getElementById("new-todo");
  const text = input.value.trim();
  if (!text) return;
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.push({ text, completed: false });
  localStorage.setItem("todos", JSON.stringify(todos));
  input.value = "";
  loadTodos();
}

window.toggleTodo = function (index) {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos[index].completed = !todos[index].completed;
  localStorage.setItem("todos", JSON.stringify(todos));
  loadTodos();
};

window.deleteTodo = function (index) {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
  loadTodos();
};

/* ========== Wallpaper ========== */
async function handleWallpaperUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await saveWallpaperToDB(file);
    loadWallpaper();
  } catch (err) {
    console.error("Wallpaper save error:", err);
  }
}

const DEFAULT_WALLPAPER_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2500";

async function loadWallpaper() {
  const container = document.getElementById("wallpaper");
  container.innerHTML = "";
  container.style.backgroundImage = "";
  container.classList.remove("loaded");
  try {
    const file = await getWallpaperFromDB();
    if (file) {
      const url = URL.createObjectURL(file);
      if (file.type && file.type.startsWith("video")) {
        const video = document.createElement("video");
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.addEventListener(
          "canplay",
          () => container.classList.add("loaded"),
          { once: true },
        );
        container.appendChild(video);
      } else {
        const img = new Image();
        img.onload = () => container.classList.add("loaded");
        img.src = url;
        container.style.backgroundImage = `url(${url})`;
      }
    } else {
      // No user wallpaper — use default
      const img = new Image();
      img.onload = () => container.classList.add("loaded");
      img.src = DEFAULT_WALLPAPER_URL;
      container.style.backgroundImage = `url(${DEFAULT_WALLPAPER_URL})`;
    }
  } catch (err) {
    console.error("Wallpaper load error:", err);
    // Fallback to default on error
    container.style.backgroundImage = `url(${DEFAULT_WALLPAPER_URL})`;
    container.classList.add("loaded");
  }
}

/* ========== Wallpaper Controls ========== */
function setupWallpaperSliders() {
  const zoomSlider = document.getElementById("wallpaper-zoom");
  const panXSlider = document.getElementById("wallpaper-pan-x");
  const panYSlider = document.getElementById("wallpaper-pan-y");
  zoomSlider.addEventListener("input", () => {
    document.getElementById("zoom-value").textContent = zoomSlider.value + "%";
    saveAndApplyWallpaper();
  });
  panXSlider.addEventListener("input", () => {
    document.getElementById("pan-x-value").textContent = panXSlider.value + "%";
    saveAndApplyWallpaper();
  });
  panYSlider.addEventListener("input", () => {
    document.getElementById("pan-y-value").textContent = panYSlider.value + "%";
    saveAndApplyWallpaper();
  });

  // Preset Gallery
  document.querySelectorAll(".preset-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const url = item.dataset.url;
      await applyPresetWallpaper(url);
      document
        .querySelectorAll(".preset-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

async function applyPresetWallpaper(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    await saveWallpaperToDB(blob);
    loadWallpaper();
  } catch (err) {
    console.error("Preset wallpaper error:", err);
  }
}

function saveAndApplyWallpaper() {
  const zoom = document.getElementById("wallpaper-zoom").value;
  const panX = document.getElementById("wallpaper-pan-x").value;
  const panY = document.getElementById("wallpaper-pan-y").value;
  localStorage.setItem("wallpaperZoom", zoom);
  localStorage.setItem("wallpaperPanX", panX);
  localStorage.setItem("wallpaperPanY", panY);
  applyWallpaperTransform(zoom, panX, panY);
}

function loadWallpaperSettings() {
  const zoom = localStorage.getItem("wallpaperZoom") || "100";
  const panX = localStorage.getItem("wallpaperPanX") || "50";
  const panY = localStorage.getItem("wallpaperPanY") || "50";

  document.getElementById("wallpaper-zoom").value = zoom;
  document.getElementById("wallpaper-pan-x").value = panX;
  document.getElementById("wallpaper-pan-y").value = panY;

  document.getElementById("zoom-value").textContent = zoom + "%";
  document.getElementById("pan-x-value").textContent = panX + "%";
  document.getElementById("pan-y-value").textContent = panY + "%";

  applyWallpaperTransform(zoom, panX, panY);
}

function applyWallpaperTransform(zoom, panX, panY) {
  const container = document.getElementById("wallpaper");
  const scale = parseFloat(zoom) / 100;
  const px = parseFloat(panX);
  const py = parseFloat(panY);

  // Use CSS transform on the container to handle both image and video
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = `${px}% ${py}%`;

  // Ensure image wallpaper fills the container
  container.style.backgroundSize = "cover";
  container.style.backgroundPosition = "center";

  // Ensure video wallpaper fills the container and remove redundant transform
  const video = container.querySelector("video");
  if (video) {
    video.style.transform = "none";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.objectPosition = "center";
  }
}

/* ========== Shortcuts ========== */
let editingIndex = -1;

function loadShortcuts() {
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [
    { name: "Google", url: "https://google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "GitHub", url: "https://github.com" },
  ];
  const grid = document.getElementById("shortcuts-grid");
  const addNewBtn = document.getElementById("add-shortcut-btn");
  grid.innerHTML = "";

  shortcuts.forEach((site, index) => {
    const div = document.createElement("div");
    div.className = "shortcut-item";
    let domain = site.url;
    try {
      domain = new URL(site.url).origin;
    } catch (e) {}
    const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
    div.innerHTML = `
            <div class="icon"><img src="${iconUrl}" alt="${site.name}" onerror="this.style.display='none'"></div>
            <span class="label">${site.name}</span>
            <div class="shortcut-actions">
                <button class="edit-btn" title="Edit">✎</button>
                <button class="del-btn" title="Delete">×</button>
            </div>
        `;
    div.addEventListener("click", (e) => {
      if (!e.target.closest(".shortcut-actions"))
        window.location.href = site.url;
    });
    div.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openShortcutModal(index, site);
    });
    div.querySelector(".del-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${site.name}"?`)) deleteShortcut(index);
    });
    grid.appendChild(div);
  });
  grid.appendChild(addNewBtn);
}

function openShortcutModal(index = -1, site = null) {
  editingIndex = index;
  const modal = document.getElementById("shortcut-modal");
  const nameInput = document.getElementById("shortcut-name");
  const urlInput = document.getElementById("shortcut-url");
  const title = modal.querySelector("h2");
  if (index >= 0 && site) {
    title.textContent = "Edit Shortcut";
    nameInput.value = site.name;
    urlInput.value = site.url;
  } else {
    title.textContent = "Add Shortcut";
    nameInput.value = "";
    urlInput.value = "";
  }
  modal.classList.remove("hidden");
  nameInput.focus();

  // UX Improvements: Enter/Arrow keys
  nameInput.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      urlInput.focus();
    }
  };
  urlInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveShortcut();
    }
  };
}

function saveShortcut() {
  const name = document.getElementById("shortcut-name").value.trim();
  let url = document.getElementById("shortcut-url").value.trim();
  if (!name || !url) return;
  if (!url.startsWith("http")) url = "https://" + url;
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
  if (editingIndex >= 0) {
    shortcuts[editingIndex] = { name, url };
  } else {
    shortcuts.push({ name, url });
  }
  localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
  document.getElementById("shortcut-modal").classList.add("hidden");
  loadShortcuts();
}

function deleteShortcut(index) {
  const shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
  shortcuts.splice(index, 1);
  localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
  loadShortcuts();
}

/* ========== Widget Toggles ========== */
function loadWidgetPreferences() {
  const prefs =
    JSON.parse(localStorage.getItem("widgetPreferences")) || DEFAULT_WIDGETS;
  document.querySelectorAll("[data-widget]").forEach((widget) => {
    const key = widget.dataset.widget;
    if (prefs[key] === false) widget.classList.add("widget-hidden");
    else widget.classList.remove("widget-hidden");
  });
  document.querySelectorAll(".widget-toggle").forEach((toggle) => {
    toggle.checked = prefs[toggle.dataset.target] !== false;
  });
  if (prefs.weather !== false) loadWeather();
}

function handleWidgetToggle(e) {
  const target = e.target.dataset.target;
  const enabled = e.target.checked;
  const prefs = JSON.parse(localStorage.getItem("widgetPreferences")) || {
    ...DEFAULT_WIDGETS,
  };
  prefs[target] = enabled;
  localStorage.setItem("widgetPreferences", JSON.stringify(prefs));
  const widget = document.querySelector(`[data-widget="${target}"]`);
  if (widget) {
    if (enabled) {
      widget.classList.remove("widget-hidden");
      if (target === "weather") loadWeather();
    } else widget.classList.add("widget-hidden");
  }
}

/* ========== Theme Toggle ========== */
function loadTheme() {
  const theme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcons(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcons(next);
}

function updateThemeIcons(theme) {
  const darkIcon = document.getElementById("theme-icon-dark");
  const lightIcon = document.getElementById("theme-icon-light");
  if (theme === "dark") {
    darkIcon.classList.remove("hidden");
    lightIcon.classList.add("hidden");
  } else {
    darkIcon.classList.add("hidden");
    lightIcon.classList.remove("hidden");
  }
}

/* ========== Layout Edit Mode ========== */
function toggleLayoutEdit() {
  layoutEditMode = !layoutEditMode;
  document.body.classList.toggle("layout-edit", layoutEditMode);
  const lockedIcon = document.getElementById("layout-icon-locked");
  const editIcon = document.getElementById("layout-icon-edit");
  const dragFeedback = document.getElementById("drag-feedback");

  if (layoutEditMode) {
    lockedIcon.classList.add("hidden");
    editIcon.classList.remove("hidden");
    if (dragFeedback) dragFeedback.classList.remove("hidden");
  } else {
    lockedIcon.classList.remove("hidden");
    editIcon.classList.add("hidden");
    if (dragFeedback) dragFeedback.classList.add("hidden");
  }
}

/* ========== Widget Positions ========== */
function getDefaultPositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 24;
  const gap = 16;

  // Two-column layout inspired by reference
  const rightColW = Math.min(280, Math.floor(vw * 0.22));
  const leftColW = Math.min(400, Math.floor(vw * 0.35));
  const rightColX = vw - pad - rightColW;

  // Search + greeting at top, spanning wide
  const searchW = Math.min(vw - pad * 2, 920);
  const searchY = 20;

  // Left column
  const todoY = searchY + 105;
  const shortcutsY = todoY + 280;

  // Right column
  const dateY = searchY + 105;
  const clockY = dateY + 210;

  // Weather bottom-center
  const weatherW = leftColW;
  const weatherX = (vw - weatherW) / 2;
  const weatherY = vh - pad - 120;

  // Focus below clock
  const focusY = clockY + 160;

  return {
    search: { x: (vw - searchW) / 2, y: searchY, w: searchW },
    todo: { x: pad, y: todoY, w: leftColW },
    shortcuts: { x: pad, y: shortcutsY, w: leftColW },
    date: { x: rightColX, y: dateY, w: rightColW },
    clock: { x: rightColX, y: clockY, w: rightColW },
    weather: { x: weatherX, y: weatherY, w: weatherW },
    focus: { x: rightColX, y: Math.min(focusY, vh - 230), w: rightColW },
  };
}

function initWidgetPositions() {
  const savedVersion = parseInt(localStorage.getItem("layoutVersion") || "0");
  let saved = JSON.parse(localStorage.getItem("widgetPositions"));

  if (savedVersion < LAYOUT_VERSION) {
    saved = null;
    localStorage.removeItem("widgetPositions");
    localStorage.setItem("layoutVersion", LAYOUT_VERSION.toString());
  }

  const defaults = getDefaultPositions();

  document.querySelectorAll("[data-widget]").forEach((widget) => {
    const key = widget.dataset.widget;
    const pos = saved && saved[key] ? saved[key] : defaults[key];
    if (pos) {
      widget.style.left = pos.x + "px";
      widget.style.top = pos.y + "px";
      if (pos.w) widget.style.width = pos.w + "px";
    }
    const handle = widget.querySelector(".drag-handle");
    if (handle) setupDrag(widget, handle);
  });
}

function setupDrag(widget, handle) {
  let startX, startY, startLeft, startTop;
  let isDragging = false;

  handle.addEventListener("pointerdown", (e) => {
    if (!layoutEditMode) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(widget.style.left) || 0;
    startTop = parseInt(widget.style.top) || 0;
    widget.classList.add("dragging");
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;
    const rect = widget.getBoundingClientRect();
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - rect.width));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - rect.height));
    widget.style.left = newLeft + "px";
    widget.style.top = newTop + "px";
  });

  handle.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    widget.classList.remove("dragging");
    handle.releasePointerCapture(e.pointerId);
    saveWidgetPositions();
  });
}

function saveWidgetPositions() {
  const positions = {};
  document.querySelectorAll("[data-widget]").forEach((widget) => {
    positions[widget.dataset.widget] = {
      x: parseInt(widget.style.left) || 0,
      y: parseInt(widget.style.top) || 0,
      w: parseInt(widget.style.width) || null,
    };
  });
  localStorage.setItem("widgetPositions", JSON.stringify(positions));
}

function resetLayout() {
  localStorage.removeItem("widgetPositions");
  localStorage.removeItem("widgetPreferences");
  localStorage.removeItem("layoutVersion");
  window.location.reload();
}

/* ========== Global Reset ========== */
async function resetAll() {
  if (
    !confirm(
      "Reset everything to default? This will clear wallpaper, shortcuts, to-dos, and all settings.",
    )
  )
    return;
  localStorage.removeItem("todos");
  localStorage.removeItem("shortcuts");
  localStorage.removeItem("widgetPreferences");
  localStorage.removeItem("theme");
  localStorage.removeItem("wallpaperZoom");
  localStorage.removeItem("wallpaperPanX");
  localStorage.removeItem("wallpaperPanY");
  localStorage.removeItem("widgetPositions");
  localStorage.removeItem("layoutVersion");
  localStorage.removeItem("greetingName");
  try {
    await clearWallpaperDB();
  } catch (e) {}
  window.location.reload();
}

/* ========== Weather ========== */
async function loadWeather() {
  const content = document.getElementById("weather-content");
  content.innerHTML = '<p class="weather-loading">Fetching weather...</p>';
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
      });
    });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
    );
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const { icon, condition } = getWeatherInfo(weatherCode);
    let city = "";
    try {
      city = data.timezone
        ? data.timezone.split("/").pop().replace(/_/g, " ")
        : "";
    } catch (e) {}
    content.innerHTML = `
            <div class="weather-info">
                <span class="weather-icon">${icon}</span>
                <span class="weather-temp">${temp}°C</span>
                <div class="weather-details">
                    <div class="weather-condition">${condition}</div>
                    <div class="weather-location">${city}</div>
                </div>
            </div>
        `;
  } catch (err) {
    content.innerHTML =
      '<p class="weather-loading">Tap 🌡️ to enable local weather.</p>';
  }
}

function getWeatherInfo(code) {
  const map = {
    0: { icon: "☀️", condition: "Clear Sky" },
    1: { icon: "🌤️", condition: "Mostly Clear" },
    2: { icon: "⛅", condition: "Partly Cloudy" },
    3: { icon: "☁️", condition: "Overcast" },
    45: { icon: "🌫️", condition: "Foggy" },
    48: { icon: "🌫️", condition: "Rime Fog" },
    51: { icon: "🌦️", condition: "Light Drizzle" },
    53: { icon: "🌦️", condition: "Drizzle" },
    55: { icon: "🌧️", condition: "Heavy Drizzle" },
    61: { icon: "🌧️", condition: "Light Rain" },
    63: { icon: "🌧️", condition: "Rain" },
    65: { icon: "🌧️", condition: "Heavy Rain" },
    71: { icon: "🌨️", condition: "Light Snow" },
    73: { icon: "❄️", condition: "Snow" },
    75: { icon: "❄️", condition: "Heavy Snow" },
    80: { icon: "🌦️", condition: "Rain Showers" },
    81: { icon: "🌧️", condition: "Heavy Showers" },
    82: { icon: "⛈️", condition: "Violent Showers" },
    95: { icon: "⛈️", condition: "Thunderstorm" },
    96: { icon: "⛈️", condition: "Thunderstorm + Hail" },
    99: { icon: "⛈️", condition: "Severe Thunderstorm" },
  };
  return map[code] || { icon: "🌡️", condition: "Unknown" };
}

/* ========== Focus Timer ========== */
let timerInterval = null;
let timerSeconds = 25 * 60;

function updateTimerDisplay() {
  document.getElementById("timer-minutes").textContent = String(
    Math.floor(timerSeconds / 60),
  ).padStart(2, "0");
  document.getElementById("timer-seconds").textContent = String(
    timerSeconds % 60,
  ).padStart(2, "0");
}

function startTimer() {
  if (timerInterval) return;
  document.getElementById("timer-start").disabled = true;
  document.getElementById("timer-pause").disabled = false;
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById("timer-start").disabled = false;
      document.getElementById("timer-pause").disabled = true;
      if (Notification.permission === "granted")
        new Notification("Focus Timer", {
          body: "Session complete! Take a break.",
        });
      else if (Notification.permission !== "denied")
        Notification.requestPermission();
      alert("Focus session complete!");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("timer-start").disabled = false;
  document.getElementById("timer-pause").disabled = true;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 25 * 60;
  updateTimerDisplay();
  document.getElementById("timer-start").disabled = false;
  document.getElementById("timer-pause").disabled = true;
}
