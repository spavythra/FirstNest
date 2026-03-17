# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

- Finnish / English language switch with JSON translation dictionary
- Real listing data sourced from a public Finnish open-data API
- Saved searches and favourites via localStorage
- Playwright end-to-end test suite for critical flows
- CI pipeline: ESLint + Prettier + smoke test on pull request

---

## [0.2.0] — 2026-03-17

### Changed

- **Full layout rebuild** — replaced blog/scroll layout with a fixed app-shell modelled on Finnish property platforms (Etuovi / Oikotie style)
- `index.html` restructured into: fixed 54 px topbar with tab navigation, 272 px left sidebar with filter groups, scrollable main content panel with four tab panels
- `styles.css` rewritten from scratch — CSS custom-property design system, app-shell positioning, property card grid, calc layout, timeline grid, responsive breakpoints at 860 px and 640 px
- `script.js` rewritten — tab switching, mock listings data array, `renderListings()` DOM injection, multi-criteria `applyFilters()`, sort logic, budget calculator preserved

### Added

- Left sidebar with six filter dimensions: city, district, property type, size range, price range, rooms, and six area-aptness checkboxes (schools, transport, safety, services, nature, immigrant support)
- Buyer profile chip selector (All / Newcomer / Finnish / Family) wired to listing filter
- Sort dropdown: price low→high, price high→low, largest first, best area score first
- Eight mock property listings covering Helsinki, Espoo, Tampere, Turku, Oulu, Jyväskylä, and Vantaa with area score bars
- `prefers-reduced-motion` CSS media query for accessibility

### Removed

- `Docs/prompting-guide.md` — removed from codebase; not project-relevant content

---

## [0.1.0] — 2026-03-16

### Added

- Initial static prototype for first-time home buyers in Finland
- Calm Nordic UI system: Prata + Manrope fonts, muted green palette (`--brand: #2f5650`)
- Budget / affordability calculator with Finnish market rate defaults
- Buyer-pathway filtering (immigrant, Finnish citizen, young family)
- 12-step first-home buying roadmap
- Support resource cards for legal, financial, and multilingual needs
- `Docs/requirements.md`: product vision, user segments, functional and non-functional requirements
- Repository scaffold: `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE` (MIT), `.gitignore`, `.editorconfig`, `.gitattributes`
- Conventional commit workflow and branch strategy (`master` = release, `dev` = active development)

