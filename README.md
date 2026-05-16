# FirstNest

A Nordic-style property platform for first-time home buyers in Finland, built for both newcomers and Finnish citizens navigating the path to homeownership.

Live demo: https://uusikoti.vercel.app/

---

## Why This Project

Buying a first home in Finland is complex. For immigrants, it involves language barriers, eligibility uncertainty, and unfamiliar processes. For young Finnish buyers, loan terms and municipality differences are often unclear.

FirstNest brings that into one focused platform: listing discovery, budget analysis, a step-by-step buying roadmap, and curated support resources.

---

## What It Does

The app is structured around four tabs, similar to platforms like Etuovi and Oikotie:

| Tab | Purpose |
|---|---|
| **Browse Homes** | Filter listings by city, type, price, size, and area signals |
| **Budget & Loan** | Affordability calculator with Finnish market rate defaults |
| **Buying Process** | 12-step roadmap from search to keys |
| **Support** | Resources for legal, financial, multilingual, and immigrant buyer needs |

Sidebar filters let users narrow by location, property type, price range, rooms, area aptness (schools, transport, nature, immigrant support), and buyer profile.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5, semantic and ARIA-labelled |
| Styles | CSS3, custom property design system, app-shell layout |
| Logic | Vanilla JavaScript ES6+, no build tools or dependencies |
| Fonts | Prata (display serif) + Manrope (UI body) via Google Fonts |

No build tools required. Runs directly in-browser.

---

## AI Chat Integration

Includes an AI chat assistant powered by OpenAI, available under the **AI Chat** tab.

To enable in Vercel, set the environment variable:

```
OPENAI_API_KEY=your_key
```

The request is proxied through `api/chat.js` so the API key is never exposed in the browser.

---

## Run Locally

```bash
git clone https://github.com/spavythra/FirstNest.git
cd FirstNest
# Open index.html in your browser
# Or use VS Code Live Server for auto-reload
```

---

## Repository Structure

```
FirstNest/
├── index.html          # App shell: topbar, sidebar, tabbed content
├── styles.css          # CSS design system and responsive layout
├── script.js           # Tab switching, listings, filters, budget calculator
├── api/
│   └── chat.js         # Serverless function for OpenAI chat proxy
├── Docs/
│   └── requirements.md # Product vision, user segments, functional requirements
├── CONTRIBUTING.md     # Branch workflow and commit standards
├── CHANGELOG.md        # Versioned change log
└── LICENSE             # MIT
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
