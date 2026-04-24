// Mock quiz service for providing questions and categories

import { Question } from '../utils/helpers';

interface QuizQuestion extends Question {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuestionDatabase {
  [category: string]: QuizQuestion[];
}

const questionDatabase: QuestionDatabase = {
  Science: [
    {
      id: 1,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correct: 2,
      difficulty: "Easy"
    },
    {
      id: 2,
      question: "What planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 3,
      question: "What is the speed of light in vacuum?",
      options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
      correct: 0,
      difficulty: "Hard"
    },
    {
      id: 4,
      question: "What is the largest organ in the human body?",
      options: ["Heart", "Brain", "Liver", "Skin"],
      correct: 3,
      difficulty: "Easy"
    },
    {
      id: 5,
      question: "What gas do plants absorb from the atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correct: 2,
      difficulty: "Easy"
    }
  ],
  History: [
    {
      id: 6,
      question: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correct: 2,
      difficulty: "Easy"
    },
    {
      id: 7,
      question: "Who was the first President of the United States?",
      options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 8,
      question: "Which ancient wonder of the world still stands today?",
      options: ["Colossus of Rhodes", "Hanging Gardens", "Great Pyramid of Giza", "Lighthouse of Alexandria"],
      correct: 2,
      difficulty: "Medium"
    },
    {
      id: 9,
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct: 2,
      difficulty: "Easy"
    },
    {
      id: 10,
      question: "In which year did Christopher Columbus reach the Americas?",
      options: ["1490", "1491", "1492", "1493"],
      correct: 2,
      difficulty: "Easy"
    }
  ],
  Geography: [
    {
      id: 11,
      question: "What is the capital of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correct: 2,
      difficulty: "Easy"
    },
    {
      id: 12,
      question: "Which is the longest river in the world?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correct: 1,
      difficulty: "Medium"
    },
    {
      id: 13,
      question: "What is the smallest country in the world?",
      options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 14,
      question: "Which continent has the most countries?",
      options: ["Asia", "Africa", "Europe", "South America"],
      correct: 1,
      difficulty: "Medium"
    },
    {
      id: 15,
      question: "What is the deepest ocean trench?",
      options: ["Java Trench", "Mariana Trench", "Puerto Rico Trench", "Tonga Trench"],
      correct: 1,
      difficulty: "Hard"
    }
  ],
  Sports: [
    {
      id: 16,
      question: "How many players are on a basketball team?",
      options: ["4", "5", "6", "7"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 17,
      question: "In which sport would you perform a slam dunk?",
      options: ["Tennis", "Basketball", "Volleyball", "Baseball"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 18,
      question: "How often are the Olympic Games held?",
      options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"],
      correct: 2,
      difficulty: "Easy"
    },
    {
      id: 19,
      question: "What is the maximum score in ten-pin bowling?",
      options: ["200", "250", "300", "350"],
      correct: 2,
      difficulty: "Medium"
    },
    {
      id: 20,
      question: "Which country has won the most FIFA World Cups?",
      options: ["Germany", "Argentina", "Brazil", "Italy"],
      correct: 2,
      difficulty: "Medium"
    }
  ],
  Art: [
    {
      id: 21,
      question: "Who painted the Sistine Chapel ceiling?",
      options: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"],
      correct: 1,
      difficulty: "Medium"
    },
    {
      id: 22,
      question: "What artistic movement was Pablo Picasso a founder of?",
      options: ["Impressionism", "Surrealism", "Cubism", "Expressionism"],
      correct: 2,
      difficulty: "Medium"
    },
    {
      id: 23,
      question: "Which museum houses the Mona Lisa?",
      options: ["Uffizi Gallery", "Louvre Museum", "Prado Museum", "National Gallery"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 24,
      question: "Who sculpted the statue of David?",
      options: ["Michelangelo", "Donatello", "Bernini", "Rodin"],
      correct: 0,
      difficulty: "Medium"
    },
    {
      id: 25,
      question: "What is the primary color in Mondrian's famous abstract paintings?",
      options: ["Red", "Blue", "Yellow", "All of the above"],
      correct: 3,
      difficulty: "Medium"
    }
  ],
  Music: [
    {
      id: 26,
      question: "How many strings does a standard guitar have?",
      options: ["4", "5", "6", "7"],
      correct: 2,
      difficulty: "Easy"
    },
    {
      id: 27,
      question: "Who composed the Four Seasons?",
      options: ["Mozart", "Beethoven", "Bach", "Vivaldi"],
      correct: 3,
      difficulty: "Medium"
    },
    {
      id: 28,
      question: "What is the most common time signature in music?",
      options: ["2/4", "3/4", "4/4", "6/8"],
      correct: 2,
      difficulty: "Medium"
    },
    {
      id: 29,
      question: "Which instrument has 88 keys?",
      options: ["Organ", "Piano", "Harpsichord", "Synthesizer"],
      correct: 1,
      difficulty: "Easy"
    },
    {
      id: 30,
      question: "Who was known as the 'King of Pop'?",
      options: ["Elvis Presley", "Michael Jackson", "Prince", "Madonna"],
      correct: 1,
      difficulty: "Easy"
    }
  ]
};

export class QuizService {
  private static instance: QuizService;
  private usedQuestionIds: Set<number> = new Set();
  private currentRound: number = 1;

  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  // Reset used questions for a new game
  resetGame(): void {
    this.usedQuestionIds.clear();
    this.currentRound = 1;
  }

  // Set current round
  setCurrentRound(round: number): void {
    this.currentRound = round;
  }

  // Get unique sports question for rounds 1-5, random question for other rounds
  getQuestionForRound(round: number): QuizQuestion | null {
    this.setCurrentRound(round);
    
    // For rounds 1-5, get unique sports questions
    if (round >= 1 && round <= 5) {
      return this.getUniqueSportsQuestion();
    }
    
    // For other rounds, get random question from any category
    return this.getRandomQuestionNotUsed();
  }

  // Get unique sports question (not used before)
  private getUniqueSportsQuestion(): QuizQuestion | null {
    const sportsQuestions = questionDatabase['Sports'] || [];
    const availableSportsQuestions = sportsQuestions.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (availableSportsQuestions.length === 0) {
      // If all sports questions have been used, reset and start again
      this.usedQuestionIds.clear();
      const randomIndex = Math.floor(Math.random() * sportsQuestions.length);
      const question = sportsQuestions[randomIndex];
      this.usedQuestionIds.add(question.id);
      return question;
    }
    
    const randomIndex = Math.floor(Math.random() * availableSportsQuestions.length);
    const question = availableSportsQuestions[randomIndex];
    this.usedQuestionIds.add(question.id);
    return question;
  }

  // Get random question that hasn't been used
  private getRandomQuestionNotUsed(): QuizQuestion | null {
    const allQuestions: QuizQuestion[] = Object.values(questionDatabase).flat();
    const availableQuestions = allQuestions.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (availableQuestions.length === 0) {
      // If all questions have been used, reset and start again
      this.usedQuestionIds.clear();
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      const question = allQuestions[randomIndex];
      this.usedQuestionIds.add(question.id);
      return question;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    this.usedQuestionIds.add(question.id);
    return question;
  }

  // Get all available categories
  getCategories(): string[] {
    return Object.keys(questionDatabase);
  }

  // Get questions for a specific category
  getQuestionsByCategory(category: string, count: number = 5): QuizQuestion[] {
    const questions = questionDatabase[category] || [];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  // Get random questions from multiple categories
  getRandomQuestions(count: number = 5): QuizQuestion[] {
    const allQuestions: QuizQuestion[] = Object.values(questionDatabase).flat();
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allQuestions.length));
  }

  // Get questions by difficulty
  getQuestionsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard', count: number = 5): QuizQuestion[] {
    const allQuestions: QuizQuestion[] = Object.values(questionDatabase).flat();
    const filtered = allQuestions.filter(q => q.difficulty === difficulty);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, filtered.length));
  }

  // Get a single random question
  getRandomQuestion(): QuizQuestion | null {
    const allQuestions: QuizQuestion[] = Object.values(questionDatabase).flat();
    if (allQuestions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    return allQuestions[randomIndex];
  }

  // Validate answer
  validateAnswer(question: QuizQuestion, selectedAnswer: number): boolean {
    return selectedAnswer === question.correct;
  }

  // Get question by ID
  getQuestionById(id: number): QuizQuestion | null {
    const allQuestions: QuizQuestion[] = Object.values(questionDatabase).flat();
    return allQuestions.find(q => q.id === id) || null;
  }

  // Get category statistics
  getCategoryStats(category: string): { totalQuestions: number; difficulty: { Easy: number; Medium: number; Hard: number } } {
    const questions = questionDatabase[category] || [];
    const stats = {
      totalQuestions: questions.length,
      difficulty: {
        Easy: questions.filter(q => q.difficulty === 'Easy').length,
        Medium: questions.filter(q => q.difficulty === 'Medium').length,
        Hard: questions.filter(q => q.difficulty === 'Hard').length,
      }
    };
    return stats;
  }
}

// Export singleton instance
export const quizService = QuizService.getInstance();
