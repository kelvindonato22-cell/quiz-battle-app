import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameScore {
  category: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  timestamp: number;
}

export interface UserProgress {
  totalGames: number;
  highScores: { [category: string]: number };
  achievements: string[];
  lastPlayed: number;
}

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Save game score
  async saveScore(score: GameScore): Promise<void> {
    try {
      const existingScores = await this.loadScores();
      existingScores.push(score);
      
      // Keep only last 100 scores
      const limitedScores = existingScores.slice(-100);
      
      await AsyncStorage.setItem('gameScores', JSON.stringify(limitedScores));
    } catch (error) {
      console.error('Error saving score:', error);
      throw error;
    }
  }

  // Load all scores
  async loadScores(): Promise<GameScore[]> {
    try {
      const data = await AsyncStorage.getItem('gameScores');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading scores:', error);
      return [];
    }
  }

  // Save user progress
  async saveProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem('userProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  // Load user progress
  async loadProgress(): Promise<UserProgress | null> {
    try {
      const data = await AsyncStorage.getItem('userProgress');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  }

  // Get high score for category
  async getHighScore(category: string): Promise<number> {
    try {
      const scores = await this.loadScores();
      const categoryScores = scores.filter(score => score.category === category);
      return categoryScores.length > 0 ? Math.max(...categoryScores.map(s => s.score)) : 0;
    } catch (error) {
      console.error('Error getting high score:', error);
      return 0;
    }
  }

  // Get statistics
  async getStatistics(): Promise<{
    totalGames: number;
    averageScore: number;
    bestCategory: string;
    totalPlayTime: number;
  }> {
    try {
      const scores = await this.loadScores();
      if (scores.length === 0) {
        return {
          totalGames: 0,
          averageScore: 0,
          bestCategory: '',
          totalPlayTime: 0
        };
      }

      const totalGames = scores.length;
      const averageScore = Math.round(scores.reduce((sum, score) => sum + score.score, 0) / totalGames);
      const totalPlayTime = scores.reduce((sum, score) => sum + score.timeTaken, 0);

      // Find best category
      const categoryScores: { [category: string]: number[] } = {};
      scores.forEach(score => {
        if (!categoryScores[score.category]) {
          categoryScores[score.category] = [];
        }
        categoryScores[score.category].push(score.score);
      });

      let bestCategory = '';
      let bestAverage = 0;
      Object.entries(categoryScores).forEach(([category, scores]) => {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (average > bestAverage) {
          bestAverage = average;
          bestCategory = category;
        }
      });

      return {
        totalGames,
        averageScore,
        bestCategory,
        totalPlayTime
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalGames: 0,
        averageScore: 0,
        bestCategory: '',
        totalPlayTime: 0
      };
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['gameScores', 'userProgress']);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Export data for backup
  async exportData(): Promise<{
    scores: GameScore[];
    progress: UserProgress | null;
  }> {
    try {
      const scores = await this.loadScores();
      const progress = await this.loadProgress();
      return { scores, progress };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import data from backup
  async importData(data: {
    scores: GameScore[];
    progress: UserProgress | null;
  }): Promise<void> {
    try {
      if (data.scores) {
        await AsyncStorage.setItem('gameScores', JSON.stringify(data.scores));
      }
      if (data.progress) {
        await AsyncStorage.setItem('userProgress', JSON.stringify(data.progress));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Export singleton instance and convenience functions
export const storageService = StorageService.getInstance();

// Legacy functions for backward compatibility
export async function saveScore(score: GameScore): Promise<void> {
  return storageService.saveScore(score);
}

export async function loadScore(): Promise<GameScore[]> {
  return storageService.loadScores();
}
