# Journey — Project Whitepaper
### Multi-City Trip Planner with AI Planning Layer
**Version:** 1.0  
**Author:** Max  
**Status:** Pre-build / Active Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target User & Use Case](#3-target-user--use-case)
4. [Functional Requirements (MVP)](#4-functional-requirements-mvp)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Data Model](#7-data-model)
8. [Frontend Architecture](#8-frontend-architecture)
9. [AI Layer — Claude Integration](#9-ai-layer--claude-integration)
10. [Tech Stack & Rationale](#10-tech-stack--rationale)
11. [File & Folder Structure](#11-file--folder-structure)
12. [Component Breakdown](#12-component-breakdown)
13. [State Management](#13-state-management)
14. [Build Milestones](#14-build-milestones)
15. [Scope Boundaries](#15-scope-boundaries)
16. [Trade-offs & Decisions](#16-trade-offs--decisions)
17. [Future Roadmap](#17-future-roadmap)
18. [Design Aesthetic](#18-design-aesthetic)

---

## 1. Project Overview

TripArchitect is a structured, single-user multi-city trip planning workspace. It lets a traveler build a full itinerary across multiple countries — cities, domestic and international flights between them, accommodation per city, and activities — while tracking a running budget in real time. An AI sidebar powered by the Anthropic Claude API allows natural language questions about the plan: budget feasibility, routing alternatives, packing advice, and realistic cost estimates.

The project is intentionally scoped as a **planner, not a search engine.** It does not fetch live flight or hotel prices (that is post-MVP). It is a structured workspace where the user inputs their own data, and the value comes from the visual clarity, budget aggregation, and AI reasoning on top of the plan.

**One-sentence description:**  
*A multi-destination trip planner that tracks flights, accommodation, and activities across cities with a live budget view and an AI planning assistant.*

---

## 2. Problem Statement

Planning a multi-city trip across Thailand, Japan, and South Korea involves juggling: domestic flights within each country, international flights between countries, hotel or Airbnb options per city with variable nightly rates, activities and their costs, the order of destinations, and a total trip budget — all while keeping track of dates and durations.

No existing tool handles this well end-to-end:

- **Google Flights** handles one flight at a time with no budget aggregation
- **Booking.com / Airbnb** are per-property with no trip-level view
- **Notion / spreadsheets** can hold the data but give no structure, no budget rollup, and no AI reasoning
- **TripIt / Wanderlog** are itinerary organizers but not planners — they expect you to already have the data

The gap is a **structured planning canvas** that holds the whole trip as one coherent data structure and reasons over it.

---

## 3. Target User & Use Case

**Primary user:** Max — a student planning a summer trip to Thailand → Japan → South Korea with a defined total budget.

**User profile:**
- Comfortable with technology but wants a clean, opinionated UI, not a spreadsheet
- Has a rough budget in EUR/CHF and wants to see if the plan fits
- Wants to ask questions like "is 6 days in Tokyo realistic for €800?" and get a real answer
- Will use the app on desktop while researching and on mobile to reference during the trip

**Secondary use cases (post-MVP):**
- Share a read-only itinerary link with travel companions
- Export to PDF for offline reference
- Use as a portfolio project demo in internship interviews

---

## 4. Functional Requirements (MVP)

These are the exact features the MVP must have. Everything else is explicitly deferred.

### 4.1 Trip Management
- [ ] Create a new trip with a name, total budget, and base currency
- [ ] Edit trip name, budget, and currency
- [ ] Delete a trip
- [ ] Persist trips in localStorage (no backend required for MVP)

### 4.2 City Segments
- [ ] Add a city to the trip (name, country, arrival date, departure date)
- [ ] Edit a city segment
- [ ] Delete a city segment
- [ ] Reorder city segments via drag-and-drop
- [ ] Display city stay duration in nights (auto-calculated from dates)

### 4.3 Flights / Transit
- [ ] Add a flight between two consecutive cities (origin, destination, airline optional, cost, duration, booking link optional)
- [ ] Edit and delete a flight
- [ ] Support both international and domestic flights with the same data structure

### 4.4 Accommodation
- [ ] Add accommodation to a city (name, type: Hotel / Airbnb / Hostel / Other, cost per night, booking link optional)
- [ ] Total accommodation cost for a city auto-calculated from (cost/night × nights)
- [ ] Edit and delete accommodation

### 4.5 Activities
- [ ] Add activities to a city (name, cost, optional date/day within the stay)
- [ ] Edit and delete activities
- [ ] Total activity cost per city auto-calculated

### 4.6 Budget View
- [ ] Live budget summary panel showing:
  - Total trip cost (sum of all flights + all accommodation + all activities)
  - Budget remaining (total budget − total trip cost)
  - Cost breakdown by category (flights / accommodation / activities)
  - Cost breakdown by city
- [ ] Visual indicator when over budget (red) vs. under budget (green)
- [ ] Currency display consistent throughout (base currency set on trip)

### 4.7 Map View
- [ ] Display all cities as markers on an interactive map
- [ ] Draw arcs between cities in trip order to visualize the route
- [ ] Clicking a city marker highlights that city's segment in the itinerary panel

### 4.8 AI Sidebar (Claude)
- [ ] Collapsible sidebar with a chat interface
- [ ] On open, the full trip plan is injected as context into every Claude API call
- [ ] User can ask free-form questions about the plan
- [ ] Claude has access to the full structured trip data (cities, dates, costs, budget)
- [ ] Suggested prompts shown when sidebar first opens
- [ ] Chat history persists within the session (not across sessions for MVP)

### 4.9 Export / Share (MVP scope: minimal)
- [ ] Copy a plain-text summary of the itinerary to clipboard

---

## 5. Non-Functional Requirements

| Requirement | Target | Rationale |
|---|---|---|
| Performance | Initial load < 2s | Single-user, no backend, fast enough |
| Responsiveness | Usable on mobile (375px+) | User wants to reference trip on phone |
| Data persistence | localStorage | No backend in MVP; user's data survives page refresh |
| Security | API key never in client bundle | Claude API key injected via environment variable, proxied if needed |
| Accessibility | Keyboard navigable core flows | Good practice, low overhead |
| Browser support | Chrome, Firefox, Safari (latest 2 versions) | Standard modern web |

**Deliberately not required for MVP:**
- Multi-user / authentication
- Backend / database
- Offline mode (beyond localStorage)
- Real-time collaboration
- 99.9% uptime SLA
- Automated tests (add post-MVP)

---

## 6. System Architecture

### MVP Architecture (No Backend)

```
┌─────────────────────────────────────┐
│           Browser (React)           │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │ Trip Planner│  │  AI Sidebar  │  │
│  │    Canvas   │  │  (Claude)    │  │
│  └─────────────┘  └──────┬───────┘  │
│                          │          │
│  ┌─────────────┐         │          │
│  │ Map View    │         │          │
│  │ (Leaflet)   │         │          │
│  └─────────────┘         │          │
│                          │          │
│  ┌─────────────────────┐ │          │
│  │    localStorage     │ │          │
│  │  (trip persistence) │ │          │
│  └─────────────────────┘ │          │
└──────────────────────────┼──────────┘
                           │ HTTPS POST
                    ┌──────▼──────────┐
                    │  Anthropic API  │
                    │  /v1/messages   │
                    └─────────────────┘
```

**Key architectural decision:** There is no backend server in the MVP. All state lives in the React app and is persisted to localStorage. The only external call is to the Anthropic API for the AI sidebar. This removes all DevOps complexity and lets us ship fast.

**Claude API key handling:** The API key must never be embedded in client-side code or checked into the repo. Use a `.env` file with `VITE_ANTHROPIC_API_KEY`. In production, if the app is publicly deployed, implement a minimal proxy (a single Vercel serverless function) to avoid key exposure. For local development and demo purposes, the env var approach is acceptable.

### Post-MVP Architecture (with Backend)

When real API integrations (flight search, hotel search) are needed, a backend is introduced:

```
Browser (React) ──HTTPS──> Vercel Serverless / Express API
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              Anthropic API  Skyscanner API  Booking API
```

---

## 7. Data Model

This is the core of the application. All state is a single `Trip` object tree. Claude Code should keep this structure strictly — all components read from and write to this shape.

### TypeScript Types

```typescript
// Base currency is always stored. Display conversion is UI-only.
type Currency = 'EUR' | 'CHF' | 'USD' | 'GBP' | 'JPY' | 'THB' | 'KRW';

type AccommodationType = 'Hotel' | 'Airbnb' | 'Hostel' | 'Guesthouse' | 'Other';

type TransitType = 'Flight' | 'Train' | 'Bus' | 'Ferry' | 'Other';

interface Activity {
  id: string;               // uuid
  name: string;
  cost: number;             // in trip base currency
  date?: string;            // ISO date, optional (might not know exact day yet)
  notes?: string;
  bookingLink?: string;
}

interface Accommodation {
  id: string;               // uuid
  name: string;
  type: AccommodationType;
  costPerNight: number;     // in trip base currency
  bookingLink?: string;
  notes?: string;
  // total cost = costPerNight × parent CitySegment.nights (auto-calculated, never stored)
}

interface Transit {
  id: string;               // uuid
  type: TransitType;
  fromCity: string;         // city name (denormalized for readability)
  toCity: string;
  departureDate: string;    // ISO date
  arrivalDate: string;      // ISO date (may differ from departure for long-haul)
  cost: number;             // in trip base currency
  durationMinutes?: number;
  airline?: string;         // or operator for trains/buses
  flightNumber?: string;
  bookingLink?: string;
  notes?: string;
}

interface CitySegment {
  id: string;               // uuid
  city: string;
  country: string;
  arrivalDate: string;      // ISO date
  departureDate: string;    // ISO date
  // nights = date diff of arrivalDate and departureDate (auto-calculated, never stored)
  accommodation?: Accommodation;
  activities: Activity[];
  transitToNext?: Transit;  // flight/train to the NEXT city in the sequence
  notes?: string;
}

interface BudgetSummary {
  totalFlightCost: number;
  totalAccommodationCost: number;
  totalActivityCost: number;
  totalCost: number;
  budgetRemaining: number;
  isOverBudget: boolean;
  costByCity: { cityId: string; cityName: string; cost: number }[];
}

interface Trip {
  id: string;               // uuid
  name: string;             // e.g. "Thailand → Japan → Korea, Summer 2025"
  totalBudget: number;
  currency: Currency;
  segments: CitySegment[];  // ordered array — order IS the itinerary order
  createdAt: string;        // ISO datetime
  updatedAt: string;        // ISO datetime
}

// Root app state
interface AppState {
  trips: Trip[];
  activeTripId: string | null;
}
```

### Derived / Computed Values

These are **never stored** — always computed on the fly from the base data:

```typescript
// Nights in a city
const nights = (segment: CitySegment): number =>
  differenceInDays(parseISO(segment.departureDate), parseISO(segment.arrivalDate));

// Total accommodation cost for a city
const accommodationCost = (segment: CitySegment): number =>
  segment.accommodation ? segment.accommodation.costPerNight * nights(segment) : 0;

// Total activity cost for a city
const activityCost = (segment: CitySegment): number =>
  segment.activities.reduce((sum, a) => sum + a.cost, 0);

// Total cost for a city (accommodation + activities; flights are on transitToNext)
const cityCost = (segment: CitySegment): number =>
  accommodationCost(segment) + activityCost(segment);

// Full budget summary for a trip
const budgetSummary = (trip: Trip): BudgetSummary => { ... };
```

### localStorage Schema

```typescript
// Key: "tripar_state"
// Value: JSON.stringify(AppState)

// On app init:
const saved = localStorage.getItem('tripar_state');
const initialState: AppState = saved ? JSON.parse(saved) : { trips: [], activeTripId: null };

// On every state change:
localStorage.setItem('tripar_state', JSON.stringify(state));
```

---

## 8. Frontend Architecture

### Layout

The app has a single-page layout with three main regions:

```
┌──────────────────────────────────────────────────────────┐
│  Header: Trip name | Budget bar | Currency | Settings    │
├───────────────────────┬──────────────────────────────────┤
│                       │                                  │
│   Map Panel           │   Itinerary Panel                │
│   (Leaflet map        │   (scrollable list of            │
│    with city arcs)    │    CitySegment cards)            │
│                       │                                  │
│   ~40% width          │   ~60% width                    │
│                       │                                  │
├───────────────────────┴──────────────────────────────────┤
│  Budget Summary Bar (collapsible)                        │
└──────────────────────────────────────────────────────────┘
                                          ┌────────────────┐
                                          │  AI Sidebar    │
                                          │  (slides in    │
                                          │   from right)  │
                                          └────────────────┘
```

On mobile (< 768px): map collapses to a small strip at top, itinerary takes full width, AI sidebar is a full-screen modal.

### Page Structure

There are only two views:

1. **Home / Trip List** — shows all saved trips, create new trip CTA
2. **Trip Workspace** — the main planning canvas (described above)

No router needed for MVP — use a simple state variable `{ view: 'home' | 'workspace' }`.

---

## 9. AI Layer — Claude Integration

### System Prompt

Every Claude API call includes a system prompt that:
1. Tells Claude it is a travel planning assistant
2. Injects the full current trip as structured JSON
3. Specifies the response format (conversational, concise, no markdown headers)

```typescript
const buildSystemPrompt = (trip: Trip, summary: BudgetSummary): string => `
You are a knowledgeable travel planning assistant helping the user plan their trip.

You have full access to the user's current trip plan. Use this data to answer questions concisely and helpfully.

## Current Trip Plan

Trip: ${trip.name}
Budget: ${trip.currency} ${trip.totalBudget}
Total planned cost: ${trip.currency} ${summary.totalCost}
Budget remaining: ${trip.currency} ${summary.budgetRemaining}
Status: ${summary.isOverBudget ? 'OVER BUDGET' : 'Within budget'}

## Itinerary

${trip.segments.map((seg, i) => `
City ${i + 1}: ${seg.city}, ${seg.country}
  Dates: ${seg.arrivalDate} → ${seg.departureDate} (${nights(seg)} nights)
  Accommodation: ${seg.accommodation ? `${seg.accommodation.name} (${seg.accommodation.type}) — ${trip.currency} ${seg.accommodation.costPerNight}/night = ${trip.currency} ${accommodationCost(seg)} total` : 'Not set'}
  Activities: ${seg.activities.length === 0 ? 'None planned' : seg.activities.map(a => `${a.name} (${trip.currency} ${a.cost})`).join(', ')}
  ${seg.transitToNext ? `Flight to next city: ${seg.transitToNext.fromCity} → ${seg.transitToNext.toCity}, ${trip.currency} ${seg.transitToNext.cost}` : ''}
`).join('\n')}

## Instructions

- Answer concisely. No need to repeat the full trip back to the user.
- If asked about budget feasibility, be specific — reference actual numbers from the plan.
- If asked for recommendations, be concrete (name real places, real price ranges).
- If the plan has obvious issues (over budget, very short stays, missing key costs), proactively flag them.
- Respond in plain conversational text. No markdown headers. Short paragraphs or bullet points are fine.
`;
```

### API Call Pattern

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const sendMessage = async (
  userMessage: string,
  history: ChatMessage[],
  trip: Trip
): Promise<string> => {
  const summary = budgetSummary(trip);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(trip, summary),
      messages: [
        ...history,
        { role: 'user', content: userMessage }
      ],
    }),
  });

  const data = await response.json();
  return data.content[0].text;
};
```

### Suggested Prompts (shown when sidebar opens)

- "Is my budget realistic for this trip?"
- "Which city am I spending the most on?"
- "What's a realistic daily food budget for Tokyo?"
- "Am I spending enough nights in each place?"
- "What am I missing from this plan?"

---

## 10. Tech Stack & Rationale

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Large ecosystem, fast dev server, well-understood |
| Language | TypeScript | Strict typing on the data model prevents bugs; shows engineering discipline |
| Styling | Tailwind CSS | Utility-first, fast to iterate, consistent spacing |
| State | Zustand | Lightweight, no boilerplate, persists easily to localStorage |
| Map | Leaflet + React-Leaflet | Free, open-source, no API key needed for tile layer (OpenStreetMap) |
| Date handling | date-fns | Lightweight, tree-shakeable, good ISO date support |
| Drag & drop | @dnd-kit/core | Modern, accessible, well-maintained |
| AI | Anthropic SDK / fetch | Direct API call; Claude Sonnet 4 for quality + speed |
| Icons | Lucide React | Clean, consistent icon set |
| Persistence | localStorage | No backend needed for MVP |
| Deploy | Vercel | Free, zero-config for Vite projects |

**No UI component library.** All components are custom-built with Tailwind. This keeps the design distinctive and avoids generic aesthetics.

---

## 11. File & Folder Structure

```
tripar/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component, view routing
│   │
│   ├── types/
│   │   └── trip.ts                 # All TypeScript interfaces (see Section 7)
│   │
│   ├── store/
│   │   ├── tripStore.ts            # Zustand store — all trip state + actions
│   │   └── uiStore.ts              # UI state (active panel, sidebar open, etc.)
│   │
│   ├── utils/
│   │   ├── budget.ts               # budgetSummary(), cityCost(), nights() etc.
│   │   ├── dates.ts                # date formatting helpers
│   │   ├── ids.ts                  # uuid generation (crypto.randomUUID())
│   │   └── claude.ts               # buildSystemPrompt(), sendMessage()
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Trip name, budget bar, currency selector
│   │   │   └── BudgetSummaryBar.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── TripList.tsx
│   │   │   └── CreateTripModal.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── TripMap.tsx         # Leaflet map container
│   │   │   └── RouteArc.tsx        # SVG arc overlay between cities
│   │   │
│   │   ├── itinerary/
│   │   │   ├── ItineraryPanel.tsx  # Scrollable list of segments
│   │   │   ├── CitySegmentCard.tsx # One city's full card
│   │   │   ├── TransitCard.tsx     # Flight/train between cities
│   │   │   ├── AccommodationRow.tsx
│   │   │   └── ActivityRow.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── AddCityForm.tsx
│   │   │   ├── AddFlightForm.tsx
│   │   │   ├── AddAccommodationForm.tsx
│   │   │   └── AddActivityForm.tsx
│   │   │
│   │   └── ai/
│   │       ├── AISidebar.tsx       # Sidebar container + open/close
│   │       ├── ChatThread.tsx      # Message history display
│   │       ├── ChatInput.tsx       # Input bar + send button
│   │       └── SuggestedPrompts.tsx
│   │
│   └── styles/
│       └── globals.css             # Tailwind directives + CSS custom properties
│
├── .env.local                      # VITE_ANTHROPIC_API_KEY (never commit)
├── .env.example                    # Template showing required env vars
├── .gitignore                      # includes .env.local
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 12. Component Breakdown

### `tripStore.ts` — Actions

The Zustand store exposes these actions. All business logic lives here, not in components.

```typescript
interface TripStore {
  // State
  trips: Trip[];
  activeTripId: string | null;
  
  // Trip actions
  createTrip: (name: string, budget: number, currency: Currency) => void;
  updateTrip: (tripId: string, updates: Partial<Pick<Trip, 'name' | 'totalBudget' | 'currency'>>) => void;
  deleteTrip: (tripId: string) => void;
  setActiveTrip: (tripId: string | null) => void;
  
  // Segment actions
  addSegment: (tripId: string, segment: Omit<CitySegment, 'id' | 'activities'>) => void;
  updateSegment: (tripId: string, segmentId: string, updates: Partial<CitySegment>) => void;
  deleteSegment: (tripId: string, segmentId: string) => void;
  reorderSegments: (tripId: string, newOrder: string[]) => void; // array of segment ids
  
  // Accommodation actions
  setAccommodation: (tripId: string, segmentId: string, accommodation: Omit<Accommodation, 'id'>) => void;
  updateAccommodation: (tripId: string, segmentId: string, updates: Partial<Accommodation>) => void;
  removeAccommodation: (tripId: string, segmentId: string) => void;
  
  // Activity actions
  addActivity: (tripId: string, segmentId: string, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (tripId: string, segmentId: string, activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (tripId: string, segmentId: string, activityId: string) => void;
  
  // Transit actions
  setTransitToNext: (tripId: string, segmentId: string, transit: Omit<Transit, 'id'>) => void;
  updateTransitToNext: (tripId: string, segmentId: string, updates: Partial<Transit>) => void;
  removeTransitToNext: (tripId: string, segmentId: string) => void;
}
```

### `CitySegmentCard.tsx` — Structure

```
CitySegmentCard
├── DragHandle (dnd-kit)
├── CityHeader (city name, country, dates, nights badge)
├── TransitCard (flight from previous city — shown above this card)
├── AccommodationSection
│   ├── AccommodationRow (if set)
│   └── AddAccommodationButton (if not set)
├── ActivitiesSection
│   ├── ActivityRow[] 
│   └── AddActivityButton
├── CityBudgetFooter (subtotal for this city)
└── DeleteSegmentButton
```

---

## 13. State Management

### Zustand Store with localStorage Persistence

```typescript
// src/store/tripStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTripId: null,
      
      createTrip: (name, budget, currency) => set(state => ({
        trips: [...state.trips, {
          id: crypto.randomUUID(),
          name,
          totalBudget: budget,
          currency,
          segments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
      })),
      
      // ... other actions
    }),
    {
      name: 'tripar_state',  // localStorage key
    }
  )
);
```

### UI Store (separate from data store)

```typescript
// src/store/uiStore.ts
interface UIStore {
  aiSidebarOpen: boolean;
  activeSegmentId: string | null;   // highlighted on map
  editingItemId: string | null;     // which form is open
  
  toggleAISidebar: () => void;
  setActiveSegment: (id: string | null) => void;
  setEditingItem: (id: string | null) => void;
}
```

---

## 14. Build Milestones

Follow these in order. Do not skip ahead. Each milestone is binary — done or not done.

| # | Milestone | Done When |
|---|---|---|
| 1 | Project skeleton | Vite + React + TS + Tailwind runs locally with no errors |
| 2 | Type definitions | All types in `src/types/trip.ts` are complete and compiling |
| 3 | Zustand store | Store is set up with persistence; can create/read/delete a trip from devtools |
| 4 | Home screen | Can create a trip and see it listed; navigate to workspace |
| 5 | Empty workspace | Workspace layout renders: header, map placeholder, empty itinerary panel |
| 6 | Add city | Can add a city segment with dates; it appears in the itinerary panel |
| 7 | Add flight | Can add a transit between two cities; it appears between segment cards |
| 8 | Add accommodation | Can add accommodation to a city; nightly cost × nights calculates correctly |
| 9 | Add activities | Can add activities to a city; costs add up correctly |
| 10 | Budget summary | Budget bar in header shows live total, remaining, and over/under status |
| 11 | Map view | Leaflet map renders with city markers; arcs drawn between cities in order |
| 12 | Drag to reorder | Segments can be reordered via drag-and-drop; budget recalculates |
| 13 | AI sidebar | Sidebar opens; can send a message; Claude responds with trip context |
| 14 | Deploy | App is live on Vercel; localStorage persists across sessions |
| 15 | Mobile polish | Layout is usable on 375px viewport; tested on real phone |
| 16 | Demo ready | Full Thailand → Japan → Korea itinerary entered; all features working |

**Estimated time:** 3–4 weekends.

---

## 15. Scope Boundaries

### In scope for MVP

Everything in Section 4 (Functional Requirements). Nothing more.

### Explicitly out of scope for MVP (do not build, do not start)

- Live flight search (Skyscanner, Google Flights API)
- Live hotel search (Booking.com, Airbnb API)
- User authentication / accounts
- Backend server or database
- Multi-user collaboration / sharing
- PDF export
- Offline PWA
- Push notifications / reminders
- Currency auto-conversion (use fixed rates or single currency)
- Dark mode toggle (pick one and ship it)
- Undo/redo history
- Trip duplication
- Calendar view
- Packing list feature
- Real-time weather integration
- Google Maps (use Leaflet + OpenStreetMap — no API key needed)

### The done condition

*"I can plan my Thailand → Japan → South Korea summer trip, enter all my flights, accommodation, and activities, see my total budget versus my €3,000 limit, and ask Claude if the plan is realistic."*

When that sentence is true, the MVP is shipped.

---

## 16. Trade-offs & Decisions

### localStorage over a backend

**Decision:** Persist all data in localStorage, no backend for MVP.

**Why:** Eliminates all DevOps complexity. No server to deploy, no database to manage, no auth to implement. The app is single-user by design. localStorage is sufficient for one person's trip data (< 1MB easily).

**Trade-off:** Data is browser-bound and device-bound. Not accessible from another device without export/import. Acceptable for MVP.

**Migration path:** Swap Zustand's `persist` middleware backend from localStorage to a Supabase client with one config change when multi-device sync is needed.

### Leaflet over Google Maps

**Decision:** Use Leaflet + OpenStreetMap tiles.

**Why:** No API key required. No billing account. Simpler setup. Fully sufficient for showing city locations and drawing route arcs.

**Trade-off:** Less polished map tiles than Google Maps. No Street View. No Places autocomplete.

**Migration path:** Swap tile provider to Mapbox for better aesthetics (free tier is generous). Add Google Places autocomplete for city name input post-MVP.

### Zustand over Redux / Context

**Decision:** Zustand for state management.

**Why:** No boilerplate. Built-in persistence middleware. The entire store fits in one file. Easy to reason about.

**Trade-off:** Less familiar to engineers coming from Redux. Slightly less structured. Acceptable for a project of this scale.

### No UI component library

**Decision:** All UI components are custom-built with Tailwind.

**Why:** Gives complete control over the visual identity. No fighting against a component library's defaults. The result is more distinctive in a portfolio demo.

**Trade-off:** More time spent on component implementation. Worth it for a portfolio project where the UI is part of the value.

### Claude API called directly from browser (dev only)

**Decision:** For local development, call the Anthropic API directly from the browser using an env var API key.

**Why:** Simplest possible path to get AI working. No backend needed.

**Trade-off:** API key is technically in the browser for local dev. For production deployment, add a one-function Vercel serverless proxy that holds the key server-side. This is a one-hour addition post-MVP.

---

## 17. Future Roadmap

In rough priority order, post-MVP:

**High value, moderate effort:**
- Vercel serverless proxy for Claude API key (security)
- Multi-device sync via Supabase (replace localStorage)
- Read-only share link (generate a shareable URL for the trip)
- PDF / print export of the itinerary
- Trip duplication (start a new trip from an existing template)

**High value, high effort:**
- Real flight search integration (Skyscanner Rapid API)
- Hotel search integration (Booking.com affiliate API)
- Google Places autocomplete for city input
- Collaborative editing (multiple users on one trip)

**Nice to have:**
- Currency conversion with live rates (Open Exchange Rates API)
- Packing list per trip
- Day-by-day itinerary within a city stay
- Mobile app (React Native, shared logic)

---

## 18. Design Aesthetic

The visual direction is **dark brutalist editorial** — consistent with Max's aesthetic sensibility.

### Design Tokens

```css
:root {
  /* Background layers */
  --bg-base: #0a0a0a;
  --bg-surface: #111111;
  --bg-elevated: #1a1a1a;
  --bg-overlay: #222222;

  /* Text */
  --text-primary: #f0f0f0;
  --text-secondary: #888888;
  --text-muted: #444444;

  /* Accent */
  --accent: #e8ff47;          /* Sharp yellow-green — the one color that pops */
  --accent-dim: #b8cc38;
  --danger: #ff4444;
  --success: #44ff88;

  /* Borders */
  --border: #2a2a2a;
  --border-strong: #444444;

  /* Typography */
  --font-display: 'Space Mono', monospace;    /* Headers, numbers, labels */
  --font-body: 'Inter', sans-serif;           /* Body text, descriptions */

  /* Spacing scale (8pt grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
}
```

### Visual Rules

- Budget numbers use `--font-display` (monospace) — numbers should feel like data
- City names are large and bold — the geographic anchors of the UI
- The accent color (`--accent`) is used only for: active state, budget-OK indicator, primary CTA buttons. Nowhere else.
- Over-budget state uses `--danger` (red) on the budget bar
- Cards have `1px solid var(--border)` — no shadows, no gradients on cards
- Map tiles should use a dark style (CartoDB Dark Matter — no API key needed)
- The AI sidebar slides in from the right with a subtle backdrop blur on the main content

### Typography Usage

```
Trip name:           Space Mono, 24px, bold
City name:           Space Mono, 20px, bold  
Section labels:      Space Mono, 11px, uppercase, letter-spacing: 0.1em, --text-secondary
Body / descriptions: Inter, 14px, --text-primary
Cost figures:        Space Mono, 16px, --accent (when positive) / --danger (when over)
Dates / metadata:    Inter, 13px, --text-secondary
```

---

## Appendix A — Environment Variables

```bash
# .env.local (never commit this file)
VITE_ANTHROPIC_API_KEY=sk-ant-...

# .env.example (commit this as documentation)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## Appendix B — Getting Started (for Claude Code)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Add your Anthropic API key to .env.local

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

**Starting point for Claude Code:**
Begin with Milestone 1 (project scaffold) and work through milestones in order. Do not implement features beyond the current milestone. The data model in Section 7 is canonical — do not deviate from those TypeScript types without updating this document.

All business logic (budget calculations, date math, Claude prompt building) belongs in `src/utils/`. Components should be thin — they read from the store and call store actions.

The store is the single source of truth. Never store derived values (nights, total costs, budget summary) — always compute them.
