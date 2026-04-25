// Finite State Machine for Quiz Battle Game Flow

export type GameState = 'LOBBY' | 'MATCH_FOUND' | 'START_GAME' | 'ROUND_START' | 'QUESTION_ACTIVE' | 'ANSWER_SUBMITTED' | 'ROUND_RESULT' | 'GAME_OVER';

export interface GameEvent {
  type: string;
  payload?: any;
}


export interface GameStateContext {
  players: any[];
  currentPlayer: any;
  opponent: any;
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  question: any;
  lifelineUsed: boolean;
  winner: any;
  matchResult: any;
  streakBonus: number;
  lifelinePenalty: boolean;
  gameCount: number;
  currentPlayerWins: number;
  opponentWins: number;
  seriesWinner: any;
}

export class QuizBattleFSM {
  private currentState: GameState;
  private context: GameStateContext;
  private listeners: Map<GameState, Set<(context: GameStateContext) => void>>;

  constructor() {
    this.currentState = 'LOBBY';
    this.context = {
      players: [],
      currentPlayer: null,
      opponent: null,
      currentRound: 1,
      totalRounds: 5,
      timeLeft: 30,
      question: null,
      lifelineUsed: false,
      winner: null,
      matchResult: null,
      streakBonus: 0,
      lifelinePenalty: false,
      gameCount: 1,
      currentPlayerWins: 0,
      opponentWins: 0,
      seriesWinner: null
    };
    this.listeners = new Map();
  }

  // Get current state
  getState(): GameState {
    return this.currentState;
  }

  // Get current context
  getContext(): GameStateContext {
    return { ...this.context };
  }

