/* ── Formatting ─────────────────────────────────────────── */
const currency = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/* ── Auth + favourites state ─────────────────────────────── */
let currentUser = null;
const userFavourites = new Set(); // listing id strings
const LOCAL_FAV_KEY = "firstnest_local_favourites";

function loadLocalFavourites() {
  try {
    const raw = localStorage.getItem(LOCAL_FAV_KEY);
    const items = raw ? JSON.parse(raw) : [];
    userFavourites.clear();
    items.forEach((item) => userFavourites.add(String(item)));
  } catch {
    userFavourites.clear();
  }
}

function saveLocalFavourites() {
  try {
    localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify([...userFavourites]));
  } catch {}
}

/* ── Live listings (populated by initData on startup) ──── */
let LIVE_LISTINGS = [];

const CHAT_HISTORY_KEY = "firstnest_ai_chat";
let chatHistory = [];

function loadChatHistory() {
  try {
    chatHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || "[]");
  } catch {
    chatHistory = [];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
  } catch {}
}

function renderChatMessages() {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  if (!chatHistory.length) {
    chatMessages.innerHTML = '<div class="chat-placeholder">Ask your first question to the AI advisor.</div>';
    return;
  }

  chatMessages.innerHTML = chatHistory
    .map((message) => {
      const roleClass = message.role === "user" ? "user" : "assistant";
      const label = message.role === "user" ? "You" : "Advisor";
      return `<div class="chat-message ${roleClass}"><span>${label}</span><div>${message.content}</div></div>`;
    })
    .join("");

  const chatWindow = document.getElementById("chatWindow");
  if (chatWindow) {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

function appendChatMessage(role, content) {
  chatHistory.push({ role, content, time: new Date().toISOString() });
  saveChatHistory();
  renderChatMessages();
}

function clearChatConversation() {
  chatHistory = [];
  saveChatHistory();
  renderChatMessages();
}

async function sendChatRequest(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: chatHistory.slice(-10) }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Chat request failed");
  }
  return data.reply;
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  if (!input) return;

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendChatMessage("user", userMessage);
  input.value = "";
  input.disabled = true;

  try {
    const reply = await sendChatRequest(userMessage);
    appendChatMessage("assistant", reply);
  } catch (error) {
    appendChatMessage("assistant", "Sorry, the AI advisor is unavailable right now. Please try again later.");
    console.error("Chat error:", error);
  } finally {
    input.disabled = false;
    input.focus();
  }
}

/* ── Time helpers ────────────────────────────────────────── */
function timeAgo(isoString) {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days  = Math.floor(diffMs / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  <  7)  return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("fi-FI");
}

function withinDays(isoString, days) {
  if (!isoString) return true; // mock data has no timestamps — always show
  return Date.now() - new Date(isoString).getTime() <= days * 86400000;
}

/* ── Mock listing data ────────────────────────────────────── */
const LISTINGS = [
  {
    id: 1,
    title: "Modern 2BR in Kallio",
    city: "Helsinki",
    district: "Kallio",
    price: 249000,
    size: 58,
    rooms: 2,
    type: "apartment",
    badge: "New",
    tags: ["Public Transport", "Services"],
    areaScore: 88,
    profile: ["all", "immigrant", "finn"],
  },
  {
    id: 2,
    title: "Cosy Studio, Tampere Centre",
    city: "Tampere",
    district: "Keskusta",
    price: 119000,
    size: 31,
    rooms: 1,
    type: "studio",
    badge: null,
    tags: ["Schools", "Services"],
    areaScore: 74,
    profile: ["all", "immigrant"],
  },
  {
    id: 3,
    title: "Spacious Row House, Espoo",
    city: "Espoo",
    district: "Matinkylä",
    price: 385000,
    size: 112,
    rooms: 4,
    type: "rowhouse",
    badge: "Family",
    tags: ["Schools", "Nature", "Services"],
    areaScore: 91,
    profile: ["all", "family"],
  },
  {
    id: 4,
    title: "Bright 3BR, Turku Runosmäki",
    city: "Turku",
    district: "Runosmäki",
    price: 178000,
    size: 74,
    rooms: 3,
    type: "apartment",
    badge: null,
    tags: ["Public Transport", "Immigrant support"],
    areaScore: 68,
    profile: ["all", "immigrant", "family"],
  },
  {
    id: 5,
    title: "Lakeside Detached, Jyväskylä",
    city: "Jyväskylä",
    district: "Kuokkala",
    price: 265000,
    size: 140,
    rooms: 5,
    type: "house",
    badge: "Popular",
    tags: ["Nature", "Schools"],
    areaScore: 82,
    profile: ["all", "family", "finn"],
  },
  {
    id: 6,
    title: "City Studio, Oulu",
    city: "Oulu",
    district: "Raksila",
    price: 96000,
    size: 28,
    rooms: 1,
    type: "studio",
    badge: "Budget",
    tags: ["Services", "Public Transport"],
    areaScore: 70,
    profile: ["all", "immigrant"],
  },
  {
    id: 7,
    title: "Renovated 2BR, Vantaa",
    city: "Vantaa",
    district: "Tikkurila",
    price: 199000,
    size: 60,
    rooms: 2,
    type: "apartment",
    badge: null,
    tags: ["Schools", "Immigrant support", "Public Transport"],
    areaScore: 85,
    profile: ["all", "immigrant", "family"],
  },
  {
    id: 8,
    title: "Penthouse, Tampere Pispala",
    city: "Tampere",
    district: "Pispala",
    price: 319000,
    size: 88,
    rooms: 3,
    type: "apartment",
    badge: "Premium",
    tags: ["Nature", "Services"],
    areaScore: 78,
    profile: ["all", "finn"],
  },
  {
    id: 9,
    title: "Family Home, Tampere Hervanta",
    city: "Tampere",
    district: "Hervanta",
    price: 245000,
    size: 98,
    rooms: 4,
    type: "townhouse",
    badge: "Family",
    tags: ["Schools", "Public Transport", "Services"],
    areaScore: 84,
    profile: ["all", "family"],
  },
  {
    id: 10,
    title: "Modern 2BR, Tampere Kaleva",
    city: "Tampere",
    district: "Kaleva",
    price: 187000,
    size: 64,
    rooms: 2,
    type: "apartment",
    badge: null,
    tags: ["Services", "Public Transport", "Schools"],
    areaScore: 80,
    profile: ["all", "immigrant", "family"],
  },
  {
    id: 11,
    title: "Loft Studio, Tampere Ratina",
    city: "Tampere",
    district: "Ratina",
    price: 135000,
    size: 40,
    rooms: 1,
    type: "studio",
    badge: "City",
    tags: ["Public Transport", "Services"],
    areaScore: 76,
    profile: ["all", "immigrant"],
  },
  {
    id: 12,
    title: "Quiet 3BR, Tampere Tammela",
    city: "Tampere",
    district: "Tammela",
    price: 215000,
    size: 80,
    rooms: 3,
    type: "apartment",
    badge: null,
    tags: ["Nature", "Services", "Schools"],
    areaScore: 79,
    profile: ["all", "family", "finn"],
  },
  {
    id: 13,
    title: "Character Home, Tampere Amuri",
    city: "Tampere",
    district: "Amuri",
    price: 299000,
    size: 92,
    rooms: 3,
    type: "apartment",
    badge: "Charming",
    tags: ["Nature", "Services", "Public Transport"],
    areaScore: 83,
    profile: ["all", "finn"],
  },
  {
    id: 14,
    title: "River-view 2BR, Tampere Hatanpää",
    city: "Tampere",
    district: "Hatanpää",
    price: 229000,
    size: 70,
    rooms: 2,
    type: "apartment",
    badge: "Riverside",
    tags: ["Nature", "Services"],
    areaScore: 81,
    profile: ["all", "immigrant", "family"],
  },
  {
    id: 15,
    title: "Compact 1BR, Tampere Sorsapuisto",
    city: "Tampere",
    district: "Sorsapuisto",
    price: 124000,
    size: 45,
    rooms: 1,
    type: "apartment",
    badge: "Value",
    tags: ["Public Transport", "Services"],
    areaScore: 75,
    profile: ["all", "immigrant"],
  },
];

