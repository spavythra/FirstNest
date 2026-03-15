# FirstNest Finland Requirements

## 1. Product Vision

Create a first-home buying platform for Finland that reduces uncertainty, improves fairness, and supports both immigrants and Finnish citizens during their first purchase journey.

## 2. Problem Statement

First-time buyers struggle with:

- Mortgage and legal complexity
- Fragmented information across banks and municipalities
- Language and communication gaps
- Unclear budget boundaries and hidden costs

## 3. Target Users

- Immigrant/newcomer first-home buyers
- Finnish first-home buyers
- Young families planning long-term housing stability

## 4. Product Goals

- Provide clear, trusted guidance from planning to post-move
- Enable realistic budget planning with transparent assumptions
- Improve confidence in lender and neighborhood decision making
- Keep UX calm, premium, and inclusive

## 5. Functional Requirements

### 5.1 Core Interface

- Responsive landing page for desktop and mobile
- Primary navigation to pathways, calculator, timeline, and resources
- Visual hierarchy using calm Nordic design language

### 5.2 Pathway Filtering

- Filter feature cards by buyer category:
  - `all`
  - `immigrant`
  - `finn`
  - `family`
- Active filter must be visually and semantically indicated

### 5.3 Budget Calculator

- Inputs:
  - Monthly net income
  - Monthly debt payments
  - Savings/down payment amount
  - Interest rate
  - Loan term (years)
- Output:
  - Estimated comfortable property price
  - Estimated loan principal
  - Contextual guidance note based on affordability conditions

### 5.4 Roadmap Guidance

- 12-step end-to-end first-home process
- Sequence must support legal, financial, and post-move stability milestones

### 5.5 Support Layer

- Multilingual readiness concept
- Advisor network concept
- Community story confidence layer

## 6. Non-Functional Requirements

### 6.1 Accessibility

- Semantic HTML sections and labels
- Keyboard-accessible controls
- `aria-live` support for calculator result updates
- Reduced-motion support via `prefers-reduced-motion`

### 6.2 Performance

- Lightweight static assets
- No mandatory runtime dependencies/build pipeline for MVP
- Smooth interaction on mid-range mobile devices

### 6.3 Maintainability

- Clear file separation: structure (`index.html`), style (`styles.css`), behavior (`script.js`)
- Documented repo entry points and project scope in `README.md`

### 6.4 Inclusivity

- Neutral, respectful language across all content
- Explicitly designed for both immigrants and Finns

## 7. UX and Design Requirements

- Calm, premium Nordic visual direction
- High readability and low cognitive load
- Intentional spacing and restrained motion
- Distinctive typography and non-generic palette

## 8. Success Indicators (MVP)

- Users can estimate budget in under 60 seconds
- Users can identify relevant pathway in one click
- Users can understand full journey from first step to move-in
- Prototype is portfolio-ready with documentation quality suitable for recruiter review

## 9. Future Requirements (Post-MVP)

- Language switching with content localization
- Backend integration for profile persistence
- Policy/grant data synchronization by municipality
- Automated tests and CI quality gates
