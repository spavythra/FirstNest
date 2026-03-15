# FirstNest Finland

A calm Nordic-style product prototype for first-time home buyers in Finland.

This project demonstrates product thinking, inclusive UX, and front-end implementation quality suitable for a portfolio, CV, and GitHub review by technical recruiters.

## Why This Project

First-home buying is complex for everyone, and especially difficult for first-time buyers navigating language barriers, loan transparency, and municipality-specific requirements. FirstNest Finland frames those challenges into a clear, guided experience for both immigrants and Finnish citizens.

## Current Scope

- Premium Nordic visual design with mobile-first responsiveness
- Buyer-pathway filtering (immigrant, finnish citizen, young family)
- Affordability/budget calculator with practical financial guidance
- 12-step first-home roadmap
- Support modules for multilingual onboarding and trusted advisor workflows

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)

No build tools required for the current static prototype.

## Run Locally

1. Clone the repository.
2. Open the project folder in VS Code.
3. Open `index.html` in your browser.

Optional: use the VS Code Live Server extension for auto-reload while editing.

## Repository Structure

- `index.html`: main page layout and content
- `styles.css`: design system and responsive styling
- `script.js`: calculator logic, filtering, and reveal animations
- `Docs/requirements.md`: product + technical requirements baseline
- `Docs/prompting-guide.md`: practical prompt patterns for stronger iterations
- `CONTRIBUTING.md`: contributor workflow and commit standards
- `CHANGELOG.md`: release-oriented change tracking
- `LICENSE`: MIT license for public reuse

## Recruiter Review Notes

This repository intentionally demonstrates:

- Product framing: clear problem definition and user segments
- Front-end fundamentals: semantic markup, clean styles, accessible forms
- Feature implementation: data-based interaction and UI state handling
- Documentation discipline: clear requirements and roadmap direction

## Near-Term Improvements

- Add Finnish and English language switch with JSON translation dictionary
- Add automated front-end tests (Playwright/Cypress for critical flows)
- Add CI checks (lint + format + smoke test)
- Connect calculator and pathway flow to a simple API/backend

## License

This project is released under the MIT License. See `LICENSE` for details.