/* ── State ──────────────────────────────────────────────── */
let activeProfile = "all";
let activeSort = "price-asc";
let filteredListings = [...LISTINGS];
let selectedListingId = LISTINGS[0]?.id ?? null;
let activeBrowseView = "map";
const activePoiTypes = new Set(["hospital", "school", "prisma", "shop"]);

const LISTING_COORDS = {
  1: [60.1699, 24.9384],
  2: [61.4982, 23.7609],
  3: [60.1617, 24.7385],
  4: [60.4879, 22.2775],
  5: [62.2426, 25.7473],
  6: [65.0121, 25.4651],
  7: [60.2934, 25.0378],
  8: [61.5042, 23.7003],
};

const CITY_LATLNG = {
  helsinki: [60.1699, 24.9384],
  tampere: [61.4981, 23.7608],
  espoo: [60.2055, 24.6559],
  turku: [60.4518, 22.2666],
  jyvaskyla: [62.2426, 25.7473],
  oulu: [65.0121, 25.4651],
  vantaa: [60.2934, 25.0378],
};

const POI_POINTS = [
  { name: "TAYS", type: "hospital", icon: "+", latlng: [61.5033, 23.8118] },
  { name: "Hatanpaan sairaala", type: "hospital", icon: "+", latlng: [61.4826, 23.7685] },
  { name: "Tampereen Lyseon lukio", type: "school", icon: "S", latlng: [61.4994, 23.7689] },
  { name: "Hervannan koulu", type: "school", icon: "S", latlng: [61.4486, 23.8541] },
  { name: "Prisma Kaleva", type: "prisma", icon: "P", latlng: [61.5004, 23.7943] },
  { name: "Prisma Linnainmaa", type: "prisma", icon: "P", latlng: [61.5126, 23.8887] },
  { name: "Ratina", type: "shop", icon: "M", latlng: [61.4938, 23.7748] },
  { name: "Koskikeskus", type: "shop", icon: "M", latlng: [61.4976, 23.7719] },
];

let realMap;
let listingLayer;
const poiLayers = {};
let mapSearchBounds = null;

function isWithinMapBounds(listing) {
  if (!mapSearchBounds || !realMap) return true;
  const latlng = getListingLatLng(listing);
  return mapSearchBounds.contains(L.latLng(latlng));
}

function updateMapSearchButtonText(btn) {
  if (!btn) return;
  btn.textContent = mapSearchBounds ? "Clear map area filter" : "Search in current map area";
  btn.classList.toggle("is-active", Boolean(mapSearchBounds));
}

function toggleMapSearchArea(btn) {
  if (!realMap) {
    alert("Open the map view first to search by map area.");
    return;
  }
  if (mapSearchBounds) {
    mapSearchBounds = null;
  } else {
    mapSearchBounds = realMap.getBounds();
  }
  updateMapSearchButtonText(btn);
  applyFilters();
}

/* ── Tab switching ──────────────────────────────────────── */
const tabBtns = Array.from(document.querySelectorAll(".tab-btn"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

function activateTab(id) {
  tabBtns.forEach((btn) => {
    const active = btn.dataset.tab === id;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `tab-${id}`);
  });
  document.querySelector(".app-body")?.classList.toggle("home-view", id === "home");
  document.querySelector(".sidebar")?.classList.toggle("hidden", id !== "listings");
  if (id === "saved") {
    renderSavedWatchlist();
  }
  if (id === "chat") {
    loadChatHistory();
    renderChatMessages();
    document.getElementById("chatInput")?.focus();
  }
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});

