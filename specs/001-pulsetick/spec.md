# Feature Specification: PulseTick — Realtime Stock Tracker Dashboard

**Feature Branch**: `001-pulsetick`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Build a realtime dashboard application called PulseTick using Node.js and Svelte 5"

## Purpose

PulseTick enables users to create and monitor simulated stock-like realtime trackers that continuously update their values and display live-updating graphs. Each tracker maintains independent state with configurable volatility, providing a foundation for understanding realtime architecture patterns and WebSocket-driven updates.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Configure Tracker (Priority: P1)

A user opens the dashboard and creates a new realtime tracker by:

1. Entering a symbol name (e.g., TATA, INFY, BTC, AAPL)
2. Setting a volatility threshold (0-100) to control price movement magnitude
3. Clicking "Add Tracker" to create the tracker card

The tracker immediately appears on the dashboard with a starting simulated value and begins updating in realtime.

**Why this priority**: This is the core MVP feature—users cannot track anything without being able to create trackers. Every other feature depends on having active trackers.

**Independent Test**: Can be tested by: (1) entering valid symbol and threshold, (2) verifying card appears with correct symbol name, (3) verifying simulated value begins updating every second. Delivers: functional MVP that demonstrates realtime value generation.

**Acceptance Scenarios**:

1. **Given** dashboard is open, **When** user enters symbol "TATA" with threshold "30" and clicks "Add", **Then** a tracker card appears with symbol "TATA" and a starting simulated value
2. **Given** tracker card exists, **When** 2 seconds pass, **Then** simulated value has changed reflecting threshold volatility
3. **Given** user has added 5 trackers, **When** user views dashboard, **Then** all 5 trackers are visible and updating simultaneously
4. **Given** user tries to add duplicate symbol, **When** user clicks "Add", **Then** system prevents duplicate and displays error message "Symbol already tracked"

---

### User Story 2 - Monitor Live Value Changes with Visual Feedback (Priority: P1)

For each active tracker card, users see:

- Current simulated value displayed prominently
- Direction indicator (up arrow / down arrow) showing if value increased or decreased since last update
- Green color highlighting when value moved upward
- Red color highlighting when value moved downward
- Smooth visual transitions as value changes

Visual feedback is immediate (within 16ms) so updates appear instantaneous.

**Why this priority**: This is essential MVP functionality. Users need to see realtime value changes clearly—without visual feedback, realtime updates are meaningless. This drives the entire UX experience.

**Independent Test**: Can be tested by: (1) observing a single tracker over 5+ seconds, (2) verifying value changes every 1 second, (3) verifying colors change correctly (green up, red down), (4) measuring render latency is <16ms. Delivers: core realtime feedback loop that proves system is live.

**Acceptance Scenarios**:

1. **Given** tracker shows value "100" in neutral color, **When** next update arrives with value "105", **Then** value displays "105" in green with up arrow
2. **Given** tracker shows value "105" in green, **When** next update arrives with value "100", **Then** value displays "100" in red with down arrow
3. **Given** user watches tracker for 10 seconds, **When** multiple updates arrive (every 1 second), **Then** all updates appear visually (colors change, values update) without noticeable lag
4. **Given** dashboard has 3 active trackers, **When** user observes for 10 seconds, **Then** all 3 trackers update simultaneously in sync

---

### User Story 3 - View Live Updating Graph History (Priority: P1)

Each tracker card displays a live-updating graph that:

- Shows X-axis as time (right-to-left scroll effect as time advances)
- Shows Y-axis as value price points
- Maintains limited history of recent values (e.g., last 60 points)
- Removes oldest points automatically as new points arrive
- Updates smoothly in realtime without jarring jumps
- Uses single-color line (white/cyan) with fill gradient (green for upward segments, red for downward segments)

Graph rendering remains smooth even with multiple active trackers on screen.

**Why this priority**: Graph visualization is critical for realtime perception. Without a graph, users cannot see patterns or understand market movement over time. This completes the core tracking experience.

