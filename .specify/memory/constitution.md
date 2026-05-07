<!-- Sync Impact Report: Initial constitution created for stock-visualizer project. Version 1.0.0. All templates require compatibility review. -->

# Stock Visualizer Constitution

## Core Principles

### I. Simplicity Over Abstraction

Every design decision prioritizes simplicity and directness over theoretical elegance or abstraction layers. New abstractions require explicit justification demonstrating measurable complexity reduction. Remove unnecessary wrappers around framework features. Prefer straightforward implementations over clever patterns. When in doubt, choose the simplest solution that solves the immediate problem.

### II. Minimal Dependencies

Only add external dependencies when strong justification exists: solving a genuinely hard problem, significant time savings, or critical functionality. Every dependency is a liability—increased attack surface, maintenance burden, bundle size, and cognitive overhead. Prefer native browser APIs, Node.js built-ins, and lightweight single-purpose packages. Audit all dependencies quarterly for necessity and security.

### III. Realtime-First Architecture

The application is fundamentally event-driven and realtime. WebSocket is the single communication channel; no polling. All state updates propagate immediately to connected clients. Latency perception drives UX decisions. Optimize for feel and responsiveness over backend efficiency. Dashboard updates MUST appear instantaneous. Real-time correctness takes precedence over visual refinements.

### IV. Strong TypeScript & Code Discipline

All code is strictly typed. TypeScript configuration enforces strict null checks, no implicit any, and exhaustive checks. Types serve as executable documentation and prevent entire categories of bugs. Every function has clear input/output contracts. Composition over inheritance. Single responsibility—functions do one thing well. Avoid magic constants (named constants only). No dead code permitted.

### V. No Overengineering

Build only what exists today. YAGNI principle enforced. No microservices, no ORM, no unnecessary state libraries, no database unless absolutely required. File size MUST NOT exceed 300 lines; split into smaller modules. No speculative abstractions. Features are not added until concrete need exists. Reject scalability assumptions that add complexity to the current scope.

### VI. Deterministic Performance & Efficiency

Graph rendering must remain smooth under load. Use derived/reactive state to avoid unnecessary rerenders. Implement fixed-size memory buffers for tick history. SVG-based graph rendering with efficient DOM updates. Animations are smooth but don't compromise functionality. Performance is non-negotiable; optimization is expected before code review. All performance-critical paths tested and measured.

### VII. Testing & Validation (NON-NEGOTIABLE)

Core diff/simulation logic MUST be unit tested with deterministic outcomes. WebSocket message contracts MUST be validated on both client and server. Graph calculations MUST be deterministic. At minimum: unit tests for business logic, contract validation for all messages, integration tests for critical flows. Tests verify behavior, not implementation. Red-Green-Refactor cycle enforced.

### VIII. UI/UX Principles

Minimal dark UI aesthetic. Green indicates upward movement, red indicates downward movement. Animations are smooth and purposeful. Keyboard accessible throughout (no mouse-only interactions). Responsive layout adapts to all screen sizes. Visual feedback is immediate. Clarity and usability always override fancy effects. Color choices must accommodate color-blind users.

### IX. Unified Event-Driven Architecture

Single Node.js server with no database (unless proven necessary). One WebSocket manager handles all streams—no fragmented state management. Shared realtime simulation engine drives all tick generation and distribution. All updates are event-based; state is derived from event history up to a point (fixed-size buffers). Clear event contracts between server and client, validated on both sides.

### X. Governance & Simplicity-First Decision Making

This constitution supersedes all other practices and competing frameworks. Simplicity takes precedence over scalability assumptions. Realtime correctness takes precedence over visual effects. Any proposal to add complexity, dependencies, or new patterns MUST justify it in writing against these principles. All PRs are reviewed for constitution compliance. Amendments to this document require clear rationale and impact assessment. Runtime development guidance lives in `.github/copilot-instructions.md`.

## Technology Stack Requirements

The following stack is mandatory and fixed:

- **Backend**: Node.js only (no alternative runtimes)
- **Frontend**: Svelte 5 only
- **Real-time Communication**: WebSocket (no Socket.io, no polling alternatives)
- **Graph Rendering**: SVG and native browser APIs (no charting libraries unless justified in writing)
- **State Management**: In-memory with fixed-size buffers (no Redis, no databases unless absolutely necessary)
- **Authentication**: None (no external providers, no JWT complexity unless required)
- **Language**: TypeScript strictly (no JavaScript fallback)

## Quality & Performance Standards

**Code Quality**:

- TypeScript strict mode enforced
- No files larger than 300 lines (split large modules)
- Maximum 3 levels of nesting in control flow
- All public APIs must be documented
- No console.log in production code (use structured logging if needed)

**Performance**:

- Dashboard updates must render within 16ms (60 FPS target)
- Graph panning/zooming must be interactive (no lag)
- Memory footprint bounded by fixed-size buffers (no memory leaks)
- Bundle size targets: server <10MB, client <500KB gzipped

**Testing**:

- Core business logic: ≥80% code coverage
- All WebSocket contracts: message validation tests required
- All UI components: responsive/accessibility tests
- Determinism: Graph calculations tested with fixed datasets

## Governance

**Constitution Precedence**: This constitution supersedes all other practices, preferences, and frameworks. When a conflict arises, resolve it in favor of the principles above.

**Amendment Process**:

1. Change MUST address one or more principles or add clear, measurable guidance
2. Author documents rationale and impact on existing work
3. Propose version number change (MAJOR/MINOR/PATCH)
4. Review for complexity introduction and necessity
5. Once approved, update all dependent templates and guidance files

**Versioning Policy**:

- MAJOR: Principle removal or redefinition (backward incompatible)
- MINOR: New principle added, section expanded, new constraints
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Compliance Review**:

- All PRs MUST verify alignment with these principles
- Complexity MUST be justified in writing
- Dependencies MUST be explicitly approved before addition
- New patterns MUST reference their principle justification

**Version**: 1.0.0 | **Ratified**: 2026-05-07 | **Last Amended**: 2026-05-07
