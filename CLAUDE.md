# CLAUDE.md — Journey Project Context

This file is for Claude Code. Read it at the start of every session.

---

## What This Project Is

**Journey** — a multi-city trip planner with a live budget tracker and Claude AI assistant sidebar.

Full spec: `WHITEPAPER.md` (canonical — do not deviate from it without updating it first).

**One-sentence done condition:**
> "I can plan my Thailand → Japan → South Korea trip, enter all flights, accommodation, and activities, see my total budget vs €3,000 limit, and ask Claude if the plan is realistic."

---

## Current State

**Active Sprint:** Sprint 3 — Intelligence Layer  
**Current Milestone:** 10 (budget summary bar)  

Update this section at the start of each session. Check `git log --oneline -10` and the README milestone table to orient yourself.

---

## Tech Stack (do not substitute)

- React 18 + Vite + TypeScript
- Tailwind CSS (no component library)
- Zustand with `persist` middleware → localStorage key `journey_state`
- Leaflet + React-Leaflet (map)
- @dnd-kit/core (drag-and-drop)
- date-fns (date math)
- Lucide React (icons)
- Anthropic Claude Sonnet 4 (AI sidebar, direct browser fetch in dev)
- Deploy: Vercel

---

## Design System (strict)

```css
--bg-base: #0a0a0a
--bg-surface: #111111
--bg-elevated: #1a1a1a
--text-primary: #f0f0f0
--text-secondary: #888888
--accent: #e8ff47        /* use sparingly: active state, OK budget, primary CTA only */
--danger: #ff4444
--success: #44ff88
--border: #2a2a2a

Font display (headers, numbers, labels): Space Mono
Font body: Inter

8pt spacing grid. No shadows on cards. No gradients. 1px solid border on cards.
Map tiles: CartoDB Dark Matter (no API key needed).
```

---

## Data Model (canonical — never store derived values)

All types live in `src/types/trip.ts`. The root shape is:

```
AppState
└── trips: Trip[]
    └── segments: CitySegment[]
        ├── accommodation?: Accommodation
        ├── activities: Activity[]
        └── transitToNext?: Transit
```

Derived values (nights, accommodationCost, activityCost, budgetSummary) live in `src/utils/budget.ts` and are always computed — never stored.

localStorage key: `journey_state`

---

## Architecture Rules

1. All business logic lives in `src/utils/`. Components are thin — they read from the store and call store actions.
2. All state mutations go through the Zustand store (`src/store/tripStore.ts`). Never mutate state in a component.
3. UI state (sidebar open, active segment, editing item) lives in a separate `src/store/uiStore.ts`.
4. The Claude API key lives only in `.env.local` (never committed). Variable: `VITE_ANTHROPIC_API_KEY`.

---

## Sprint & Milestone Structure

### Sprint 1 — Foundation ✅
- [x] 1. Vite + React + TS + Tailwind runs locally, no errors
- [x] 2. All types in `src/types/trip.ts` compile
- [x] 3. Zustand store with persistence; create/read/delete trip works in devtools
- [x] 4. Home screen — create a trip, see it listed, navigate to workspace

### Sprint 2 — Core Planner ✅
- [x] 5. Workspace layout renders (header, map placeholder, itinerary panel)
- [x] 6. Add city segment with dates; appears in itinerary panel
- [x] 7. Add transit between cities; appears between segment cards
- [x] 8. Add accommodation; nightly cost × nights calculates correctly
- [x] 9. Add activities; costs per city add up correctly

### Sprint 3 — Intelligence Layer
- [ ] 10. Budget bar in header shows live total, remaining, over/under status
- [ ] 11. Leaflet map renders with city markers; arcs trace the route in order
- [ ] 12. Drag to reorder segments; budget recalculates
- [ ] 13. AI sidebar opens; Claude responds with full trip context

### Sprint 4 — Polish & Ship
- [ ] 14. Live on Vercel; localStorage persists across sessions
- [ ] 15. Usable at 375px viewport
- [ ] 16. Full Thailand → Japan → Korea demo itinerary entered, all features working

---

## Workflow Rules

**Branching:**
```
main            — stable, always deployable
feat/<name>     — new feature (one branch per milestone)
fix/<name>      — bug fix
chore/<name>    — tooling, deps, config
```

**Commit format (Conventional Commits):**
```
feat(itinerary): add drag-to-reorder for city segments
fix(budget): correct accommodation cost for 0-night stays
chore(deps): upgrade date-fns to 3.x
```

**One milestone = one branch = one PR.** Update README milestone status from ⬜ to ✅ in the same PR.

**Definition of Done (every milestone must pass all four):**
1. TypeScript compiles with zero errors (`npm run build` passes)
2. Feature works end-to-end in the browser (happy path + one edge case)
3. No regressions in previously completed milestones
4. Merged to main via PR

---

## Session Restart Checklist

When a new session starts, Claude should:

1. Run `git log --oneline -10` to see recent work
2. Run `git status` to see any in-progress changes
3. Check the milestone table above to find the active milestone
4. Ask the user "We're on Milestone X — [description]. Want to pick up where we left off?"

---

## What NOT to Build (MVP scope boundary)

- Live flight/hotel search
- Authentication or user accounts
- Backend or database
- Multi-user / collaboration
- PDF export
- Dark mode toggle (it's always dark)
- Undo/redo
- Currency auto-conversion
- Google Maps (use Leaflet)
- Any milestone beyond the current active one

If it's not on the milestone list, it doesn't get built yet.

---

## File Locations Quick Reference

```
src/types/trip.ts              — all TypeScript interfaces
src/store/tripStore.ts         — Zustand trip data store
src/store/uiStore.ts           — Zustand UI state store
src/utils/budget.ts            — budget calculations
src/utils/dates.ts             — date formatting
src/utils/ids.ts               — crypto.randomUUID() wrapper
src/utils/claude.ts            — buildSystemPrompt(), sendMessage()
src/components/layout/         — Header, BudgetSummaryBar
src/components/home/           — TripList, CreateTripModal
src/components/map/            — TripMap, RouteArc
src/components/itinerary/      — ItineraryPanel, CitySegmentCard, etc.
src/components/forms/          — all add/edit forms
src/components/ai/             — AISidebar, ChatThread, ChatInput
src/styles/globals.css         — Tailwind directives + CSS custom properties
.env.local                     — VITE_ANTHROPIC_API_KEY (never commit)
.env.example                   — committed template
```