const heroBrowseBtn = document.getElementById("heroBrowseBtn");
const heroBudgetBtn = document.getElementById("heroBudgetBtn");
heroBrowseBtn?.addEventListener("click", () => activateTab("listings"));
heroBudgetBtn?.addEventListener("click", () => activateTab("budget"));

function getListingLatLng(listing) {
  if (LISTING_COORDS[listing.id]) {
    return LISTING_COORDS[listing.id];
  }
  const key = listing.city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return CITY_LATLNG[key] || [61.4981, 23.7608];
}

function ensureMap() {
  if (realMap || typeof L === "undefined") {
    return;
  }

  realMap = L.map("mapSurface", {
    zoomControl: true,
    attributionControl: true,
  }).setView([61.4981, 23.7608], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(realMap);

  listingLayer = L.layerGroup().addTo(realMap);
  ["hospital", "school", "prisma", "shop"].forEach((type) => {
    poiLayers[type] = L.layerGroup().addTo(realMap);
  });
}

function getPricePerSqm(listing) {
  if (typeof listing.pricePerSqm === "number" && listing.pricePerSqm > 0) {
    return Math.round(listing.pricePerSqm);
  }
  return listing.size > 0 ? Math.round(listing.price / listing.size) : 0;
}

function getResidentMetrics(listing, buyerProfile = "all") {
  const baseWellness = listing.areaScore * 0.72;
  const bonus =
    (listing.tags.includes("Nature") ? 6 : 0) +
    (listing.tags.includes("Services") ? 5 : 0) +
    (listing.tags.includes("Public Transport") ? 5 : 0) +
    (listing.tags.includes("Safety") ? 6 : 0) +
    (buyerProfile === "immigrant" && listing.tags.includes("Immigrant support") ? 4 : 0) +
    (buyerProfile === "family" && listing.tags.includes("Schools") ? 3 : 0);

  const wellness = Math.min(100, Math.max(42, Math.round(baseWellness + bonus)));
  const pricePerSqm = getPricePerSqm(listing);
  const valueSignalScore = Math.round(
    Math.min(10, Math.max(1, (listing.areaScore * 0.12) + (95 / Math.max(pricePerSqm, 1)) * 1.5 + wellness / 18)) * 10
  ) / 10;

  const priceSignal =
    pricePerSqm > 6000 ? "Costly buy" : pricePerSqm < 3800 ? "Good buy" : "Fair buy";
  const profileFit = buyerProfile === "all"
    ? "Broad buyer fit"
    : listing.profile.includes(buyerProfile)
    ? `Good for ${buyerProfile}`
    : `Alternative for ${buyerProfile}`;
  const reports = 28 + listing.id * 7;

  return {
    wellness,
    pricePerSqm,
    goodBuyAverage: valueSignalScore.toFixed(1),
    priceSignal,
    profileFit,
    reports,
  };
}

function setBrowseView(view) {
  activeBrowseView = view;
  const listingsPanel = document.getElementById("tab-listings");
  const mapBtn = document.getElementById("viewMapBtn");
  const tilesBtn = document.getElementById("viewTilesBtn");

  if (!listingsPanel) return;

  listingsPanel.classList.toggle("is-map-view", view === "map");
  listingsPanel.classList.toggle("is-tiles-view", view === "tiles");

  mapBtn?.classList.toggle("is-active", view === "map");
  tilesBtn?.classList.toggle("is-active", view === "tiles");
}

function renderMapAds(listings, selectedId) {
  const mapAdsRow = document.getElementById("mapAdsRow");
  if (!mapAdsRow) return;

  if (listings.length === 0) {
    mapAdsRow.innerHTML = "";
    return;
  }

  const ranked = [...listings].sort((a, b) => {
    if (a.id === selectedId) return -1;
    if (b.id === selectedId) return 1;
    return a.price - b.price;
  });

  mapAdsRow.innerHTML = ranked.slice(0, 4).map((listing) => {
    const activeStyle = listing.id === selectedId ? ' style="border-color: var(--brand);"' : "";
    return `<article class="map-ad-card" data-id="${listing.id}"${activeStyle}>
      <h4>${listing.district}, ${listing.city}</h4>
      <p>${listing.rooms} rooms · ${listing.size} m&sup2;</p>
      <span class="map-ad-price">${currency.format(listing.price)}</span>
    </article>`;
  }).join("");

  mapAdsRow.querySelectorAll(".map-ad-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedListingId = Number(card.dataset.id);
      renderMapSnapshot(listings);
    });
  });
}

function getPoiFiltersMarkup() {
  const checked = (key) => (activePoiTypes.has(key) ? "checked" : "");
  return `
    <section class="poi-filters" aria-label="Map highlights">
      <p class="poi-title">Map highlights</p>
      <div class="poi-row">
        <label class="poi-toggle"><input type="checkbox" data-poi="hospital" ${checked("hospital")} /> Hospitals</label>
        <label class="poi-toggle"><input type="checkbox" data-poi="school" ${checked("school")} /> Schools</label>
        <label class="poi-toggle"><input type="checkbox" data-poi="prisma" ${checked("prisma")} /> Prisma</label>
        <label class="poi-toggle"><input type="checkbox" data-poi="shop" ${checked("shop")} /> Big shops</label>
      </div>
    </section>`;
}

