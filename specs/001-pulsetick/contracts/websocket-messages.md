# WebSocket Message Contracts: PulseTick

**Feature**: PulseTick | **Date**: 2026-05-07 | **Protocol**: WebSocket JSON

## Overview

PulseTick uses a single WebSocket connection per client for bidirectional realtime communication. All messages are JSON objects with a `type` field and `payload` field.

**Validation Rule**: Both client and server MUST validate message structure before processing. Invalid messages trigger ERROR response.

## Client → Server Messages

Messages sent by frontend to backend to control tracker state.

### CREATE_TRACKER

**Purpose**: Add a new tracker to the simulation

**Message Structure**:

```json
{
  "type": "CREATE_TRACKER",
  "payload": {
    "symbol": "string (1-10 chars, uppercase)",
    "threshold": "number (0-100 inclusive)"
  }
}
```

**Validation**:

- `symbol` must not be empty
- `symbol` must not exceed 10 characters
- `symbol` must not already exist (duplicate check)
- `threshold` must be integer in range [0, 100]

**Server Response**:

- Success: Broadcasts TICK message with new tracker's initial state
- Failure: Sends ERROR message with code and description

**Example**:

```json
{
  "type": "CREATE_TRACKER",
  "payload": {
    "symbol": "TATA",
    "threshold": 30
  }
}
```

### PAUSE_TRACKER

**Purpose**: Stop simulation for a specific tracker (freeze value)

**Message Structure**:

```json
{
  "type": "PAUSE_TRACKER",
  "payload": {
    "trackerId": "string (UUID)"
  }
}
```

**Validation**:

- `trackerId` must reference existing tracker

**Server Response**:

- Success: (no message; client detects pause via absence of new ticks)
- Failure: Sends ERROR message

**Example**:

```json
{
  "type": "PAUSE_TRACKER",
  "payload": {
    "trackerId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### RESUME_TRACKER

**Purpose**: Resume simulation for a paused tracker

**Message Structure**:

```json
{
  "type": "RESUME_TRACKER",
  "payload": {
    "trackerId": "string (UUID)"
  }
}
```

**Validation**:

- `trackerId` must reference existing paused tracker

**Server Response**:

- Success: Resumes tick generation; next tick sent normally
- Failure: Sends ERROR message

### REMOVE_TRACKER

**Purpose**: Delete a tracker from the simulation

**Message Structure**:

```json
{
  "type": "REMOVE_TRACKER",
  "payload": {
    "trackerId": "string (UUID)"
  }
}
```

**Validation**:

- `trackerId` must reference existing tracker

**Server Response**:

- Success: Broadcasts ERROR with code "TRACKER_REMOVED" (signals all clients to remove UI)
- Failure: Sends ERROR message

## Server → Client Messages

Messages broadcast by backend to all connected clients.

### TICK (Realtime Price Update)

**Purpose**: Broadcast one price update to all connected clients

**Message Structure**:

```json
{
  "type": "TICK",
  "payload": {
    "id": "string (UUID, unique per tick)",
    "symbol": "string (tracker symbol)",
    "value": "number (price, ≥ 1)",
    "delta": "number (value change from previous)",
    "timestamp": "number (milliseconds since epoch)"
  }
}
```

**Frequency**: Once per second per active (non-paused) tracker

**Client Handling**:

1. Validate: all fields present and correct types
2. Find tracker by symbol in local store
3. Update: currentValue = payload.value, previousValue = old currentValue
4. Append: add value to history array
5. Truncate: if history.length > 60, shift oldest value
6. Re-render: UI automatically updates via Svelte reactivity

**Example**:

```json
{
  "type": "TICK",
  "payload": {
    "id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
    "symbol": "TATA",
    "value": 102.45,
    "delta": 2.45,
    "timestamp": 1683721201000
  }
}
```

### CONNECTION_STATUS

**Purpose**: Inform client of WebSocket connection state

**Message Structure**:

```json
{
  "type": "CONNECTION_STATUS",
  "payload": {
    "status": "CONNECTED | DISCONNECTED | RECONNECTING"
  }
}
```

**When Sent**:

- CONNECTED: Immediately after client connects (handshake)
- RECONNECTING: Not sent by server (client sets locally during reconnect)
- DISCONNECTED: Not sent by server (client detects via close event)

**Client Handling**:

- Update UI status indicator to show connection state
- Only CONNECTED allows sending messages; others show disabled state

**Example**:

```json
{
  "type": "CONNECTION_STATUS",
  "payload": {
    "status": "CONNECTED"
  }
}
```

### ERROR

**Purpose**: Inform client of an error condition

**Message Structure**:

```json
{
  "type": "ERROR",
  "payload": {
    "code": "string (error code)",
    "message": "string (human-readable description)"
  }
}
```

**Error Codes**:

- `INVALID_SYMBOL` — Symbol is empty or invalid
- `INVALID_THRESHOLD` — Threshold not in range [0, 100]
- `SYMBOL_EXISTS` — Duplicate symbol attempted
- `CREATE_TRACKER_FAILED` — Generic creation failure
- `PAUSE_FAILED` — Pause operation failed
- `RESUME_FAILED` — Resume operation failed
- `REMOVE_FAILED` — Remove operation failed
- `TRACKER_REMOVED` — Tracker was removed (server-initiated)
- `PARSE_ERROR` — Message JSON parsing failed
- `INVALID_MESSAGE` — Message type/structure invalid

**Client Handling**:

- Log error for debugging
- Show error toast/notification if user-facing (create, pause, remove)
- Special case TRACKER_REMOVED: remove tracker from UI
- Dismiss errors after 5 seconds

**Example**:

```json
{
  "type": "ERROR",
  "payload": {
    "code": "SYMBOL_EXISTS",
    "message": "Symbol TATA already tracked"
  }
}
```

## Message Flow Diagrams

### Create Tracker Sequence

```
CLIENT                              SERVER
  |                                   |
  | CREATE_TRACKER (TATA, 30%)        |
  |-------- msg ---------->           |
  |                              [validate]
  |                              [create tracker]
  |                              [start simulation]
  |                          [generate initial tick]
  |     <-------- TICK (TATA, 100, 0) -----
  | [create UI card]
  |                          [every 1 second]
  |     <-------- TICK (TATA, 102.5, 2.5) -----
  | [update value + graph]
  |