**Independent Test**: Can be tested by: (1) creating tracker, (2) observing graph for 2 minutes (120 updates), (3) verifying all points are plotted, (4) verifying graph scrolls horizontally, (5) verifying only recent 60 points visible, (6) measuring graph render time stays <16ms per frame. Delivers: visual proof of realtime market history and patterns.

**Acceptance Scenarios**:

1. **Given** tracker has 5 data points, **When** user views graph, **Then** all 5 points are plotted as a line
2. **Given** tracker accumulates 70 data points over 70 seconds, **When** user views graph, **Then** only the most recent 60 points are visible, oldest points have scrolled off left edge
3. **Given** tracker value increases, **When** new point is added to graph, **Then** graph line moves upward and newest point appears on right edge
4. **Given** dashboard has 4 trackers with graphs active, **When** user observes for 30 seconds, **Then** all 4 graphs update smoothly without stuttering or lag

---

### User Story 4 - Control Tracker Playback (Priority: P2)

Each tracker card includes:

- **Pause Button**: Clicking pauses realtime updates (simulation stops, value freezes)
- **Resume Button**: Clicking resumes updates from the frozen point
- **Remove Button**: Clicking removes tracker from dashboard

Paused trackers persist their state; resuming continues from where they were paused.

**Why this priority**: Users need control over what they're watching. Pausing allows inspection of specific values; removing allows cleanup. This feature is valuable but not required for MVP.

**Independent Test**: Can be tested by: (1) creating tracker, (2) clicking pause after 10 updates, (3) verifying value stops changing, (4) clicking resume, (5) verifying updates continue, (6) clicking remove, (7) verifying tracker disappears. Delivers: user control and state management.

**Acceptance Scenarios**:

1. **Given** tracker is actively updating, **When** user clicks pause, **Then** value stops changing and button label switches to "Resume"
2. **Given** tracker is paused with value "50", **When** user clicks resume, **Then** value updates resume from where it was paused
3. **Given** user has 3 trackers with 1 paused, **When** other 2 continue updating, **Then** paused tracker does not update but others do
4. **Given** tracker exists on dashboard, **When** user clicks remove, **Then** tracker card disappears and is no longer tracked

---

### Edge Cases

- What happens when user creates tracker with empty symbol name? → System should reject (invalid input)
- What happens when user creates tracker with negative or >100 volatility? → System should clamp or reject
- What happens when WebSocket disconnects? → Client should show connection status; reconnect attempt should be visible to user
- What happens if user creates 50+ trackers? → System should handle without degrading (performance requirement)
- What happens when tracker has been running for 1 hour? → Graph maintains only recent 60 points; old history is discarded (fixed buffer)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to create new trackers by entering a unique symbol name and volatility threshold (0-100); system MUST reject duplicate symbols with error message
- **FR-002**: System MUST simulate continuous value changes for each tracker independently at 1-second intervals, starting from price of 100
- **FR-003**: System MUST broadcast tracker value updates to all connected clients via WebSocket in realtime
- **FR-004**: System MUST display current value, direction indicator, and color-coded feedback (green up, red down) for each tracker
- **FR-005**: System MUST render a live-updating graph showing price history (most recent 60 points) that scrolls horizontally as new points arrive
- **FR-006**: System MUST provide pause/resume functionality for individual trackers
- **FR-007**: System MUST provide remove functionality to delete trackers from dashboard
- **FR-008**: System MUST maintain independent state for each tracker (paused state, historical data, volatility threshold)
- **FR-009**: System MUST support multiple simultaneous connected clients receiving realtime updates
- **FR-010**: System MUST update all tracker displays within 16ms of receiving data (60 FPS target)
- **FR-011**: System MUST show WebSocket connection status to user (connected/disconnecting/disconnected); system MUST automatically attempt to reconnect with exponential backoff (no manual action required)
- **FR-012**: System MUST validate all WebSocket messages on both client and server against defined message contracts

