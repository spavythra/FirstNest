/* ── Formatting ─────────────────────────────────────────── */
const currency = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

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

  return `
    <article class="prop-card" data-id="${listing.id}" tabindex="0" role="article">
      <div class="prop-card-img" aria-label="Property photo placeholder">
        ${badge}
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
      </div>
    </article>`;
}

function renderListings(listings) {
  const grid = document.getElementById("listingsGrid");
  const count = document.getElementById("resultsCount");

  if (!grid) return;

  if (listings.length === 0) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:2rem">No listings match your filters.</p>';
  } else {
    grid.innerHTML = listings.map(buildCard).join("");
  }

  if (count) count.textContent = listings.length;
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

  filteredListings = LISTINGS.filter((l) => {
    if (cityVal && !l.city.toLowerCase().includes(cityVal)) return false;
    if (districtVal && !l.district.toLowerCase().includes(districtVal)) return false;
    if (typeVal && l.type !== typeVal) return false;
    if (l.size < minSize || l.size > maxSize) return false;
    if (l.price < minPrice || l.price > maxPrice) return false;
    if (activeProfile !== "all" && !l.profile.includes(activeProfile)) return false;
    if (requiredTags.length > 0 && !requiredTags.every((t) => l.tags.includes(t))) return false;
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
applyFilters();
updateResults();