```

### Pause/Resume Sequence

```
CLIENT                              SERVER
  |                                   |
  | PAUSE_TRACKER (trackerId)         |
  |-------- msg ---------->           |
  |                              [mark paused]
  |                         [skip in tick loop]
  | (no ticks received)
  |                                   |
  | RESUME_TRACKER (trackerId)        |
  |-------- msg ---------->           |
  |                              [unmark paused]
  |                          [tick generation resumes]
  |     <-------- TICK (TATA, 101.2, ?) -----
  | [update value + graph]
  |
```

### Error Handling Sequence

```
CLIENT                              SERVER
  |                                   |
  | CREATE_TRACKER (TATA, 30%)        |
  |-------- msg ---------->           |
  |                          [TATA already exists]
  |     <-------- ERROR -----
  |                    (code: SYMBOL_EXISTS)
  | [show error toast]
  | [user retries with different symbol]
  |
```

## Contract Validation

### Backend Validation (TypeScript)

```typescript
// Types enforce structure at compile time
interface CreateTrackerMessage {
  type: "CREATE_TRACKER";
  payload: {
    symbol: string;
    threshold: number;
  };
}

// Runtime validation in message handler
function handleCreateTracker(msg: CreateTrackerMessage) {
  if (!msg.payload.symbol || msg.payload.symbol.trim().length === 0) {
    sendError("INVALID_SYMBOL", "Symbol cannot be empty");
    return;
  }
  if (msg.payload.threshold < 0 || msg.payload.threshold > 100) {
    sendError("INVALID_THRESHOLD", "Threshold must be 0-100");
    return;
  }
  // ... proceed
}
```

### Frontend Validation (TypeScript)

```typescript
// Type-safe message parsing
const message: ServerMessage = JSON.parse(event.data);

switch (message.type) {
  case "TICK":
    const tick: Tick = message.payload;
    // TypeScript ensures tick has all required fields
    trackerStore.updateTracker(tick);
    break;
  // ...
}
```

## Performance Characteristics

**Payload Sizes**:

- TICK: ~150 bytes (id, symbol, value, delta, timestamp)
- CREATE_TRACKER: ~50 bytes
- PAUSE/RESUME/REMOVE: ~50 bytes
- ERROR: ~100 bytes

**Bandwidth** (10 trackers, 10 clients):

- 10 ticks/second \* ~150 bytes = 1.5 KB/sec per tracker
- 1.5 KB \* 10 = 15 KB/sec network traffic
- ~1.3 MB per hour per client

**Latency Targets**:

- Client message → server processing: <10ms
- Tick broadcast to UI update: <100ms (including network latency)
- Reconnect detection: <5 seconds (heartbeat ping/pong)

---

**Version**: 1.0.0 | **Created**: 2026-05-07
