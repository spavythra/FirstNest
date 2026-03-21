/* ── Formatting ─────────────────────────────────────────── */
const currency = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/* ── Auth + favourites state ─────────────────────────────── */
let currentUser = null;
const userFavourites = new Set(); // listing id strings

/* ── Live listings (starts as mock, replaced by DB data) ──── */
let LIVE_LISTINGS = [...LISTINGS];

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

function getResidentMetrics(listing) {
  const baseWellness = listing.areaScore * 0.78;
  const bonus =
    (listing.tags.includes("Nature") ? 8 : 0) +
    (listing.tags.includes("Services") ? 5 : 0) +
    (listing.tags.includes("Public Transport") ? 5 : 0) +
    (listing.tags.includes("Safety") ? 6 : 0);

  const wellness = Math.min(99, Math.max(42, Math.round(baseWellness + bonus)));
  const crimeIndex = Math.max(1.1, (10 - wellness / 11.5 + (listing.id % 3) * 0.4));
  const reports = 28 + listing.id * 7;

  return {
    wellness,
    crimeIndex: crimeIndex.toFixed(1),
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
    renderPoiMarkers();
    mapInsights.innerHTML = `
      <p class="map-kicker">Resident-reported area pulse</p>
      <h3>No area selected</h3>
      <p class="map-copy">Adjust filters to bring back areas and review local resident reports.</p>
      ${getPoiFiltersMarkup()}`;
    bindPoiFilterHandlers(listings);
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
      html: `<span class="listing-logo-marker${isActive ? " is-active" : ""}">${listing.district}</span>`,
      iconSize: [90, 22],
      iconAnchor: [18, 11],
    });

    const marker = L.marker(latlng, { icon })
      .bindTooltip(`${listing.title} - ${currency.format(listing.price)}`, { direction: "top" })
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

  const metrics = getResidentMetrics(selected);
  mapInsights.innerHTML = `
    <p class="map-kicker">Resident-reported area pulse</p>
    <h3>${selected.district}, ${selected.city}</h3>
    <p class="map-copy">Updated from local resident submissions over the last 90 days.</p>
    <div class="resident-metrics">
      <div class="metric-tile">
        <span class="metric-label">Wellness score</span>
        <span class="metric-value">${metrics.wellness}/100</span>
        <span class="metric-note">Resident quality-of-life rating</span>
      </div>
      <div class="metric-tile">
        <span class="metric-label">Crime trend</span>
        <span class="metric-value">${metrics.crimeIndex}/10</span>
        <span class="metric-note">Lower is better</span>
      </div>
    </div>
    <p class="map-copy">${metrics.reports} resident reports used in this summary.</p>
    ${getPoiFiltersMarkup()}`;

  renderPoiMarkers();
  bindPoiFilterHandlers(listings);
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
  const metrics = getResidentMetrics(listing);

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
            <strong>${metrics.crimeIndex}/10</strong>
            <span>Crime trend</span>
          </div>
        </div>
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
  });
});

/* ── Apply Filters button ────────────────────────────────── */
const applyBtn = document.querySelector(".btn-apply-filters");
if (applyBtn) {
  applyBtn.addEventListener("click", applyFilters);
}

/* ── Budget calculator ───────────────────────────────────── */
const budgetForm = document.getElementById("budgetForm");
const homePriceEl = document.getElementById("homePrice");
const loanAmountEl = document.getElementById("loanAmount");
const resultNote = document.getElementById("resultNote");

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

/* ── Init ─────────────────────────────────────────────────── */
activateTab("listings");
setBrowseView(activeBrowseView);
initData();
updateResults();

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
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      LIVE_LISTINGS = data.map(dbRowToListing);
      filteredListings = [...LIVE_LISTINGS];
      renderListings(sortListings(filteredListings, activeSort));
      return;
    }
  }
  // no DB connection — use local mock data
  LIVE_LISTINGS = LISTINGS;
  filteredListings = [...LIVE_LISTINGS];
  renderListings(sortListings(filteredListings, activeSort));
}

/* ── Auth UI helpers ─────────────────────────────────────── */
function updateAuthUI(user) {
  const signInBtn  = document.getElementById("signInBtn");
  const userChip   = document.getElementById("userChip");
  const postAdBtn  = document.getElementById("postAdBtn");
  const avatarImg  = document.getElementById("userAvatarImg");
  const nameEl     = document.getElementById("userDisplayName");

  if (user) {
    signInBtn?.setAttribute("hidden", "");
    userChip?.removeAttribute("hidden");
    postAdBtn?.removeAttribute("hidden");
    if (avatarImg && user.user_metadata?.avatar_url) {
      avatarImg.src = user.user_metadata.avatar_url;
      avatarImg.removeAttribute("hidden");
    }
    if (nameEl) {
      nameEl.textContent = user.user_metadata?.full_name ||
                           user.email?.split("@")[0] || "User";
    }
  } else {
    signInBtn?.removeAttribute("hidden");
    userChip?.setAttribute("hidden", "");
    postAdBtn?.setAttribute("hidden", "");
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
  if (!supabase || !currentUser) return;
  const { data } = await supabase
    .from("favourites")
    .select("listing_id")
    .eq("user_id", currentUser.id);
  userFavourites.clear();
  (data || []).forEach((row) => userFavourites.add(String(row.listing_id)));
}

async function toggleFavourite(listingId, btnEl) {
  if (!currentUser) { openAuthModal(); return; }
  const isFav = userFavourites.has(listingId);

  if (isFav) {
    userFavourites.delete(listingId);
    if (supabase) {
      await supabase.from("favourites").delete()
        .eq("user_id", currentUser.id)
        .eq("listing_id", listingId);
    }
  } else {
    userFavourites.add(listingId);
    if (supabase) {
      await supabase.from("favourites").insert({
        user_id:    currentUser.id,
        listing_id: Number(listingId),
      });
    }
  }

  if (btnEl) {
    btnEl.classList.toggle("is-fav", !isFav);
    btnEl.setAttribute("aria-label", (!isFav ? "Remove from" : "Save to") + " favourites");
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
document.getElementById("signInBtn")       ?.addEventListener("click", openAuthModal);
document.getElementById("authModalClose")  ?.addEventListener("click", closeAuthModal);
document.getElementById("authModal")       ?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeAuthModal(); });
document.getElementById("signInGoogle")    ?.addEventListener("click", signInWithGoogle);
document.getElementById("signOutBtn")      ?.addEventListener("click", doSignOut);
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
