# PulseTick — Realtime Stock Tracker Dashboard

A modern realtime dashboard application that demonstrates WebSocket-driven architecture with Svelte 5 frontend and Node.js backend. Create simulated stock-like trackers that update continuously with live-updating graphs.

## Tech Stack

- **Backend**: Node.js, TypeScript, WebSocket (ws library)
- **Frontend**: Svelte 5, TailwindCSS, Chart.js
- **Architecture**: Event-driven, realtime-first WebSocket communication
- **State**: In-memory only, no database required
- **Testing**: TypeScript with Vitest (backend)

## Project Structure

```
stock-visualizer/
├── backend/
│   ├── src/
│   │   ├── server.ts           # WebSocket server & message routing
│   │   ├── simulation.ts       # Core simulation engine
│   │   ├── types.ts            # Shared message contracts
│   │   └── simulation.test.ts  # Unit tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.svelte           # Main app layout
│   │   │   ├── TrackerCard.svelte   # Individual tracker display
│   │   │   ├── Graph.svelte         # Live-updating graph
│   │   │   ├── CreateTrackerForm.svelte
│   │   │   └── ConnectionStatus.svelte
│   │   ├── stores.ts           # Svelte stores (WebSocket + trackers)
│   │   ├── types.ts            # Frontend types
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── specs/                      # Feature specifications
│   └── 001-pulsetick/
│       ├── spec.md            # Full feature specification
│       └── checklists/
│           └── requirements.md # Quality checklist
└── package.json               # Root workspace config
```

## Features Implemented

### ✅ Core MVP (P1)
- [x] Create trackers with symbol name and volatility threshold
- [x] Real-time value updates (every 1 second)
- [x] Live-updating graph with 60-point history buffer
- [x] Green/red visual feedback (up/down movement)
- [x] Direction indicator (arrows)

### ✅ User Control (P2)
- [x] Pause/resume individual trackers
- [x] Remove trackers from dashboard
- [x] Connection status indicator
- [x] Auto-reconnect with exponential backoff

### ✅ Architecture
- [x] Single Node.js server (no clustering)
- [x] One WebSocket manager handling all streams
- [x] Shared realtime simulation engine
- [x] Fixed-size circular buffers (60 points per tracker)
- [x] Message contract validation
- [x] Duplicate symbol prevention

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm 8+

### Quick Start

```bash
# Install dependencies
npm install

# Start development servers (concurrent)
npm run dev

# Backend: ws://localhost:8080
# Frontend: http://localhost:5173
```

### Build for Production

```bash
npm run build
npm start
```

## API & Message Contracts

### Client → Server

**CREATE_TRACKER**
```json
{
  "type": "CREATE_TRACKER",
  "payload": {
    "symbol": "TATA",
    "threshold": 30
  }
}
```

**PAUSE_TRACKER / RESUME_TRACKER / REMOVE_TRACKER**
```json
{
  "type": "PAUSE_TRACKER",
  "payload": { "trackerId": "uuid" }
}
```

### Server → Client

**TICK** (realtime price update)
```json
{
  "type": "TICK",
  "payload": {
    "id": "uuid",
    "symbol": "TATA",
    "value": 102.45,
    "delta": 2.45,
    "timestamp": 1683721200000
  }
}
```

**CONNECTION_STATUS**
```json
{
  "type": "CONNECTION_STATUS",
  "payload": { "status": "CONNECTED" }
}
```

**ERROR**
```json
{
  "type": "ERROR",
  "payload": {
    "code": "INVALID_SYMBOL",
    "message": "Symbol cannot be empty"
  }
}
```

## Performance Metrics

- Dashboard load: < 2 seconds
- Tracker creation: < 3 seconds
- Value updates: Every 1 second (±100ms tolerance)
- Graph rendering: 60 FPS (16ms per frame)
- WebSocket payload: < 1KB per message
- Supports: 10+ simultaneous connected clients

## Testing

```bash
cd backend
npm test
```

Run tests with coverage for core simulation logic, message contracts, and determinism validation.

## Constitution Compliance

This project follows the **Stock Visualizer Constitution**:

- ✅ **Simplicity Over Abstraction** — No unnecessary layers; straightforward implementations
- ✅ **Minimal Dependencies** — Only justified dependencies (Chart.js for graphing)
- ✅ **Realtime-First Architecture** — WebSocket event-driven; no polling
- ✅ **Strong TypeScript** — Strict mode; exhaustive checks; clear contracts
- ✅ **No Overengineering** — Files <300 lines; YAGNI principle enforced
- ✅ **Deterministic Performance** — 60 FPS target; fixed-size buffers; no memory leaks
- ✅ **Testing & Validation** — Core logic unit tested; message contracts validated
- ✅ **UI/UX Principles** — Minimal dark UI; green/red semantics; accessible
- ✅ **Unified Event-Driven** — Single server; one WebSocket manager; shared simulation
- ✅ **Governance** — No speculative patterns; justified complexity

## Development

### Code Quality Rules

- Functions have single responsibility
- Max file size: 300 lines
- Composition over inheritance
- No magic constants (named constants only)
- No dead code
- TypeScript strict mode enforced

### Adding a New Feature

1. Update [specs/001-pulsetick/spec.md](specs/001-pulsetick/spec.md)
2. Add unit tests for new business logic
3. Implement backend changes in `backend/src/`
4. Add frontend components in `frontend/src/components/`
5. Update message contracts in `types.ts` if needed
6. Test E2E: create tracker → watch updates → pause → remove

## Future Enhancements (Out of Scope v1.0)

- Persistence (SQLite optional)
- User authentication
- Export data functionality
- Custom chart visualizations
- Historical data analysis
- Clustering / horizontal scaling

## License

MIT
