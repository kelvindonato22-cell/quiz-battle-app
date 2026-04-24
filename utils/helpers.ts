// Utility functions for the quiz battle app

export interface Category {
  name: string;
  questions: number;
  color: string;
}

export interface Question {
  question: string;
  options: string[];
  correct: number;
}

export interface UserStats {
  totalGames: number;
  won: boolean;
  score: number;
  streak: number;
  avgTime: number;
  categoryWins: number;
}

export interface AchievementRequirements {
  firstWin: { won: boolean; description: string };
  perfectGame: { score: number; description: string };
  streakMaster: { streak: number; description: string };
  speedDemon: { avgTime: number; description: string };
  quizMaster: { totalGames: number; description: string };
  categoryExpert: { categoryWins: number; description: string };
}

export interface DifficultySettings {
  easy: { timeLimit: number; pointMultiplier: number; name: string; color: string };
  medium: { timeLimit: number; pointMultiplier: number; name: string; color: string };
  hard: { timeLimit: number; pointMultiplier: number; name: string; color: string };
}

export const helpers = {
  // Format time remaining
  formatTime: (seconds: number): string => {
    if (seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // Calculate percentage
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  // Generate random number between min and max
  randomBetween: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Shuffle array
  shuffleArray: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Get color based on performance
  getPerformanceColor: (percentage: number): string => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  },

  // Get timer color based on time left
  getTimerColor: (timeLeft: number, totalTime: number): string => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 66) return '#10b981'; // green
    if (percentage > 33) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  },

  // Format date for display
  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Get difficulty settings
  getDifficultySettings: (): DifficultySettings => {
    const settings: DifficultySettings = {
      easy: {
        timeLimit: 45,
        pointMultiplier: 0.5,
        name: 'Easy',
        color: '#10b981',
      },
      medium: {
        timeLimit: 30,
        pointMultiplier: 1,
        name: 'Medium',
        color: '#f59e0b',
      },
      hard: {
        timeLimit: 20,
        pointMultiplier: 2,
        name: 'Hard',
        color: '#ef4444',
      },
    };
    
    return settings;
  },

  // Get achievement requirements
  getAchievementRequirements: (): AchievementRequirements => {
    return {
      firstWin: { won: true, description: 'Win your first quiz battle' },
      perfectGame: { score: 100, description: 'Score 100% in any category' },
      streakMaster: { streak: 5, description: 'Get 5 correct answers in a row' },
      speedDemon: { avgTime: 10, description: 'Answer questions in under 10 seconds on average' },
      quizMaster: { totalGames: 50, description: 'Complete 50 quiz battles' },
      categoryExpert: { categoryWins: 10, description: 'Win 10 battles in the same category' },
    };
  },

  // Check if achievement is unlocked
  checkAchievement: (achievementKey: keyof AchievementRequirements, userStats: UserStats): boolean => {
    const requirements = helpers.getAchievementRequirements();
    const requirement = requirements[achievementKey];
    
    if (!requirement) return false;
    
    return Object.entries(requirement).every(([key, value]) => {
      if (key === 'description') return true;
      return userStats[key as keyof UserStats] >= value;
    });
  },

  // Format large numbers
  formatNumber: (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Get random element from array
  getRandomElement: <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Clamp number between min and max
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => void>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
};