function renderPoiMarkers() {
  ensureMap();
  if (!realMap || typeof L === "undefined") return;

  Object.keys(poiLayers).forEach((type) => {
    poiLayers[type]?.clearLayers();
  });

  POI_POINTS.forEach((poi) => {
    const icon = L.divIcon({
      className: "",
      html: `<span class="poi-logo-marker"><span class="poi-logo-icon ${poi.type}">${poi.icon}</span>${poi.name}</span>`,
      iconSize: [120, 20],
      iconAnchor: [20, 10],
    });

    const marker = L.marker(poi.latlng, { icon }).bindTooltip(poi.name, { direction: "top" });
    poiLayers[poi.type]?.addLayer(marker);
  });

  Object.keys(poiLayers).forEach((type) => {
    const layer = poiLayers[type];
    if (!layer) return;
    if (activePoiTypes.has(type)) {
      if (!realMap.hasLayer(layer)) realMap.addLayer(layer);
    } else if (realMap.hasLayer(layer)) {
      realMap.removeLayer(layer);
    }
  });
}

function bindPoiFilterHandlers(listings) {
  const toggles = Array.from(document.querySelectorAll(".poi-toggle input[data-poi]"));
  toggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const key = toggle.dataset.poi;
      if (!key) return;
      if (toggle.checked) {
        activePoiTypes.add(key);
      } else {
        activePoiTypes.delete(key);
      }
      renderPoiMarkers();
      renderMapAds(listings, selectedListingId);
    });
  });
}

