import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SimulationEngine } from "./simulation.js";

describe("SimulationEngine", () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  afterEach(() => {
    engine.stop();
  });

  describe("createTracker", () => {
    it("should create a tracker with initial price 100", () => {
      const tracker = engine.createTracker("TATA", 50);

      expect(tracker.symbol).toBe("TATA");
      expect(tracker.threshold).toBe(50);
      expect(tracker.currentValue).toBe(100);
      expect(tracker.paused).toBe(false);
      expect(tracker.history).toContain(100);
    });

    it("should reject duplicate symbols", () => {
      engine.createTracker("INFY", 30);

      expect(() => {
        engine.createTracker("INFY", 40);
      }).toThrow("Symbol already tracked");
    });

    it("should generate unique IDs", () => {
      const tracker1 = engine.createTracker("BTC", 20);
      const tracker2 = engine.createTracker("ETH", 20);

      expect(tracker1.id).not.toBe(tracker2.id);
    });
  });

  describe("pauseTracker", () => {
    it("should pause an active tracker", () => {
      const tracker = engine.createTracker("AAPL", 25);
      engine.pauseTracker(tracker.id);

      const paused = engine.getTracker(tracker.id);
      expect(paused?.paused).toBe(true);
    });

    it("should throw error for non-existent tracker", () => {
      expect(() => {
        engine.pauseTracker("non-existent-id");
      }).toThrow();
    });
  });

  describe("resumeTracker", () => {
    it("should resume a paused tracker", () => {
      const tracker = engine.createTracker("MSFT", 35);
      engine.pauseTracker(tracker.id);
      engine.resumeTracker(tracker.id);

      const resumed = engine.getTracker(tracker.id);
      expect(resumed?.paused).toBe(false);
    });
  });

  describe("removeTracker", () => {
    it("should remove a tracker from simulation", () => {
      const tracker = engine.createTracker("GOOGL", 40);
      engine.removeTracker(tracker.id);

      expect(engine.getTracker(tracker.id)).toBeUndefined();
    });
  });

  describe("getAllTrackers", () => {
    it("should return all active trackers", () => {
      engine.createTracker("TATA", 20);
      engine.createTracker("INFY", 30);
      engine.createTracker("BTC", 50);

      const trackers = engine.getAllTrackers();
      expect(trackers).toHaveLength(3);
    });
  });

  describe("buffer management", () => {
    it("should maintain fixed buffer size of 60 points", async () => {
      const tracker = engine.createTracker("TEST", 10);

      // Simulate adding 100 points manually
      for (let i = 0; i < 100; i++) {
        const t = engine.getTracker(tracker.id)!;
        t.history.push(100 + i);
        if (t.history.length > 60) {
          t.history.shift();
        }
      }

      const final = engine.getTracker(tracker.id)!;
      expect(final.history).toHaveLength(60);
      expect(final.history[0]).toBe(40); // First point should be 100 + 40
      expect(final.history[59]).toBe(99); // Last point should be 100 + 99
    });
  });
});
