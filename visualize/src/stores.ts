import { writable, readable, derived } from "svelte/store";
import type { Tick, TrackerUI, ConnectionStatus } from "./types.js";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

/**
 * Realtime WebSocket connection manager
 * Single connection handles all tracker updates
 */
function createWebSocketStore() {
  const { subscribe, set, update } = writable<ConnectionStatus>({
    status: "DISCONNECTED",
  });

  let ws: WebSocket | null = null;
  let reconnectDelay = RECONNECT_DELAY;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  const messageHandlers = new Set<(message: any) => void>();

  function connect() {
    if (ws?.readyState === WebSocket.OPEN) return;

    set({ status: "RECONNECTING" });

    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      set({ status: "CONNECTED" });
      reconnectDelay = RECONNECT_DELAY;
      console.log("[WS] Connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error("[WS] Message parse error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[WS] Error:", error);
      set({ status: "DISCONNECTED" });
    };

    ws.onclose = () => {
      set({ status: "DISCONNECTED" });
      console.log("[WS] Disconnected, reconnecting...");

      // Exponential backoff reconnection
      reconnectTimeout = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
        connect();
      }, reconnectDelay);
    };
  }

  function send(message: any) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn("[WS] Cannot send: connection not open");
    }
  }

  function onMessage(handler: (message: any) => void) {
    messageHandlers.add(handler);
    return () => messageHandlers.delete(handler);
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    set({ status: "DISCONNECTED" });
  }

  // Auto-connect on initialization
  connect();

  return {
    subscribe,
    send,
    onMessage,
    disconnect,
  };
}

/**
 * Tracker state management
 */
function createTrackerStore() {
  const { subscribe, set, update } = writable<Map<string, TrackerUI>>(
    new Map(),
  );

  function addTracker(tracker: TrackerUI) {
    update((trackers) => {
      const newMap = new Map(trackers);
      newMap.set(tracker.id, tracker);
      return newMap;
    });
  }

  function updateTracker(tick: Tick) {
    update((trackers) => {
      const tracker = trackers.get(tick.symbol);

      if (!tracker) {
        // New tracker from server
        const newTracker: TrackerUI = {
          id: tick.id,
          symbol: tick.symbol,
          threshold: 0,
          currentValue: tick.value,
          previousValue: tick.value,
          paused: false,
          history: [tick.value],
        };
        trackers.set(tick.symbol, newTracker);
        return new Map(trackers);
      }

      const updated = { ...tracker };
      updated.previousValue = updated.currentValue;
      updated.currentValue = tick.value;
      updated.history.push(tick.value);

      // Maintain fixed buffer
      if (updated.history.length > 60) {
        updated.history.shift();
      }

      trackers.set(tick.symbol, updated);
      return new Map(trackers);
    });
  }

  function removeTracker(trackerId: string) {
    update((trackers) => {
      const newMap = new Map(trackers);
      newMap.delete(trackerId);
      return newMap;
    });
  }

  function pauseTracker(trackerId: string) {
    update((trackers) => {
      const tracker = Array.from(trackers.values()).find(
        (t) => t.id === trackerId,
      );
      if (tracker) {
        tracker.paused = true;
        trackers.set(tracker.symbol, tracker);
      }
      return new Map(trackers);
    });
  }

  function resumeTracker(trackerId: string) {
    update((trackers) => {
      const tracker = Array.from(trackers.values()).find(
        (t) => t.id === trackerId,
      );
      if (tracker) {
        tracker.paused = false;
        trackers.set(tracker.symbol, tracker);
      }
      return new Map(trackers);
    });
  }

  return {
    subscribe,
    addTracker,
    updateTracker,
    removeTracker,
    pauseTracker,
    resumeTracker,
  };
}

export const wsConnection = createWebSocketStore();
export const trackerStore = createTrackerStore();