function renderMapSnapshot(listings) {
  ensureMap();
  const mapCanvas = document.getElementById("mapCanvas");
  const mapInsights = document.getElementById("mapInsights");
  if (!mapCanvas || !mapInsights) return;
  if (!realMap || !listingLayer || typeof L === "undefined") {
    mapInsights.innerHTML = `
      <p class="map-kicker">Map unavailable</p>
      <h3>Could not load interactive map</h3>
      <p class="map-copy">Check internet connection or browser content blocking settings.</p>`;
    return;
  }

  listingLayer.clearLayers();

  if (listings.length === 0) {
    mapInsights.innerHTML = `
      <p class="map-kicker">No homes found</p>
      <p class="map-copy">Adjust search filters to see properties on the map.</p>`;
    renderMapAds([], null);
    return;
  }

  const selected = listings.find((l) => l.id === selectedListingId) || listings[0];
  selectedListingId = selected.id;

  const markerBounds = [];
  listings.forEach((listing) => {
    const latlng = getListingLatLng(listing);
    markerBounds.push(latlng);
    const isActive = listing.id === selected.id;
    const icon = L.divIcon({
      className: "",
      html: `<span class="listing-logo-marker${isActive ? " is-active" : ""}">🏠</span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const marker = L.marker(latlng, { icon })
      .bindTooltip(`${listing.title} — ${currency.format(listing.price)}`, { direction: "top", offset: [0, -12] })
      .on("click", () => {
        selectedListingId = listing.id;
        renderMapSnapshot(listings);
      });

    listingLayer.addLayer(marker);
  });

  if (markerBounds.length > 1) {
    realMap.fitBounds(markerBounds, { padding: [35, 35], maxZoom: 13 });
  } else if (markerBounds.length === 1) {
    realMap.setView(markerBounds[0], 13);
  }

  const metrics = getResidentMetrics(selected, activeProfile);
  mapInsights.innerHTML = `
    <p class="map-kicker">${selected.district}, ${selected.city}</p>
    <p class="map-copy">${metrics.reports} homes shown in the current area. Compare pricing/m², buyer profile fit, and renovation readiness before you decide whether this is a good buy or too costly.</p>`;

  renderMapAds(listings, selected.id);
}

/* ── Listing card rendering ─────────────────────────────── */
function buildCard(listing) {
  const badge = listing.badge
    ? `<span class="prop-badge">${listing.badge}</span>`
    : "";

  const tags = listing.tags
    .map((t) => `<span class="prop-tag">${t}</span>`)
    .join("");

  const scorePct = Math.min(100, Math.max(0, listing.areaScore));
  const scoreLabel =
    scorePct >= 85 ? "Excellent area" : scorePct >= 70 ? "Good area" : "Decent area";
  const metrics = getResidentMetrics(listing, activeProfile);

  const isFav = userFavourites.has(String(listing.id));
  const timeLabel = listing.created_at ? `<span class="prop-time">${timeAgo(listing.created_at)}</span>` : "";

  return `
    <article class="prop-card" data-id="${listing.id}" tabindex="0" role="article">
      <div class="prop-card-img" aria-label="Property photo placeholder">
        ${badge}
        ${timeLabel}
        <button class="fav-btn${isFav ? " is-fav" : ""}" data-fav-id="${listing.id}" aria-label="${isFav ? "Remove from" : "Save to"} favourites" title="Save">&#9825;</button>
        Photo
      </div>
      <div class="prop-card-body">
        <p class="prop-price">${currency.format(listing.price)}</p>
        <p class="prop-title">${listing.title}</p>
        <p class="prop-meta">${listing.district}, ${listing.city} &nbsp;&middot;&nbsp; ${listing.rooms} rooms &nbsp;&middot;&nbsp; ${listing.size} m&sup2;</p>
        <div class="prop-tags">${tags}</div>
        <div class="prop-score">
          <span>${scoreLabel}</span>
          <div class="score-bar" role="progressbar" aria-valuenow="${scorePct}" aria-valuemin="0" aria-valuemax="100">
            <div class="score-fill" style="width:${scorePct}%"></div>
          </div>
          <span>${scorePct}%</span>
        </div>
        <div class="prop-community">
          <div class="prop-community-item">
            <strong>${metrics.wellness}/100</strong>
            <span>Resident wellness</span>
          </div>
          <div class="prop-community-item">
            <strong>€ ${metrics.pricePerSqm}</strong>
            <span>Price / m²</span>
          </div>
          <div class="prop-community-item">
            <strong>${metrics.goodBuyAverage}/10</strong>
            <span>${metrics.priceSignal}</span>
          </div>
        </div>
        <p class="prop-profile-fit">${metrics.profileFit}</p>
      </div>
    </article>`;
}

function renderListings(listings) {
  const grid = document.getElementById("listingsGrid");
  const count = document.getElementById("resultsCount");

  if (!grid) return;

  if (listings.length === 0) {
    grid.innerHTML = `
      <div class="listings-empty">
        <strong>No properties found</strong>
        <p>Try adjusting your filters or clearing the area aptness checkboxes.</p>
      </div>`;
  } else {
    grid.innerHTML = listings.map(buildCard).join("");

    grid.querySelectorAll(".prop-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedListingId = Number(card.dataset.id);
        renderMapSnapshot(listings);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectedListingId = Number(card.dataset.id);
          renderMapSnapshot(listings);
        }
      });
    });

    grid.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavourite(String(btn.dataset.favId), btn);
      });
    });
  }

  if (count) count.textContent = listings.length;
  renderMapSnapshot(listings);
}

function renderSavedWatchlist() {
  const grid = document.getElementById("watchlistGrid");
  if (!grid) return;

  const savedListings = LIVE_LISTINGS.filter((listing) => userFavourites.has(String(listing.id)));
  if (savedListings.length === 0) {
    grid.innerHTML = `
      <div class="listings-empty">
        <strong>No saved homes yet</strong>
        <p>${supabase ? "Sign in and click the heart icon on any listing to save it to your watchlist." : "Use the heart icon to save favourites locally in your browser."}</p>
      </div>`;
    return;
  }

  grid.innerHTML = savedListings.map(buildCard).join("");
  grid.querySelectorAll(".prop-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedListingId = Number(card.dataset.id);
      renderMapSnapshot(LIVE_LISTINGS);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedListingId = Number(card.dataset.id);
        renderMapSnapshot(LIVE_LISTINGS);
      }
    });
  });

  grid.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavourite(String(btn.dataset.favId), btn);
    });
  });
}

/* ── Sorting ─────────────────────────────────────────────── */
function sortListings(list, method) {
  const copy = [...list];
  switch (method) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "size-desc":
      return copy.sort((a, b) => b.size - a.size);
    case "score-desc":
      return copy.sort((a, b) => b.areaScore - a.areaScore);
    default:
      return copy;
  }
}

/* ── Filter application ──────────────────────────────────── */
function applyFilters() {
  const cityVal = (document.getElementById("filterCity")?.value || "").trim().toLowerCase();
  const districtVal = (document.getElementById("filterDistrict")?.value || "").trim().toLowerCase();
  const typeVal = document.getElementById("filterType")?.value || "";
  const minSize = Number(document.getElementById("filterMinSize")?.value) || 0;
  const maxSize = Number(document.getElementById("filterMaxSize")?.value) || Infinity;
  const minPrice = Number(document.getElementById("filterMinPrice")?.value) || 0;
  const maxPrice = Number(document.getElementById("filterMaxPrice")?.value) || Infinity;
  const roomsVal = document.getElementById("filterRooms")?.value || "";
  const keywordVal = (document.getElementById("filterKeyword")?.value || "").trim().toLowerCase();
  const amenityChecks = Array.from(document.querySelectorAll(".amenity-checkbox:checked")).map((input) => input.dataset.amenity.toLowerCase());

  const aptChecks = [
    { id: "aptSchools", tag: "Schools" },
    { id: "aptTransport", tag: "Public Transport" },
    { id: "aptSafety", tag: "Safety" },
    { id: "aptServices", tag: "Services" },
    { id: "aptNature", tag: "Nature" },
    { id: "aptImmigrantSupport", tag: "Immigrant support" },
  ];
  const requiredTags = aptChecks
    .filter((a) => document.getElementById(a.id)?.checked)
    .map((a) => a.tag);

  filteredListings = LIVE_LISTINGS.filter((l) => {
    if (cityVal && !l.city.toLowerCase().includes(cityVal)) return false;
    if (districtVal && !l.district.toLowerCase().includes(districtVal)) return false;
    if (typeVal && l.type !== typeVal) return false;
    if (l.size < minSize || l.size > maxSize) return false;
    if (l.price < minPrice || l.price > maxPrice) return false;
    if (roomsVal === "4+" && l.rooms < 4) return false;
    if (roomsVal && roomsVal !== "4+" && l.rooms !== Number(roomsVal)) return false;
    if (activeProfile !== "all" && !l.profile.includes(activeProfile)) return false;
    if (requiredTags.length > 0 && !requiredTags.every((t) => l.tags.includes(t))) return false;
    if (keywordVal) {
      const haystack = [l.title, l.city, l.district, l.description || ""].join(" ").toLowerCase();
      if (!haystack.includes(keywordVal)) return false;
    }
    if (amenityChecks.length > 0) {
      const tagText = l.tags.map((t) => t.toLowerCase());
      if (!amenityChecks.every((amenity) => tagText.includes(amenity))) return false;
    }
    if (!isWithinMapBounds(l)) return false;
    const ageDays = Number(document.getElementById("filterAge")?.value) || 0;
    if (ageDays > 0 && !withinDays(l.created_at, ageDays)) return false;
    return true;
  });

  renderListings(sortListings(filteredListings, activeSort));
}

/* ── Buyer profile chips ─────────────────────────────────── */
const chips = Array.from(document.querySelectorAll(".chip"));
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-selected", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-selected", "true");
    activeProfile = chip.dataset.filter;
    applyFilters();
  });
  chip.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      chip.click();
    }
  });
});

/* ── Sort dropdown ───────────────────────────────────────── */
const sortSelect = document.getElementById("sortSelect");
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderListings(sortListings(filteredListings, activeSort));
  });
}

const modeBtns = Array.from(document.querySelectorAll(".mode-btn"));
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setBrowseView(btn.dataset.view);
    if (btn.dataset.view === "map" && realMap) {
      setTimeout(() => realMap.invalidateSize(), 50);
    }
  });
});

/* ── Apply Filters button ────────────────────────────────── */
const applyBtn = document.querySelector(".btn-apply-filters");
const mapSearchBtn = document.getElementById("btnMapSearch");
if (applyBtn) {
  applyBtn.addEventListener("click", applyFilters);
}
if (mapSearchBtn) {
  updateMapSearchButtonText(mapSearchBtn);
  mapSearchBtn.addEventListener("click", () => toggleMapSearchArea(mapSearchBtn));
}

/* ── Budget calculator ───────────────────────────────────── */
const budgetForm = document.getElementById("budgetForm");
const homePriceEl = document.getElementById("homePrice");
const loanAmountEl = document.getElementById("loanAmount");
const resultNote = document.getElementById("resultNote");
const visitorVisitsEl = document.getElementById("visitorVisits");
const visitorFirstSeenEl = document.getElementById("visitorFirstSeen");
const visitorIdEl = document.getElementById("visitorId");
const analyticsQueueInfo = document.getElementById("analyticsQueueInfo");

function calculateAffordablePrice(values) {
  const maxHousingShare = 0.35;
  const monthlyBudget = Math.max(values.income * maxHousingShare - values.debt, 0);
  const monthlyRate = values.rate / 100 / 12;
  const months = values.years * 12;

  if (monthlyRate <= 0 || months <= 0) {
    return { principal: 0, propertyPrice: values.savings, monthlyBudget };
  }

  const principal =
    monthlyBudget * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
  const propertyPrice = principal + values.savings;

  return { principal, propertyPrice, monthlyBudget };
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function setCookie(name, value, days = 3650) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function makeId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `vid-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function loadAnalyticsQueue() {
  try {
    return JSON.parse(localStorage.getItem("firstnest_analytics") || "[]");
  } catch {
    return [];
  }
}

function saveAnalyticsQueue(items) {
  localStorage.setItem("firstnest_analytics", JSON.stringify(items.slice(-100)));
}

function recordAnalyticsEvent(type, detail = {}) {
  const queue = loadAnalyticsQueue();
  queue.push({
    id: makeId(),
    type,
    detail,
    ts: new Date().toISOString(),
  });
  saveAnalyticsQueue(queue);
  return queue.length;
}

function trackVisitorData() {
  let visitorId = getCookie("firstnest_vid");
  if (!visitorId) {
    visitorId = makeId();
    setCookie("firstnest_vid", visitorId);
    setCookie("firstnest_first_visit", new Date().toISOString());
  }

  const firstVisit = getCookie("firstnest_first_visit") || new Date().toISOString();
  const visits = Number(getCookie("firstnest_visits") || "0") + 1;
  setCookie("firstnest_visits", String(visits));
  setCookie("firstnest_last_visit", new Date().toISOString());

  const eventCount = recordAnalyticsEvent("page_view", {
    visitorId,
    visits,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
  });

  return { visitorId, firstVisit, visits, eventCount };
}

function updateVisitorInfo() {
  const visitorData = trackVisitorData();
  if (visitorVisitsEl) {
    visitorVisitsEl.textContent = `Return visits: ${visitorData.visits}`;
  }
  if (visitorFirstSeenEl) {
    visitorFirstSeenEl.textContent = `First seen: ${new Date(visitorData.firstVisit).toLocaleDateString("fi-FI")}`;
  }
  if (visitorIdEl) {
    visitorIdEl.textContent = `Visitor ID: ${visitorData.visitorId}`;
  }
  if (analyticsQueueInfo) {
    analyticsQueueInfo.textContent = `Local analytics queue: ${visitorData.eventCount} events stored in browser cookies and local storage.`;
  }
}

function updateResults() {
  const values = {
    income: Number(document.getElementById("income")?.value),
    debt: Number(document.getElementById("debt")?.value),
    savings: Number(document.getElementById("savings")?.value),
    rate: Number(document.getElementById("rate")?.value),
    years: Number(document.getElementById("years")?.value),
  };

  const hasInvalid = Object.values(values).some((v) => Number.isNaN(v) || v < 0);
  if (hasInvalid) {
    if (resultNote) resultNote.textContent = "Please enter valid non-negative numbers in all fields.";
    return;
  }

  const result = calculateAffordablePrice(values);

  if (homePriceEl) homePriceEl.textContent = currency.format(result.propertyPrice);
  if (loanAmountEl)
    loanAmountEl.textContent = `Loan estimate: ${currency.format(result.principal)}`;

  if (resultNote) {
    if (result.monthlyBudget < 900) {
      resultNote.textContent =
        "Your monthly cushion is tight. Consider reducing debts or extending your savings period.";
    } else if (values.savings < result.propertyPrice * 0.1) {
      resultNote.textContent =
        "Down payment may be below 10%. Look for state guarantees and first-buyer support options.";
    } else {
      resultNote.textContent =
        "You are in a balanced zone. Compare at least two lenders and keep an emergency reserve for 3\u20136 months.";
    }
  }
}

if (budgetForm) {
  budgetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    updateResults();
  });
}

/* ── Data loading ───────────────────────────────────────── */
function dbRowToListing(row) {
  return {
    id:         row.id,
    title:      row.title,
    city:       row.city,
    district:   row.district,
    price:      row.price,
    size:       row.size,
    rooms:      row.rooms,
    type:       row.type,
    badge:      row.badge || null,
    tags:       row.tags || [],
    areaScore:  row.area_score,
    profile:    row.profile || ["all"],
    created_at: row.created_at,
    lat:        row.lat,
    lng:        row.lng,
  };
}

async function initData() {
  loadLocalFavourites();
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      LIVE_LISTINGS = data.map(dbRowToListing);
      applyFilters();
      return;
    }
  }
  LIVE_LISTINGS = LISTINGS;
  applyFilters();
}

/* ── Init ─────────────────────────────────────────────────── */
activateTab("home");
setBrowseView(activeBrowseView);
initData();
updateResults();
updateVisitorInfo();

/* ── Auth UI helpers ─────────────────────────────────────── */
function updateAuthUI(user) {
  const topbarSignInBtn   = document.getElementById("topbarSignInBtn");
  const topbarMenuBtn     = document.getElementById("topbarMenuBtn");
  const topbarUserChip    = document.getElementById("topbarUserChip");
  const topbarUserName    = document.getElementById("topbarUserName");
  const topbarMenuPanel   = document.getElementById("topbarMenuPanel");
  const menuSignOutBtn    = document.getElementById("menuSignOutBtn");
  const menuSignInBtn     = document.getElementById("menuSignInBtn");
  const menuProfileBtn    = document.getElementById("menuProfileBtn");
  const menuProfileName   = document.getElementById("menuProfileName");
  const postAdBtn         = document.getElementById("postAdBtn");

  if (user) {
    topbarSignInBtn?.classList.add("hidden");
    topbarMenuBtn?.classList.remove("hidden");
    menuSignInBtn?.classList.add("hidden");
    menuSignOutBtn?.classList.remove("hidden");
    menuProfileBtn?.classList.remove("hidden");
    if (topbarMenuPanel) {
      topbarMenuPanel.classList.add("hidden");
      topbarMenuBtn?.setAttribute("aria-expanded", "false");
    }
    if (topbarUserName && topbarUserChip) {
      topbarUserName.textContent = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";
      topbarUserChip.classList.remove("hidden");
    }
    if (menuProfileName) {
      menuProfileName.textContent = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";
    }
    postAdBtn?.removeAttribute("hidden");
  } else {
    topbarSignInBtn?.classList.remove("hidden");
    topbarMenuBtn?.classList.add("hidden");
    topbarMenuPanel?.classList.add("hidden");
    topbarMenuBtn?.setAttribute("aria-expanded", "false");
    menuSignInBtn?.classList.remove("hidden");
    menuSignOutBtn?.classList.add("hidden");
    menuProfileBtn?.classList.add("hidden");
    postAdBtn?.setAttribute("hidden", "");
    if (topbarUserChip) {
      topbarUserChip.classList.add("hidden");
    }
  }
}

/* ── Auth actions ────────────────────────────────────────── */
function openAuthModal() {
  document.getElementById("authModal")?.showModal();
}
function closeAuthModal() {
  document.getElementById("authModal")?.close();
  document.getElementById("authError")?.setAttribute("hidden", "");
}

async function signInWithGoogle() {
  if (!supabase) { alert("Backend not configured yet. See supabase.js."); return; }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) showAuthError(error.message);
}