### Key Entities

- **Tracker**: Represents a single stock-like asset being tracked
  - `id` (unique identifier)
  - `symbol` (user-provided name: TATA, BTC, etc.)
  - `threshold` (volatility 0-100)
  - `currentValue` (latest simulated price)
  - `paused` (boolean: is simulation paused)
  - `history` (circular buffer of last 60 price points for graphing)
  - `createdAt` (timestamp)

- **Tick**: Represents a single value update event
  - `id` (unique identifier per tick)
  - `symbol` (which tracker this tick belongs to)
  - `value` (simulated price value)
  - `delta` (value change from previous: current - previous)
  - `timestamp` (when this tick occurred)

- **Point** (graph point, derived from Tick):
  - `x` (timestamp, used for X-axis)
  - `y` (value, used for Y-axis)
  - `delta` (for determining color: green if positive, red if negative)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Dashboard loads and establishes WebSocket connection within 2 seconds
- **SC-002**: Users can create and view a tracker card within 3 seconds of clicking "Add"
- **SC-003**: Tracker values update every 1 second (±100ms tolerance) with visible value change on screen
- **SC-004**: Graph rendering maintains 60 FPS (16ms per frame) with up to 4 active tracker graphs on screen
- **SC-005**: WebSocket message payload for tracker updates is <1KB per message (efficient realtime communication)
- **SC-006**: System supports minimum 10 simultaneous connected clients receiving realtime updates without degradation
- **SC-007**: Users perceive value updates as instantaneous (all visual updates complete within 100ms of server sending data)
- **SC-008**: Graph displays accurately plots all price points from tracker history (no dropped points during realtime streaming)
- **SC-009**: Pause/resume functionality toggles state within 100ms of user click
- **SC-010**: Connection status indicator shows current WebSocket state accurately (connected/disconnected/reconnecting)

## Assumptions

- **User Base**: Users have modern browsers (Chrome, Firefox, Safari, Edge from 2021+) with WebSocket support
- **Network**: Users have stable internet connection with <500ms latency to server
- **Data Retention**: Tracker data is ephemeral—no persistence required. Refreshing page clears all trackers (in-memory only for MVP)
- **Simulation Model**: Volatility threshold controls magnitude of each 1-second price change; exact simulation algorithm to be defined during planning (e.g., random walk, sine wave, etc.)
- **Initial Value**: Each tracker starts with a base price of 100
- **Graph History Size**: Fixed buffer of 60 most recent points balances graph readability with memory efficiency
- **Graph Line Rendering**: Single-color line (white/cyan) with fill gradient using green color below line for upward price movement, red color below line for downward price movement
- **Disconnect Handling**: WebSocket disconnect triggers automatic reconnection with exponential backoff (500ms, 1s, 2s, 4s max); no manual user action required; connection status indicator updates to show "Reconnecting..." while attempting
- **Concurrency Model**: Single Node.js server handles all trackers and clients (no clustering)
- **Database**: Not required for MVP; all state is in-memory. SQLite or persistence considered only if needed after MVP validation
- **Scope**: No user authentication, no external APIs, no data export, no multi-user collaboration

## Clarifications Resolved

Clarifications session 2026-05-07:

- **Q1: Duplicate Symbol Behavior** → **A: Prevent duplicate** (system rejects if symbol already exists with error message "Symbol already tracked")
- **Q2: Disconnect Behavior** → **A: Auto-reconnect** (silent exponential backoff with status indicator showing "Reconnecting..." state)
- **Q3: Initial Price** → **A: Fixed value 100** (all trackers start at price 100 for predictability)
- **Q4: Graph Line Color** → **A: Single-color line with gradient fill** (white/cyan line with green fill for upward, red fill for downward segments)
- **Q5: Chart Library** → **A: Use charting library** (Chart.js or similar for faster development and proven realtime rendering performance)
