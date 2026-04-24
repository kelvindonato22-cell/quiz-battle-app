// Real-time matchmaking system with socket simulation

import { Player, EloSystem } from './elo';

export interface MatchmakingOptions {
  currentPlayer: Player;
  players: Player[];
  onMatchFound: (opponent: Player) => void;
  onSearchStart: () => void;
  onSearchCancel: () => void;
  onStatusUpdate: (status: string) => void;
}

export interface MatchmakingResult {
  success: boolean;
  opponent?: Player;
  reason?: string;
}

export class MatchmakingService {
  private static instance: MatchmakingService;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private isSearching: boolean = false;

  static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  // Simulate real-time matchmaking with skill-based matching
  async findMatch(options: MatchmakingOptions): Promise<MatchmakingResult> {
    const { currentPlayer, players, onMatchFound, onSearchStart, onSearchCancel, onStatusUpdate } = options;

    if (this.isSearching) {
      return { success: false, reason: 'Already searching for match' };
    }

    this.isSearching = true;
    onSearchStart();
    onStatusUpdate('Searching for worthy opponent...');

    try {
      // Simulate socket connection and matchmaking
      const result = await this.simulateMatchmaking(currentPlayer, players, onStatusUpdate);
      
      if (result.success && result.opponent) {
        onMatchFound(result.opponent);
        onStatusUpdate('Match found! Starting game...');
        
        // Auto-start game after 1 second
        setTimeout(() => {
          onStatusUpdate('Game starting...');
        }, 1000);
      } else {
        onStatusUpdate(result.reason || 'No suitable opponent found');
        onSearchCancel();
      }
      
      return result;
    } finally {
      this.isSearching = false;
    }
  }

  // Cancel current search
  cancelSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.isSearching = false;
  }

  // Simulate real-time matchmaking process
  private async simulateMatchmaking(
    currentPlayer: Player,
    allPlayers: Player[],
    onStatusUpdate: (status: string) => void
  ): Promise<MatchmakingResult> {
    return new Promise((resolve) => {
      // Filter out current player and get available opponents
      const availablePlayers = allPlayers.filter(p => p.id !== currentPlayer.id);
      
      if (availablePlayers.length === 0) {
        resolve({ success: false, reason: 'No other players available' });
        return;
      }

      // Simulate different search phases
      let phase = 0;
      const phases = [
        'Connecting to matchmaking server...',
        'Finding players in your skill range...',
        'Evaluating potential opponents...',
        'Calculating match quality...',
        'Finalizing match...'
      ];

      const phaseInterval = setInterval(() => {
        if (phase < phases.length) {
          onStatusUpdate(phases[phase]);
          phase++;
        } else {
          clearInterval(phaseInterval);
        }
      }, 800);

      // Simulate matchmaking delay (2-4 seconds)
      const searchDelay = 2000 + Math.random() * 2000;
      
      this.searchTimeout = setTimeout(() => {
        clearInterval(phaseInterval);
        
        // Find best match based on ELO rating
        const opponent = this.findBestMatch(currentPlayer, availablePlayers);
        
        if (opponent) {
          resolve({ success: true, opponent });
        } else {
          resolve({ success: false, reason: 'Unable to find suitable opponent' });
        }
      }, searchDelay);
    });
  }

  // Find best match based on ELO rating (skill-based matchmaking)
  private findBestMatch(currentPlayer: Player, availablePlayers: Player[]): Player | null {
    if (availablePlayers.length === 0) return null;

    // Sort by ELO proximity (prefer closer ratings)
    const sortedByElo = availablePlayers
      .map(player => ({
        player,
        eloDifference: Math.abs(player.rating - currentPlayer.rating)
      }))
      .sort((a, b) => a.eloDifference - b.eloDifference);

    // Add some randomness to avoid always matching same person
    const topCandidates = sortedByElo.slice(0, Math.min(3, sortedByElo.length));
    const selectedCandidate = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    
    return selectedCandidate.player;
  }

  // Get matchmaking statistics
  getMatchmakingStats(currentPlayer: Player, allPlayers: Player[]): {
    totalPlayers: number;
    availableOpponents: number;
    avgWaitTime: number;
    skillRange: { min: number; max: number };
  } {
    const availablePlayers = allPlayers.filter(p => p.id !== currentPlayer.id);
    const ratings = availablePlayers.map(p => p.rating);
    
    return {
      totalPlayers: allPlayers.length,
      availableOpponents: availablePlayers.length,
      avgWaitTime: 3.2, // Simulated average wait time
      skillRange: {
        min: ratings.length > 0 ? Math.min(...ratings) : 0,
        max: ratings.length > 0 ? Math.max(...ratings) : 0
      }
    };
  }

  // Simulate real-time connection status
  getConnectionStatus(): {
    connected: boolean;
    latency: number;
    serverLoad: 'low' | 'medium' | 'high';
  } {
    return {
      connected: true,
      latency: 45 + Math.random() * 30, // 45-75ms ping
      serverLoad: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
    };
  }
}

// WebSocket simulation for real-time features
export class SocketSimulation {
  private static instance: SocketSimulation;
  private listeners: Map<string, Set<Function>> = new Map();
  private connected: boolean = false;

  static getInstance(): SocketSimulation {
    if (!SocketSimulation.instance) {
      SocketSimulation.instance = new SocketSimulation();
    }
    return SocketSimulation.instance;
  }

  // Simulate socket connection
  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        this.emit('connected', { status: 'connected' });
        resolve();
      }, 500);
    });
  }

  // Simulate socket disconnection
  disconnect(): void {
    this.connected = false;
    this.emit('disconnected', { status: 'disconnected' });
  }

  // Subscribe to events
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Emit events
  emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Simulate matchmaking request
  requestMatch(playerData: any): void {
    if (!this.connected) return;
    
    // Simulate server processing
    setTimeout(() => {
      this.emit('matchSearching', { status: 'searching' });
    }, 100);
  }

  // Simulate match found
  simulateMatchFound(matchData: any): void {
    this.emit('matchFound', matchData);
  }

  // Get connection info
  isConnected(): boolean {
    return this.connected;
  }
}
