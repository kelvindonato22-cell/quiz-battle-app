// ELO Rating System for Quiz Battle

export interface Player {
  id: string;
  name: string;
  rating: number;
  streak: number;
  score: number;
  isReady: boolean;
}

export interface MatchResult {
  winner: Player;
  loser: Player;
  scoreDifference: number;
  ratingChange: number;
}

export class EloSystem {
  private static readonly K_FACTOR = 32;
  private static readonly DEFAULT_RATING = 1200;

  // Calculate expected score for player A against player B
  static calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  // Calculate new rating after a match
  static calculateNewRating(
    playerRating: number,
    opponentRating: number,
    actualScore: number,
    kFactor: number = EloSystem.K_FACTOR
  ): number {
    const expectedScore = this.calculateExpectedScore(playerRating, opponentRating);
    return Math.round(playerRating + kFactor * (actualScore - expectedScore));
  }

  // Process a match and return rating changes
  static processMatch(winner: Player, loser: Player): MatchResult {
    const winnerExpectedScore = this.calculateExpectedScore(winner.rating, loser.rating);
    const loserExpectedScore = this.calculateExpectedScore(loser.rating, winner.rating);

    const winnerNewRating = this.calculateNewRating(winner.rating, loser.rating, 1);
    const loserNewRating = this.calculateNewRating(loser.rating, winner.rating, 0);

    const ratingChange = winnerNewRating - winner.rating;

    // Update player ratings
    winner.rating = winnerNewRating;
    loser.rating = loserNewRating;

    return {
      winner,
      loser,
      scoreDifference: winner.score - loser.score,
      ratingChange
    };
  }

  // Get rating tier and color
  static getRatingTier(rating: number): { tier: string; color: string; description: string } {
    if (rating >= 2000) {
      return {
        tier: 'Grandmaster',
        color: '#FF6B6B',
        description: 'Elite quiz master'
      };
    } else if (rating >= 1800) {
      return {
        tier: 'Master',
        color: '#4ECDC4',
        description: 'Expert level'
      };
    } else if (rating >= 1600) {
      return {
        tier: 'Diamond',
        color: '#45B7D1',
        description: 'Advanced player'
      };
    } else if (rating >= 1400) {
      return {
        tier: 'Platinum',
        color: '#96CEB4',
        description: 'Skilled player'
      };
    } else if (rating >= 1200) {
      return {
        tier: 'Gold',
        color: '#FFEAA7',
        description: 'Above average'
      };
    } else if (rating >= 1000) {
      return {
        tier: 'Silver',
        color: '#DFE6E9',
        description: 'Average player'
      };
    } else {
      return {
        tier: 'Bronze',
        color: '#CD7F32',
        description: 'Beginner'
      };
    }
  }

  // Initialize new player
  static createPlayer(id: string, name: string): Player {
    return {
      id,
      name,
      rating: EloSystem.DEFAULT_RATING,
      streak: 0,
      score: 0,
      isReady: false
    };
  }
}