async function signInWithEmail(email, password) {
  if (!supabase) { alert("Backend not configured yet. See supabase.js."); return; }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { showAuthError(error.message); return; }
  closeAuthModal();
}

async function signUpWithEmail(email, password) {
  if (!supabase) { alert("Backend not configured yet. See supabase.js."); return; }
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) { showAuthError(error.message); return; }
  showAuthError("Check your email to confirm your account.", "info");
}

async function doSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  currentUser = null;
  userFavourites.clear();
  updateAuthUI(null);
  renderListings(sortListings(filteredListings, activeSort));
}

function showAuthError(msg, type = "error") {
  const el = document.getElementById("authError");
  if (!el) return;
  el.textContent = msg;
  el.className = `modal-error${type === "info" ? " is-info" : ""}`;
  el.removeAttribute("hidden");
}

/* ── Favourites ──────────────────────────────────────────── */
async function loadFavourites() {
  loadLocalFavourites();
  if (!supabase || !currentUser) return;

  const { data, error } = await supabase
    .from("favourites")
    .select("listing_id")
    .eq("user_id", currentUser.id);

  if (!error && data) {
    userFavourites.clear();
    (data || []).forEach((row) => userFavourites.add(String(row.listing_id)));
    saveLocalFavourites();
  }
}

