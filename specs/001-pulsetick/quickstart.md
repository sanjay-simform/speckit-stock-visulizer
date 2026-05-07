# Quickstart: PulseTick Development

**Feature**: PulseTick | **Date**: 2026-05-07

## Installation

### Prerequisites

- Node.js 18+ (`node --version`)
- npm 8+ (`npm --version`)

### Clone & Install

```bash
cd /home/sanjay/projects/learning/stock-visualizer

# Install all dependencies (backend + frontend)
npm install
```

This installs workspace dependencies for both `backend/` and `frontend/`.

## Development Server

### Start Both Backend & Frontend (Recommended)

```bash
npm run dev
```

This runs both servers concurrently:

- **Backend**: WebSocket server on `ws://localhost:8080`
- **Frontend**: Dev server on `http://localhost:5173` (with hot reload)

### Individual Servers

**Backend only**:

```bash
cd backend && npm run dev
# Output: WebSocket server listening on ws://localhost:8080
```

**Frontend only**:

```bash
cd frontend && npm run dev
# Output: http://localhost:5173
```

## Testing

**Backend unit tests**:

```bash
cd backend && npm test
```

Runs Vitest on `simulation.test.ts`. Tests core simulation logic:

- Tracker creation with initial price 100
- Duplicate symbol rejection
- Pause/resume functionality
- Fixed buffer management (60-point max)

## Build for Production

```bash
# Build both backend and frontend
npm run build

# Start production backend
npm start
```

Outputs:

- Backend: `backend/dist/server.js`
- Frontend: `frontend/dist/index.html` + JS/CSS assets

## Architecture Overview

### Backend Structure

```
backend/src/
├── server.ts          # WebSocket server + message routing
├── simulation.ts      # Core simulation engine (tracker state + tick generation)
├── types.ts           # Message contract definitions
└── simulation.test.ts # Unit tests
```

**Key Classes**:

- `SimulationEngine` — Manages tracker state and price simulation
- `WebSocketServer` — Handles client connections and broadcasts ticks

### Frontend Structure

```
frontend/src/
├── App.svelte             # Main layout (header + tracker grid)
├── stores.ts              # Svelte stores (WebSocket + tracker state)
├── types.ts               # Frontend types
├── main.ts                # Entry point
└── components/
    ├── TrackerCard.svelte       # Tracker display card
    ├── Graph.svelte             # Chart.js graph wrapper
    ├── CreateTrackerForm.svelte # Symbol + threshold form
    └── ConnectionStatus.svelte  # Connection status indicator
```

**Key Concepts**:

- Stores for state management (reactive, auto-subscribe)
- Components are small and composable
- WebSocket messages handled in App.svelte

## First Steps: Create a Tracker

1. **Open** [http://localhost:5173](http://localhost:5173)
2. **See** "PulseTick" header with green connection indicator
3. **Fill in** form:
   - Symbol: `TATA`
   - Threshold: `30` (drag slider)
4. **Click** "Add Tracker"
5. **Watch** tracker card appear with live-updating value and graph

## Debugging

### Backend Logs

```bash
cd backend && npm run dev
# [WS] Client connected
# [WS] Message handling error: ...
# [Server] WebSocket server listening on ws://localhost:8080
```

### Browser Console

```javascript
// Check if WebSocket is connected
// (Connection Status indicator should be green)

// Open DevTools → Network tab
// Filter by "WS"
// Watch TICK messages arriving every 1 second
```

### Common Issues

**Connection Refused**:

- Backend not running? `npm run dev` in backend folder
- Wrong port? Check `WS_URL` in frontend .env or stores.ts

**Tracker not updating**:

- Check browser console for errors
- Check backend logs for message parsing errors
- Verify threshold is in range [0, 100]

**Graph not rendering**:

- Chart.js dependency installed? `npm install` in frontend
- Canvas element found? Check browser DevTools

## File Structure Reference

**Root level**:

- `package.json` — Workspace configuration (npm run scripts)
- `README.md` — Project overview and API documentation
- `specs/` — Feature specifications and design docs

**Backend**:

- `backend/package.json` — Node dependencies (ws, typescript)
- `backend/tsconfig.json` — TypeScript strict mode settings
- `backend/src/` — Source code (see structure above)
- `backend/dist/` — Compiled output (after npm run build)

**Frontend**:

- `frontend/package.json` — Browser dependencies (Svelte, TailwindCSS, Chart.js)
- `frontend/tsconfig.json` — TypeScript settings
- `frontend/vite.config.ts` — Vite build configuration
- `frontend/index.html` — HTML entry point
- `frontend/src/` — Source code (see structure above)
- `frontend/dist/` — Built output (after npm run build)

## Next Steps

- **Read** [plan.md](./plan.md) for architecture decisions
- **Read** [spec.md](./spec.md) for feature requirements
- **Read** [data-model.md](./data-model.md) for entity definitions
- **Read** [contracts/websocket-messages.md](./contracts/websocket-messages.md) for API spec
- **Modify** code and see hot reload (frontend) or restart (backend)
- **Test** by creating multiple trackers, pausing, resuming, removing

## Performance Tips

- Keep threshold moderate (0-50) for smooth value changes
- 10+ simultaneous trackers still smooth on modern hardware
- Graph with 60 points renders at 60 FPS
- WebSocket messages are <1KB (efficient network usage)

---

**Version**: 1.0.0 | **Created**: 2026-05-07
