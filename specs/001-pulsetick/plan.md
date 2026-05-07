# Implementation Plan: PulseTick

**Branch**: `001-pulsetick` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)

**Note**: This plan documents the implementation design for PulseTick, a realtime stock tracker dashboard using Node.js and Svelte 5 with WebSocket-driven architecture.

## Summary

PulseTick is a realtime dashboard application demonstrating WebSocket-driven event architecture. The system maintains a single shared simulation engine on the server that continuously generates price updates for independent tracker symbols. All clients connect via WebSocket and receive realtime ticks broadcasted to all connected users. The frontend provides a responsive dark UI with live-updating graphs, direction indicators, and control buttons for pause/resume/remove operations.

**Key Architecture Decision**: Single unified server simulation engine (not per-client) ensures all clients see consistent market state and reduces redundant computation. Event-driven updates broadcast to all connected clients with <100ms latency perception.

## Technical Context

**Language/Version**: TypeScript 5.2, Node.js 18+, Svelte 5
**Primary Dependencies**:

- Backend: ws (WebSocket), TypeScript compiler
- Frontend: Chart.js (charting), Svelte 5, TailwindCSS
  **Storage**: In-memory only (no database for MVP)
  **Testing**: Vitest for backend unit tests
  **Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge 2021+)
  **Project Type**: Web application (realtime dashboard)
  **Performance Goals**: 60 FPS graph rendering, <16ms DOM updates, 1-second tick frequency, <1KB WebSocket payloads
  **Constraints**: No external APIs, single Node.js server, in-memory state only, fixed 60-point history buffers
  **Scale/Scope**: MVP supports 10+ simultaneous clients, unlimited symbols, simple responsive layout

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Stock Visualizer Constitution v1.0.0 Compliance:**

| Principle                                  | Status  | Notes                                                                                           |
| ------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| I. Simplicity Over Abstraction             | ✅ Pass | No wrapper layers; straightforward implementation; max 300-line files                           |
| II. Minimal Dependencies                   | ✅ Pass | Only justified deps: ws (required), Chart.js (justified for speed), TailwindCSS (utility-first) |
| III. Realtime-First Architecture           | ✅ Pass | WebSocket events only; no polling; single broadcast manager                                     |
| IV. Strong TypeScript & Code Discipline    | ✅ Pass | Strict mode; all interfaces typed; message contracts explicit                                   |
| V. No Overengineering                      | ✅ Pass | YAGNI enforced; no ORM, no state libraries, no database unless needed                           |
| VI. Deterministic Performance & Efficiency | ✅ Pass | 60 FPS target; fixed-size buffers; circular array for history                                   |
| VII. Testing & Validation                  | ✅ Pass | Unit tests for simulation; message contract validation on both sides                            |
| VIII. UI/UX Principles                     | ✅ Pass | Minimal dark UI; green/red semantics; keyboard accessible                                       |
| IX. Unified Event-Driven Architecture      | ✅ Pass | Single server; one WebSocket manager; shared simulation engine                                  |
| X. Governance & Simplicity-First           | ✅ Pass | No speculative patterns; justified complexity; strong typing                                    |

**Gate Status**: ✅ PASS — Ready for Phase 1 Design

## Project Structure

### Documentation (this feature)

```
specs/001-pulsetick/
├── plan.md                    # This file
├── spec.md                    # Feature specification
├── research.md                # (if needed - skipped, all clarified)
├── data-model.md              # Phase 1 output
├── contracts/                 # Phase 1 output
│   ├── websocket-messages.md
│   └── state-schema.md
└── checklists/
    └── requirements.md        # Quality validation
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── types.ts               # Message contracts (50 lines)
│   ├── simulation.ts          # Simulation engine (150 lines)
│   ├── server.ts              # WebSocket server (200 lines)
│   └── simulation.test.ts     # Unit tests (100 lines)
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── types.ts               # Frontend types (30 lines)
│   ├── stores.ts              # WebSocket + state management (150 lines)
│   ├── App.svelte             # Main layout (100 lines)
│   ├── main.ts                # Entry point (10 lines)
│   └── components/
│       ├── TrackerCard.svelte           # Tracker display (80 lines)
│       ├── Graph.svelte                 # Chart.js wrapper (120 lines)
│       ├── CreateTrackerForm.svelte    # Form (90 lines)
│       └── ConnectionStatus.svelte     # Status indicator (30 lines)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json

package.json                   # Root workspace config
README.md                       # Complete documentation
```

## Phase 0: Research & Clarification

**Status**: ✅ COMPLETE

All specification ambiguities resolved in clarification session (2026-05-07):

