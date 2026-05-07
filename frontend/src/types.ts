/**
 * Frontend types matching backend message contracts
 */

export interface Tick {
  id: string;
  symbol: string;
  value: number;
  delta: number;
  timestamp: number;
}

export interface TrackerUI {
  id: string;
  symbol: string;
  threshold: number;
  currentValue: number;
  paused: boolean;
  history: number[];
  previousValue: number;
}

export interface ConnectionStatus {
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
}
