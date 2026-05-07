/**
 * Core types for PulseTick realtime tracker system
 * Message contracts validated on both client and server
 */

export interface Tick {
  id: string;
  symbol: string;
  value: number;
  delta: number;
  timestamp: number;
}

export interface TrackerState {
  id: string;
  symbol: string;
  threshold: number;
  currentValue: number;
  paused: boolean;
  history: number[];
  createdAt: number;
}

export interface Point {
  x: number;
  y: number;
  delta: number;
}

// WebSocket message contracts
export interface CreateTrackerMessage {
  type: 'CREATE_TRACKER';
  payload: {
    symbol: string;
    threshold: number;
  };
}

export interface TickMessage {
  type: 'TICK';
  payload: Tick;
}

export interface PauseTrackerMessage {
  type: 'PAUSE_TRACKER';
  payload: {
    trackerId: string;
  };
}

export interface ResumeTrackerMessage {
  type: 'RESUME_TRACKER';
  payload: {
    trackerId: string;
  };
}

export interface RemoveTrackerMessage {
  type: 'REMOVE_TRACKER';
  payload: {
    trackerId: string;
  };
}

export interface ConnectionStatusMessage {
  type: 'CONNECTION_STATUS';
  payload: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  };
}

export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    code: string;
    message: string;
  };
}

export type ServerMessage = TickMessage | ConnectionStatusMessage | ErrorMessage;
export type ClientMessage = CreateTrackerMessage | PauseTrackerMessage | ResumeTrackerMessage | RemoveTrackerMessage;