async function toggleFavourite(listingId, btnEl) {
  if (supabase && !currentUser) { openAuthModal(); return; }
  const isFav = userFavourites.has(listingId);

  if (isFav) {
    userFavourites.delete(listingId);
    if (supabase && currentUser) {
      await supabase.from("favourites").delete()
        .eq("user_id", currentUser.id)
        .eq("listing_id", listingId);
    }
  } else {
    userFavourites.add(listingId);
    if (supabase && currentUser) {
      await supabase.from("favourites").insert({
        user_id:    currentUser.id,
        listing_id: Number(listingId),
      });
    }
  }

  saveLocalFavourites();

  if (btnEl) {
    btnEl.classList.toggle("is-fav", !isFav);
    btnEl.setAttribute("aria-label", (!isFav ? "Remove from" : "Save to") + " favourites");
  }

  if (document.getElementById("tab-saved")?.classList.contains("is-active")) {
    renderSavedWatchlist();
  }
}

/* ── Post Ad ─────────────────────────────────────────────── */
function openPostAdModal() {
  document.getElementById("postAdModal")?.showModal();
  document.getElementById("postAdError")?.setAttribute("hidden", "");
}
function closePostAdModal() {
  document.getElementById("postAdModal")?.close();
  document.getElementById("postAdForm")?.reset();
}

