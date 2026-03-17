# FirstNest Finland

A calm Nordic-style property platform prototype for first-time home buyers in Finland — built for both newcomers and Finnish citizens navigating the path to homeownership.

This project demonstrates product thinking, inclusive UX design, and front-end implementation quality — suitable for a portfolio, CV, and technical recruiter review.

---

## Why This Project

Buying a first home in Finland is complex. For immigrants, it involves additional layers of language barriers, eligibility uncertainty, and unfamiliar bureaucracy. For young Finnish buyers, loan transparency and municipality nuances remain confusing.

FirstNest Finland frames those challenges into a focused property browsing and guidance platform — combining listing discovery, budget analysis, a step-by-step roadmap, and curated support resources.

---

## What It Does

The app is structured like a real property platform (inspired by Etuovi and Oikotie) with four primary areas:

| Tab | Purpose |
|---|---|
| **Browse Homes** | Filter and browse mock listings by city, type, price, size, and area aptness |
| **Budget & Loan** | Affordability calculator with Finnish market rate defaults |
| **Buying Process** | 12-step first-home roadmap from search to keys |
| **Support** | Resources for legal, financial, multilingual, and immigrant buyer needs |

**Sidebar filters** let users narrow by location, property type, price range, size, rooms, area aptness signals (schools, transport, services, nature, immigrant support), and buyer profile (All / Newcomer / Finnish / Family).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5 — semantic, ARIA-labelled |
| Styles | CSS3 — custom property design system, app-shell layout |
| Logic | Vanilla JavaScript ES6+ — no build tools or dependencies |
| Fonts | Prata (display serif) + Manrope (UI body) via Google Fonts |

No build tools required. Runs directly in-browser.

---

## Run Locally

```bash
git clone https://github.com/your-username/uusi_koti.git
cd uusi_koti
# Open index.html in your browser
# Or with VS Code Live Server for auto-reload
```

---

## Repository Structure

```
uusi_koti/
├── index.html          # App shell — topbar, sidebar, tabbed content panels
├── styles.css          # CSS design system and responsive layout
├── script.js           # Tab switching, listing data, filters, budget calculator
├── Docs/
│   └── requirements.md # Product vision, user segments, functional requirements
├── CONTRIBUTING.md     # Branch workflow and conventional commit standards
├── CHANGELOG.md        # Versioned change log
└── LICENSE             # MIT
```

---

## Recruiter Notes

This repository intentionally showcases:

- **Product thinking** — real user segments, clear problem framing, functional information architecture
- **UI architecture** — fixed app-shell layout, sidebar + tabbed content, responsive breakpoints
- **Feature implementation** — multi-criteria filtering, sort logic, budget calculator with financial guidance
- **Data-driven rendering** — listings injected from a typed JS data array, not hardcoded HTML
- **Accessibility** — ARIA roles, keyboard navigation, reduced-motion support
- **Engineering discipline** — conventional commits, branch workflow, documented requirements, MIT license

---

## Roadmap

- [ ] Finnish / English language switch with JSON translation dictionary
- [ ] Real listing data via public Finnish open-data API
- [ ] Saved searches and favourites (localStorage)
- [ ] Automated end-to-end tests with Playwright
- [ ] CI pipeline: lint + format check + smoke test

---

## License

Released under the MIT License. See [`LICENSE`](LICENSE) for details.