  // Subscribe to state changes
  subscribe(state: GameState, callback: (context: GameStateContext) => void): () => void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, new Set());
    }
    this.listeners.get(state)!.add(callback);
    
    return () => {
      this.listeners.get(state)?.delete(callback);
    };
  }

  // Transition to new state
  private transition(newState: GameState, newContext: Partial<GameStateContext> = {}): void {
    this.currentState = newState;
    this.context = { ...this.context, ...newContext };
    
    // Notify listeners
    const stateListeners = this.listeners.get(newState);
    if (stateListeners) {
      stateListeners.forEach(callback => callback(this.context));
    }
  }

  // Handle state transitions
  handleEvent(event: GameEvent): void {
    const { type, payload } = event;

    switch (this.currentState) {
      case 'LOBBY':
        if (type === 'START_MATCHMAKING') {
          this.transition('MATCH_FOUND', {
            players: payload?.players || []
          });
        }
        break;

      case 'MATCH_FOUND':
        if (type === 'START_GAME') {
          this.transition('START_GAME', {
            currentPlayer: payload?.players?.[0],
            opponent: payload?.players?.[1],
            currentRound: 1
          });
        }
        break;

      case 'START_GAME':
        if (type === 'BEGIN_ROUND') {
          this.transition('ROUND_START', {
            roundState: 'QUESTION'
          });
        }
        break;

      case 'ROUND_START':
        if (type === 'SHOW_QUESTION') {
          this.transition('QUESTION_ACTIVE', {
            question: payload?.question,
            timeLeft: 30,
            lifelineUsed: false
          });
        }
        break;

      case 'QUESTION_ACTIVE':
        if (type === 'SUBMIT_ANSWER') {
          this.transition('ANSWER_SUBMITTED', {
            lastAnswer: payload?.answer,
            timeUsed: payload?.timeUsed
          });
        } else if (type === 'TIME_UP') {
          this.transition('ANSWER_SUBMITTED', {
            lastAnswer: null,
            timeUsed: 30
          });
        }
        break;

      case 'ANSWER_SUBMITTED':
        if (type === 'PROCESS_RESULT') {
          this.transition('ROUND_RESULT', {
            roundScores: payload?.roundScores
          });
        }
        break;

      case 'ROUND_RESULT':
        if (type === 'NEXT_ROUND') {
          const nextRound = this.context.currentRound + 1;
          if (nextRound <= this.context.totalRounds) {
            this.transition('ROUND_START', {
              currentRound: nextRound
            });
          } else {
            this.transition('GAME_OVER', {
              winner: payload?.winner
            });
            // Update series result immediately when game ends
            this.updateSeriesResult(payload?.winner);
          }
        } else if (type === 'GAME_OVER') {
          this.transition('GAME_OVER', {
            winner: payload?.winner
          });
          // Update series result immediately when game ends
          this.updateSeriesResult(payload?.winner);
        }
        break;

      case 'GAME_OVER':
        if (type === 'PLAY_AGAIN') {
          if (this.canPlayAgain()) {
            this.prepareNextGame();
            this.transition('START_GAME');
          } else {
            // Series is over, transition to lobby
            this.transition('LOBBY');
          }
        } else if (type === 'RESET_SERIES') {
          this.resetSeries();
          this.transition('LOBBY');
        }
        break;
    }
  }

  // Scoring calculation method
  calculateScore(isCorrect: boolean, timeUsed: number, streak: number, lifelineUsed: boolean): number {
    let points = 0;
    
    if (isCorrect) {
      // Base points
      points = 100;
      
      // Time bonus (max 60 points for instant answer)
      const timeBonus = Math.max(0, (30 - timeUsed) * 2);
      points += timeBonus;
      
      // Streak bonus (10 points per streak)
      const streakBonus = streak * 10;
      points += streakBonus;
      
      // Lifeline penalty - halves the points
      if (lifelineUsed) {
        points = Math.floor(points / 2);
      }
    }
    
    return points;
  }

  // Utility methods
  canUseLifeline(): boolean {
    return this.currentState === 'QUESTION_ACTIVE' && 
           !this.context.lifelineUsed;
  }

  isGameOver(): boolean {
    return this.currentState === 'GAME_OVER';
  }

  getCurrentRound(): number {
    return this.context.currentRound;
  }

  getTotalRounds(): number {
    return this.context.totalRounds;
  }

  // Series management methods
  updateSeriesResult(winner: any): void {
    if (winner?.id === 'current') {
      this.context.currentPlayerWins++;
    } else if (winner) {
      this.context.opponentWins++;
    }

    // Check if series is over
    if (this.context.currentPlayerWins >= 2 || this.context.opponentWins >= 2) {
      this.context.seriesWinner = this.context.currentPlayerWins >= 2 ? this.context.currentPlayer : this.context.opponent;
    }
  }

  canPlayAgain(): boolean {
    // Can play again if:
    // 1. No one has lost 2 games yet
    // 2. Haven't reached max 3 games
    // 3. If tied after 2 games, can play 3rd game
    return this.context.gameCount < 3 && 
           this.context.currentPlayerWins < 2 && 
           this.context.opponentWins < 2;
  }

  isSeriesOver(): boolean {
    return this.context.seriesWinner !== null || this.context.gameCount >= 3;
  }

  getSeriesStatus(): { gameCount: number; currentPlayerWins: number; opponentWins: number; seriesWinner: any; canPlayAgain: boolean } {
    return {
      gameCount: this.context.gameCount,
      currentPlayerWins: this.context.currentPlayerWins,
      opponentWins: this.context.opponentWins,
      seriesWinner: this.context.seriesWinner,
      canPlayAgain: this.canPlayAgain()
    };
  }

  prepareNextGame(): void {
    this.context.gameCount++;
    this.context.currentRound = 1;
    this.context.winner = null;
    this.context.matchResult = null;
    this.context.question = null;
    this.context.lifelineUsed = false;
    this.context.timeLeft = 30;
  }

  resetSeries(): void {
    this.context.gameCount = 1;
    this.context.currentPlayerWins = 0;
    this.context.opponentWins = 0;
    this.context.seriesWinner = null;
  }

  reset(): void {
    this.currentState = 'LOBBY';
    this.context = {
      players: [],
      currentPlayer: null,
      opponent: null,
      currentRound: 1,
      totalRounds: 5,
      timeLeft: 30,
      question: null,
      lifelineUsed: false,
      winner: null,
      matchResult: null,
      streakBonus: 0,
      lifelinePenalty: false,
      gameCount: 1,
      currentPlayerWins: 0,
      opponentWins: 0,
      seriesWinner: null
    };
  }
}
