import { randomUUID } from "crypto";
import { TrackerState, Tick } from "./types.js";

const BUFFER_SIZE = 60;
const INITIAL_PRICE = 100;
const TICK_INTERVAL = 1000; // 1 second

/**
 * SimulationEngine: Manages ticker simulation with independent state per tracker
 * Single engine instance shared across all clients via WebSocket broadcast
 */
export class SimulationEngine {
  private trackers: Map<string, TrackerState> = new Map();
  private tickCallbacks: ((tick: Tick) => void)[] = [];
  private pausedTrackers: Set<string> = new Set();
  private tickTimer: NodeJS.Timer | null = null;

  start(): void {
    if (this.tickTimer) return;

    this.tickTimer = setInterval(() => {
      this.simulateTick();
    }, TICK_INTERVAL);
  }

  stop(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  createTracker(symbol: string, threshold: number): TrackerState {
    // Check for duplicate
    const exists = Array.from(this.trackers.values()).some(
      (t) => t.symbol === symbol,
    );
    if (exists) {
      throw new Error(`Symbol already tracked`);
    }

    const tracker: TrackerState = {
      id: randomUUID(),
      symbol,
      threshold,
      currentValue: INITIAL_PRICE,
      paused: false,
      history: [INITIAL_PRICE],
      createdAt: Date.now(),
    };

    this.trackers.set(tracker.id, tracker);
    return tracker;
  }

  pauseTracker(trackerId: string): void {
    if (!this.trackers.has(trackerId)) {
      throw new Error(`Tracker not found: ${trackerId}`);
    }
    this.pausedTrackers.add(trackerId);
    const tracker = this.trackers.get(trackerId)!;
    tracker.paused = true;
  }

  resumeTracker(trackerId: string): void {
    if (!this.trackers.has(trackerId)) {
      throw new Error(`Tracker not found: ${trackerId}`);
    }
    this.pausedTrackers.delete(trackerId);
    const tracker = this.trackers.get(trackerId)!;
    tracker.paused = false;
  }

  removeTracker(trackerId: string): void {
    this.trackers.delete(trackerId);
    this.pausedTrackers.delete(trackerId);
  }

  getAllTrackers(): TrackerState[] {
    return Array.from(this.trackers.values());
  }

  getTracker(trackerId: string): TrackerState | undefined {
    return this.trackers.get(trackerId);
  }

  onTick(callback: (tick: Tick) => void): void {
    this.tickCallbacks.push(callback);
  }

  private simulateTick(): void {
    for (const [trackerId, tracker] of this.trackers) {
      if (tracker.paused) continue;

      // Simulate price change: random walk with threshold-based magnitude
      const volatilityFactor = tracker.threshold / 100;
      const changePercent = (Math.random() - 0.5) * 2 * volatilityFactor; // Range: -threshold% to +threshold%
      const change = tracker.currentValue * changePercent;
      const newValue = Math.max(1, tracker.currentValue + change); // Prevent negative prices

      const delta = newValue - tracker.currentValue;
      tracker.currentValue = newValue;

      // Maintain fixed-size buffer (60 most recent points)
      tracker.history.push(newValue);
      if (tracker.history.length > BUFFER_SIZE) {
        tracker.history.shift();
      }

      // Broadcast tick
      const tick: Tick = {
        id: randomUUID(),
        symbol: tracker.symbol,
        value: newValue,
        delta,
        timestamp: Date.now(),
      };

      this.tickCallbacks.forEach((callback) => callback(tick));
    }
  }
}
