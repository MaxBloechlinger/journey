# Journey

> **A multi-destination trip planner.** Build your full itinerary across cities and countries, track your budget in real time, and ask an AI assistant if the plan actually makes sense.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://www.anthropic.com/)

---

## The Problem

Planning a multi-city trip — Thailand then Japan then South Korea — means juggling domestic flights, international legs, hotels with variable nightly rates, activities, and a total budget across all of it. No tool handles this as a single coherent workspace:

- **Google Flights** — one flight at a time, no budget rollup
- **Booking.com / Airbnb** — per-property, no trip-level view
- **Notion / spreadsheets** — no structure, no auto-calculation, no AI reasoning
- **TripIt / Wanderlog** — itinerary *organizers*, not *planners*

Journey is the structured planning canvas that is missing.

---

## What It Does

- **City segments** — add each destination with arrival/departure dates; nights auto-calculate
- **Flights & transit** — attach a flight (or train, bus, ferry) between consecutive cities
- **Accommodation** — set nightly rate; total cost multiplies automatically from nights
- **Activities** — list everything you want to do with individual costs
- **Live budget tracker** — running total vs. your budget limit, broken down by city and category
- **Route map** — interactive Leaflet map with your cities as markers and arcs tracing the route
- **AI sidebar** — ask Claude anything about your plan; it has the full trip data as context
- **Drag to reorder** — rearrange your city sequence; budget recalculates instantly

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + Vite 8 | Fast HMR, huge ecosystem, industry standard |
| Language | TypeScript | Strict data model, self-documenting interfaces |
| Styling | Tailwind CSS v4 | Utility-first, no fighting a component library |
| State | Zustand + `persist` | No boilerplate, localStorage sync built-in |
| Map | Leaflet + React-Leaflet | Free, no API key, OpenStreetMap tiles |
| Dates | date-fns | Lightweight, tree-shakeable ISO date math |
| Drag & Drop | @dnd-kit/core | Modern, accessible, well-maintained |
| AI | Anthropic Claude API | Claude Sonnet 4 — quality + speed |
| Icons | Lucide React | Clean, consistent SVG icon set |
| Deploy | Vercel | Zero-config for Vite, free tier |

**No UI component library.** Every component is hand-built with Tailwind for a distinctive design identity.

---

## Design

Dark brutalist editorial. One accent color. Numbers feel like data.

```
Background:  #0a0a0a base  /  #111111 surfaces  /  #1a1a1a cards
Text:        #f0f0f0 primary  /  #888888 secondary
Accent:      #e8ff47  (sharp yellow-green — used sparingly)
Danger:      #ff4444  (over-budget state)
Typography:  Space Mono (headers, numbers)  /  Inter (body)
```

---

## Architecture

No backend. All state lives in the React app and is persisted to localStorage. The only external call is to the Anthropic API.

```
Browser (React + Zustand)
├── Trip Planner Canvas
├── Leaflet Map
├── Budget Summary
└── AI Sidebar ──HTTPS POST──> Anthropic API /v1/messages

Persistence: localStorage via Zustand `persist` middleware
```

Post-MVP path to a backend: swap Zustand's persist adapter from localStorage to a Supabase client — one config change.

---

## Getting Started

```bash
# Clone
git clone https://github.com/MaxBloechlinger/journey.git
cd journey

# Install
npm install

# Set up environment
cp .env.example .env.local
# Add your Anthropic API key to .env.local

# Dev server
npm run dev

# Build
npm run build
```

**Required environment variable:**

```bash
# .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## Project Structure

```
src/
├── types/trip.ts           # All TypeScript interfaces (canonical data model)
├── store/
│   ├── tripStore.ts        # Zustand store — all trip state and actions
│   └── uiStore.ts          # UI state (sidebar, active segment, editing)
├── utils/
│   ├── budget.ts           # budgetSummary(), cityCost(), nights()
│   ├── dates.ts            # Formatting helpers
│   ├── ids.ts              # crypto.randomUUID() wrapper
│   └── claude.ts           # buildSystemPrompt(), sendMessage()
└── components/
    ├── layout/             # Header, BudgetSummaryBar
    ├── home/               # TripList, CreateTripModal
    ├── map/                # TripMap, RouteArc
    ├── itinerary/          # ItineraryPanel, CitySegmentCard, TransitCard
    ├── forms/              # Add/edit forms for each entity
    └── ai/                 # AISidebar, ChatThread, ChatInput
```

---

## Roadmap

Development follows a milestone-based approach. Each milestone has a single binary condition — done or not done.

### Sprint 1 — Foundation
| # | Milestone | Status |
|---|---|---|
| 1 | Project skeleton — Vite + React + TS + Tailwind runs with no errors | ✅ |
| 2 | Type definitions — all types in `src/types/trip.ts` compile | ✅ |
| 3 | Zustand store — create/read/delete a trip from devtools with persistence | ✅ |
| 4 | Home screen — create a trip, see it listed, navigate to workspace | ✅ |

### Sprint 2 — Core Planner
| # | Milestone | Status |
|---|---|---|
| 5 | Empty workspace — header, map placeholder, itinerary panel render | ✅ |
| 6 | Add city segment with dates; appears in itinerary panel | ✅ |
| 7 | Add transit between cities; appears between segment cards | ✅ |
| 8 | Add accommodation; nightly cost × nights calculates correctly | ✅ |
| 9 | Add activities; costs per city add up correctly | ✅ |

### Sprint 3 — Intelligence Layer
| # | Milestone | Status |
|---|---|---|
| 10 | Budget bar in header shows live total, remaining, over/under status | ⬜ |
| 11 | Leaflet map renders with city markers; arcs trace the route in order | ⬜ |
| 12 | Drag to reorder segments; budget recalculates | ⬜ |
| 13 | AI sidebar opens; Claude responds with full trip context | ⬜ |

### Sprint 4 — Polish & Ship
| # | Milestone | Status |
|---|---|---|
| 14 | Live on Vercel; localStorage persists across sessions | ⬜ |
| 15 | Usable at 375px viewport | ⬜ |
| 16 | Full Thailand → Japan → Korea demo itinerary entered, all features working | ⬜ |

### Post-MVP Backlog
- [ ] Vercel serverless proxy for Claude API key (security hardening)
- [ ] Supabase sync (multi-device)
- [ ] Read-only share link
- [ ] PDF / print export
- [ ] Live flight search (Skyscanner API)
- [ ] Google Places autocomplete for city input
- [ ] Currency conversion with live rates

---

## Development Workflow

This project is managed with a lightweight agile process to simulate real-world team practices.

**Branching:**
```
main          — stable, deployable at all times
feat/<name>   — new feature work
fix/<name>    — bug fixes
chore/<name>  — tooling, deps, config
```

**Commit format** ([Conventional Commits](https://www.conventionalcommits.org/)):
```
feat(itinerary): add drag-to-reorder for city segments
fix(budget): correct accommodation cost when segment has 0 nights
chore(deps): upgrade date-fns to 3.x
```

**Pull Requests:**
- One PR per milestone (or logical sub-unit)
- PR title matches the milestone description
- Self-reviewed with screenshots of UI changes before merge

**Definition of Done:**
- TypeScript compiles with no errors (`npm run build` passes)
- Feature works end-to-end in the browser
- No regressions in previously completed milestones

---

## The Done Condition

> *"I can plan my Thailand → Japan → South Korea summer trip, enter all my flights, accommodation, and activities, see my total budget versus my €3,000 limit, and ask Claude if the plan is realistic."*

When that sentence is true, the MVP is shipped.

---

## License

MIT