1. **Duplicate Symbol Handling** → Prevent duplicates with error message
2. **Disconnect Behavior** → Auto-reconnect with exponential backoff
3. **Initial Price** → Fixed at 100 for consistency
4. **Graph Rendering** → Single-color line with gradient fill
5. **Chart Library** → Use Chart.js for faster development

**Key Technical Decisions**:

- Random walk simulation with volatility factor (not sine wave, simpler)
- Exponential backoff reconnection: 500ms, 1s, 2s, 4s (max 30s)
- Circular buffer implementation (manual array management, not libraries)
- Message validation through TypeScript interfaces (not separate schema library)

## Phase 1: Design & Contracts

### 1.1 Data Model

**Tracker State** (backend in-memory):

```typescript
interface TrackerState {
  id: string; // UUID
  symbol: string; // User-provided name (TATA, BTC, etc.)
  threshold: number; // Volatility 0-100
  currentValue: number; // Latest price
  paused: boolean; // Simulation paused?
  history: number[]; // Circular buffer, max 60 points
  createdAt: number; // Timestamp
}
```

**Tick Event** (represents one price update):

```typescript
interface Tick {
  id: string; // Unique per tick
  symbol: string; // Which tracker
  value: number; // New price
  delta: number; // Change from previous
  timestamp: number; // When generated
}
```

**Frontend UI State** (derived from backend):

```typescript
interface TrackerUI {
  id: string;
  symbol: string;
  threshold: number;
  currentValue: number;
  previousValue: number; // For delta color
  paused: boolean;
  history: number[]; // Points for graphing
}
```

### 1.2 Interface Contracts (WebSocket Messages)

**Client → Server**:

- `CREATE_TRACKER`: {symbol, threshold}
- `PAUSE_TRACKER`: {trackerId}
- `RESUME_TRACKER`: {trackerId}
- `REMOVE_TRACKER`: {trackerId}

**Server → Client (Broadcast)**:

- `TICK`: {id, symbol, value, delta, timestamp}
- `CONNECTION_STATUS`: {status: CONNECTED|DISCONNECTED|RECONNECTING}
- `ERROR`: {code, message}

**Contract Validation**:

- Backend validates incoming client messages (type, payload shape)
- Frontend validates all server messages (type-safe parsing)
- Both sides enforce schema; invalid messages rejected with error response

### 1.3 State Architecture

**Backend (Server)**:

- `SimulationEngine`: Stateful manager of all trackers
  - `Map<trackerId, TrackerState>` — in-memory tracker registry
  - `Set<paused trackerId>` — pause state tracking
  - `simulateTick()` — generates price updates every 1 second
  - Lifecycle: `createTracker()` → periodic `simulateTick()` → `removeTracker()`

- `WebSocketServer`: Manages client connections
  - `Set<WebSocket>` — active client connections
  - `broadcast(message)` — sends tick to all connected clients
  - Message routing: client message → engine operation → broadcast result
  - Heartbeat ping/pong every 30 seconds (detect stale connections)

**Frontend (Client)**:

- `wsConnection` (Svelte store): WebSocket connection state + send method
  - Auto-reconnects with exponential backoff
  - `onMessage()` handler for server broadcasts
- `trackerStore` (Svelte store): Map of active trackers
  - Subscribe to receive live updates
  - Update on TICK messages: add history point, update current value
  - Remove on TRACKER_REMOVED error

- Components consume stores reactively
  - Value change triggers <16ms re-render (Svelte reactivity)

### 1.4 Simulation Engine Design

**Price Simulation Algorithm**:

```
for each active (non-paused) tracker:
  volatilityFactor = threshold / 100
  changePercent = (random() - 0.5) * 2 * volatilityFactor
  newValue = max(1, currentValue + (currentValue * changePercent))
  append to history (circular buffer, shift if >60)
  emit Tick event
```

**Why this approach**:

- Random walk provides "natural" looking price movement
- Threshold controls magnitude (0% = no change, 100% = wild swings)
- Circular buffer avoids memory growth
- Independent per tracker (no coupling)
- Deterministic (seeded tests possible with fixed Math.random())

**Fixed Buffer Management**:

- History array grows to 60, then oldest point discarded
- O(1) append + shift (acceptable for 1 per second)
- Graph always shows recent 60 points (≈1 minute rolling window)

### 1.5 Component Structure

**Backend (2 classes, 500 lines total)**:

1. **SimulationEngine** (150 lines)
   - Private: `trackers`, `pausedTrackers`, `tickCallbacks`, `tickTimer`
   - Public: `createTracker()`, `pauseTracker()`, `resumeTracker()`, `removeTracker()`, `getAllTrackers()`, `onTick()`
   - Responsibility: Manage tracker state, generate ticks, notify observers

