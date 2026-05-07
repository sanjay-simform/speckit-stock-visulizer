import WebSocket from 'ws';
import { SimulationEngine } from './simulation.js';
import { 
  ServerMessage, 
  ClientMessage, 
  CreateTrackerMessage, 
  PauseTrackerMessage,
  ResumeTrackerMessage,
  RemoveTrackerMessage,
  ErrorMessage,
  ConnectionStatusMessage,
  TickMessage
} from './types.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_TIMEOUT = 5000;

/**
 * WebSocket server managing realtime connections and message routing
 */
export class WebSocketServer {
  private wss: WebSocket.Server;
  private engine: SimulationEngine;
  private clients: Set<WebSocket> = new Set();

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.engine = new SimulationEngine();

    this.setupServer();
    this.setupSimulation();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WS] Client connected');
      this.clients.add(ws);

      // Send connection status
      this.sendToClient(ws, {
        type: 'CONNECTION_STATUS',
        payload: { status: 'CONNECTED' },
      });

      // Send current tracker state to new client
      const trackers = this.engine.getAllTrackers();
      trackers.forEach(tracker => {
        // Send initial state as tick
        const latestValue = tracker.history[tracker.history.length - 1] || tracker.currentValue;
        this.sendToClient(ws, {
          type: 'TICK',
          payload: {
            id: `init-${tracker.id}`,
            symbol: tracker.symbol,
            value: latestValue,
            delta: 0,
            timestamp: tracker.createdAt,
          },
        });
      });

      // Handle messages from client
      ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        console.log('[WS] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[WS] Client error:', error.message);
        this.clients.delete(ws);
      });

      // Heartbeat to detect stale connections
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });

    // Heartbeat interval
    setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, HEARTBEAT_INTERVAL);
  }

  private setupSimulation(): void {
    this.engine.onTick((tick) => {
      const message: TickMessage = {
        type: 'TICK',
        payload: tick,
      };
      this.broadcast(message);
    });

    this.engine.start();
  }

  private handleMessage(ws: WebSocket, data: WebSocket.Data): void {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'CREATE_TRACKER':
          this.handleCreateTracker(ws, message);
          break;
        case 'PAUSE_TRACKER':
          this.handlePauseTracker(ws, message);
          break;
        case 'RESUME_TRACKER':
          this.handleResumeTracker(ws, message);
          break;
        case 'REMOVE_TRACKER':
          this.handleRemoveTracker(ws, message);
          break;
        default:
          this.sendError(ws, 'INVALID_MESSAGE', 'Unknown message type');
      }
    } catch (error) {
      const err = error as Error;
      console.error('[WS] Message handling error:', err.message);
      this.sendError(ws, 'PARSE_ERROR', 'Failed to parse message');
    }
  }

  private handleCreateTracker(ws: WebSocket, message: CreateTrackerMessage): void {
    try {
      const { symbol, threshold } = message.payload;

      // Validate
      if (!symbol || symbol.trim().length === 0) {
        this.sendError(ws, 'INVALID_SYMBOL', 'Symbol cannot be empty');
        return;
      }

      if (threshold < 0 || threshold > 100) {
        this.sendError(ws, 'INVALID_THRESHOLD', 'Threshold must be between 0 and 100');
        return;
      }

      const tracker = this.engine.createTracker(symbol, threshold);

      // Broadcast new tracker state to all clients
      const tick: TickMessage = {
        type: 'TICK',
        payload: {
          id: `init-${tracker.id}`,
          symbol: tracker.symbol,
          value: tracker.currentValue,
          delta: 0,
          timestamp: tracker.createdAt,
        },
      };

      this.broadcast(tick);
    } catch (error) {
      const err = error as Error;
      this.sendError(ws, 'CREATE_TRACKER_FAILED', err.message);
    }
  }

  private handlePauseTracker(ws: WebSocket, message: PauseTrackerMessage): void {
    try {
      const { trackerId } = message.payload;
      this.engine.pauseTracker(trackerId);
    } catch (error) {
      const err = error as Error;
      this.sendError(ws, 'PAUSE_FAILED', err.message);
    }
  }

  private handleResumeTracker(ws: WebSocket, message: ResumeTrackerMessage): void {
    try {
      const { trackerId } = message.payload;
      this.engine.resumeTracker(trackerId);
    } catch (error) {
      const err = error as Error;
      this.sendError(ws, 'RESUME_FAILED', err.message);
    }
  }

  private handleRemoveTracker(ws: WebSocket, message: RemoveTrackerMessage): void {
    try {
      const { trackerId } = message.payload;
      this.engine.removeTracker(trackerId);
      
      // Notify all clients that tracker was removed
      const errorMsg: ErrorMessage = {
        type: 'ERROR',
        payload: {
          code: 'TRACKER_REMOVED',
          message: `Tracker ${trackerId} has been removed`,
        },
      };
      this.broadcast(errorMsg);
    } catch (error) {
      const err = error as Error;
      this.sendError(ws, 'REMOVE_FAILED', err.message);
    }
  }

  private broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  private sendToClient(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, code: string, message: string): void {
    this.sendToClient(ws, {
      type: 'ERROR',
      payload: { code, message },
    });
  }

  start(): void {
    console.log(`[Server] WebSocket server listening on ws://localhost:${PORT}`);
  }
}

// Start server
const server = new WebSocketServer(PORT);
server.start();