async function submitPostAd(e) {
  e.preventDefault();
  if (!currentUser) { closePostAdModal(); openAuthModal(); return; }

  const title    = document.getElementById("adTitle")?.value.trim();
  const district = document.getElementById("adDistrict")?.value.trim();
  const type     = document.getElementById("adType")?.value;
  const rooms    = Number(document.getElementById("adRooms")?.value);
  const price    = Number(document.getElementById("adPrice")?.value);
  const size     = Number(document.getElementById("adSize")?.value);
  const desc     = document.getElementById("adDescription")?.value.trim();

  if (!title || !district || !price || !size || rooms < 1) {
    showPostAdError("Please fill in all required fields.");
    return;
  }

  const submitBtn = document.getElementById("postAdSubmit");
  if (submitBtn) submitBtn.disabled = true;

  const newListing = {
    user_id:     currentUser.id,
    title,
    city:        "Tampere",
    district,
    price,
    size,
    rooms,
    type,
    description: desc || null,
    badge:       null,
    tags:        [],
    area_score:  70,
    profile:     ["all"],
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .insert(newListing)
      .select()
      .single();

    if (submitBtn) submitBtn.disabled = false;
    if (error) { showPostAdError(error.message); return; }
    LIVE_LISTINGS = [dbRowToListing(data), ...LIVE_LISTINGS];
  } else {
    const fakeRow = {
      ...newListing,
      id:         Date.now(),
      created_at: new Date().toISOString(),
      area_score: 70,
      areaScore:  70,
    };
    LIVE_LISTINGS = [fakeRow, ...LIVE_LISTINGS];
    if (submitBtn) submitBtn.disabled = false;
  }

  filteredListings = [...LIVE_LISTINGS];
  renderListings(sortListings(filteredListings, activeSort));
  closePostAdModal();
}

function showPostAdError(msg) {
  const el = document.getElementById("postAdError");
  if (!el) return;
  el.textContent = msg;
  el.removeAttribute("hidden");
}

/* ── Wire up modals & buttons ────────────────────────────── */
const topbarSignInBtn   = document.getElementById("topbarSignInBtn");
const topbarMenuBtn     = document.getElementById("topbarMenuBtn");
const topbarMenuPanel   = document.getElementById("topbarMenuPanel");
const menuSavedBtn      = document.getElementById("menuSavedBtn");
const menuChatBtn       = document.getElementById("menuChatBtn");
const menuSignOutBtn    = document.getElementById("menuSignOutBtn");
const menuSignInBtn     = document.getElementById("menuSignInBtn");
const menuLangSelect    = document.getElementById("menuLangSelect");

topbarMenuBtn?.addEventListener("click", () => {
  const expanded = topbarMenuBtn.getAttribute("aria-expanded") === "true";
  topbarMenuBtn.setAttribute("aria-expanded", String(!expanded));
  topbarMenuPanel?.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!topbarMenuBtn || !topbarMenuPanel || topbarMenuPanel.classList.contains("hidden")) return;
  if (target === topbarMenuBtn || topbarMenuBtn.contains(target) || topbarMenuPanel.contains(target)) return;
  topbarMenuPanel.classList.add("hidden");
  topbarMenuBtn.setAttribute("aria-expanded", "false");
});

menuSavedBtn?.addEventListener("click", () => { activateTab("saved"); topbarMenuPanel?.classList.add("hidden"); topbarMenuBtn?.setAttribute("aria-expanded", "false"); });
menuChatBtn?.addEventListener("click", () => { activateTab("chat"); topbarMenuPanel?.classList.add("hidden"); topbarMenuBtn?.setAttribute("aria-expanded", "false"); });
menuSignOutBtn?.addEventListener("click", () => { doSignOut(); topbarMenuPanel?.classList.add("hidden"); topbarMenuBtn?.setAttribute("aria-expanded", "false"); });
menuSignInBtn?.addEventListener("click", () => { openAuthModal(); topbarMenuPanel?.classList.add("hidden"); topbarMenuBtn?.setAttribute("aria-expanded", "false"); });
topbarSignInBtn?.addEventListener("click", openAuthModal);
document.getElementById("heroLoginBtn")?.addEventListener("click", openAuthModal);
menuLangSelect?.addEventListener("change", (event) => {
  const value = event.target.value;
  document.documentElement.lang = value;
});

document.getElementById("authModalClose")  ?.addEventListener("click", closeAuthModal);
document.getElementById("authModal")       ?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeAuthModal(); });
document.getElementById("signInGoogle")    ?.addEventListener("click", signInWithGoogle);
document.getElementById("postAdBtn")       ?.addEventListener("click", openPostAdModal);
document.getElementById("postAdModalClose")?.addEventListener("click", closePostAdModal);
document.getElementById("postAdCancel")    ?.addEventListener("click", closePostAdModal);
document.getElementById("postAdModal")     ?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closePostAdModal(); });
document.getElementById("postAdForm")      ?.addEventListener("submit", submitPostAd);

document.getElementById("showSignUp")?.addEventListener("click", () => {
  const emailInput = document.getElementById("authEmail");
  const passInput  = document.getElementById("authPassword");
  const email = emailInput?.value.trim();
  const pass  = passInput?.value;
  signUpWithEmail(email, pass);
});

document.getElementById("authEmailForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("authEmail")?.value.trim();
  const pass  = document.getElementById("authPassword")?.value;
  signInWithEmail(email, pass);
});

document.getElementById("chatForm")?.addEventListener("submit", handleChatSubmit);
document.getElementById("clearChatBtn")?.addEventListener("click", clearChatConversation);

/* ── Supabase auth state listener ────────────────────────── */
if (supabase) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    currentUser = session?.user ?? null;
    updateAuthUI(currentUser);
    if (currentUser) loadFavourites();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    updateAuthUI(currentUser);
    if (currentUser) {
      loadFavourites().then(() => {
        renderListings(sortListings(filteredListings, activeSort));
      });
    }
  });
}