2. **WebSocketServer** (200 lines)
   - Private: `wss`, `engine`, `clients`
   - Public: `start()`
   - Methods:
     - `setupServer()` — attach handlers
     - `setupSimulation()` — register engine tick callback
     - `handleMessage()` — route client messages
     - `broadcast()` — send to all clients
   - Responsibility: WebSocket connection lifecycle, message routing, error handling

**Frontend (4 components, 400 lines total)**:

1. **App.svelte** (100 lines) — Main layout
   - Props: none
   - Renders header (title + connection status) + tracker grid + form
   - Subscribes to stores; dispatches WebSocket messages

2. **TrackerCard.svelte** (80 lines) — Individual tracker display
   - Props: tracker (TrackerUI), onPause, onResume, onRemove
   - Renders: symbol, value, delta, arrow icon, graph, buttons
   - Color logic: delta >= 0 ? green : red

3. **Graph.svelte** (120 lines) — Chart.js wrapper
   - Props: tracker
   - Creates Chart.js instance on mount
   - Updates on tracker prop change (reactive)
   - Responsive height (h-48 = 12rem)
   - Responsive true, maintains aspect ratio

4. **CreateTrackerForm.svelte** (90 lines) — Tracker creation
   - Props: none
   - Renders: symbol input, threshold slider, submit button
   - Validation: non-empty symbol, 0-100 threshold
   - Dispatches: create event with {symbol, threshold}

5. **ConnectionStatus.svelte** (30 lines) — Status indicator
   - Props: none
   - Displays: colored dot + text (Connected/Disconnected/Reconnecting)
   - Subscribes to wsConnection store

**Stores (2 stores, 150 lines total)**:

1. **wsConnection** — WebSocket lifecycle
   - Auto-connects on init
   - Reconnect logic with exponential backoff
   - `send(message)` → broadcast to server
   - `onMessage(handler)` → register listener

2. **trackerStore** — Tracker state management
   - Map<symbol, TrackerUI>
   - `updateTracker(tick)` → update value, append to history
   - `removeTracker(trackerId)` → delete from map
   - `pauseTracker()` / `resumeTracker()` → toggle pause state

### 1.6 Performance Optimization Strategy

**Rendering Optimization**:

- Svelte reactivity: Only components with changed props re-render
- Tracker updates only modify `currentValue` and `history`
- Graph component uses Chart.js `.update('none')` (skip animations during rapid updates)
- TailwindCSS utility classes (no CSS computation overhead)

**Network Optimization**:

- WebSocket payload: ~100 bytes per TICK (id, symbol, value, delta, timestamp)
- Broadcast every 1 second (not 60 FPS) = 100 bytes/sec per tracker
- Heartbeat every 30 seconds (small ping/pong frames)

**Memory Optimization**:

- Circular buffer: fixed 60-point history per tracker (max 60 _ 8 bytes _ N trackers)
- 10 trackers = ~5KB data
- No memory leaks: old trackers properly cleaned up on remove

**CPU Optimization**:

- Server: O(N) simulation per tick (N = active trackers)
- Frontend: O(1) per tick (Svelte update + chart update)
- Paused trackers skip simulation (no CPU cost)

## Phase 2: Implementation Tasks

**Ready for generation via `/speckit.tasks`**

Task categories to be generated:

1. **Infrastructure Setup** — TypeScript configs, build setup, dependencies
2. **Backend Core** — SimulationEngine, WebSocketServer, message routing
3. **Frontend Core** — Stores, main App component, entry point
4. **UI Components** — TrackerCard, Graph, CreateTrackerForm, ConnectionStatus
5. **Integration** — WebSocket message handling, state synchronization
6. **Testing** — Unit tests for simulation, integration tests for messages
7. **Documentation** — README, inline comments, API documentation

## Assumptions

- Users have WebSocket-capable browsers (all modern browsers)
- Users have stable network connection (<500ms latency)
- Tracker data is ephemeral (not persisted across page refresh)
- Simulation accuracy is less important than perceived realtime-ness
- 60-point history is sufficient for visual analysis
- Single server instance sufficient for initial MVP
- No user authentication needed (anyone accessing server can control trackers)

## Constraints

- Server: Single Node.js instance (no clustering)
- Memory: Fixed buffers prevent unbounded growth
- Concurrency: Sequential event processing per tick interval
- Database: None (in-memory only until proven necessary)
- External APIs: Zero (all simulation local)
- Dependencies: Only justified libraries (ws, Chart.js, Svelte)

## Next Steps

1. **Phase 1 Complete**: Data model, contracts, state architecture defined above
2. **Generate Tasks**: Run `/speckit.tasks` to create dependency-ordered task list
3. **Implement Tasks**: Execute tasks in order; run tests; validate against spec
4. **Quality Gates**: Each task completion verified against acceptance criteria

---

**Version**: 1.0.0 | **Created**: 2026-05-07 | **Updated**: 2026-05-07
