# PulseTick — Realtime Stock Tracker Dashboard

A modern realtime dashboard application that demonstrates WebSocket-driven architecture with Svelte 5 frontend and Node.js backend. Create simulated stock-like trackers that update continuously with live-updating graphs.

## Tech Stack

- **Backend**: Node.js, TypeScript, WebSocket (ws library)
- **Frontend**: Svelte 5, TailwindCSS, Chart.js
- **Architecture**: Event-driven, realtime-first WebSocket communication
- **State**: In-memory only, no database required
- **Testing**: TypeScript with Vitest (backend)

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Backend: ws://localhost:8080
# Frontend: http://localhost:5173
```

## Features

- ✅ Create trackers with symbol and volatility threshold
- ✅ Real-time price updates (every 1 second)
- ✅ Live-updating graphs with 60-point history
- ✅ Green/red visual feedback for price direction
- ✅ Pause/resume individual trackers
- ✅ Remove trackers from dashboard
- ✅ Auto-reconnect with exponential backoff
- ✅ Connection status indicator

## Documentation

- [Implementation Plan](specs/001-pulsetick/plan.md)
- [Feature Specification](specs/001-pulsetick/spec.md)
- [Data Model](specs/001-pulsetick/data-model.md)
- [WebSocket Contracts](specs/001-pulsetick/contracts/websocket-messages.md)
- [Quickstart Guide](specs/001-pulsetick/quickstart.md)

## Project Structure

```
backend/
├── src/
│   ├── types.ts       # Message contracts
│   ├── simulation.ts  # Simulation engine
│   ├── server.ts      # WebSocket server
│   └── simulation.test.ts
└── package.json

frontend/
├── src/
│   ├── App.svelte
│   ├── stores.ts
│   ├── types.ts
│   └── components/
│       ├── TrackerCard.svelte
│       ├── Graph.svelte
│       ├── CreateTrackerForm.svelte
│       └── ConnectionStatus.svelte
├── index.html
└── package.json

specs/
└── 001-pulsetick/
    ├── plan.md
    ├── spec.md
    ├── data-model.md
    └── contracts/
        └── websocket-messages.md
```

## Performance

- Dashboard load: <2 seconds
- Value updates: Every 1 second
- Graph rendering: 60 FPS
- WebSocket payload: <1KB per message

## License

MIT
