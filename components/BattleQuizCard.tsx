import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface BattleQuizCardProps {
  question: Question | null;
  onAnswer: (index: number, timeUsed: number) => void;
  timeLeft: number;
  lifelineUsed: boolean;
  onUseLifeline: () => void;
  eliminatedOptions: number[];
  showCorrection: boolean;
  correctAnswer: number | undefined;
  selectedAnswer: number | undefined;
  currentStreak: number;
}

export default function BattleQuizCard({
  question,
  onAnswer,
  timeLeft,
  lifelineUsed,
  onUseLifeline,
  eliminatedOptions,
  showCorrection,
  correctAnswer,
  selectedAnswer,
  currentStreak
}: BattleQuizCardProps) {
  const [fadeAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (showCorrection) {
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showCorrection]);

  const getTimerColor = () => {
    const percentage = (timeLeft / 30) * 100;
    if (percentage > 66) return '#10b981';
    if (percentage > 33) return '#f59e0b';
    return '#ef4444';
  };

  const handleOptionPress = (index: number) => {
    if (!showCorrection) {
      const timeUsed = 30 - timeLeft;
      onAnswer(index, timeUsed);
    }
  };

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Timer and Stats */}
      <View style={styles.timerContainer}>
        <View style={styles.timer}>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.streakText}>Streak: {currentStreak}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Lifeline Button */}
      {!lifelineUsed && !showCorrection && (
        <TouchableOpacity style={styles.lifelineButton} onPress={onUseLifeline}>
          <Text style={styles.lifelineText}>💡 50:50 (Points Halved)</Text>
        </TouchableOpacity>
      )}

      {/* Options */}
      <ScrollView 
        style={styles.optionsScrollContainer}
        contentContainerStyle={styles.optionsContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {question.options.map((option, index) => {
          const isEliminated = eliminatedOptions.includes(index);
          const isSelected = selectedAnswer === index;
          const isCorrect = correctAnswer === index;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isEliminated && styles.eliminatedOption,
                isSelected && styles.selectedOption,
                showCorrection && isCorrect && styles.correctOption,
                showCorrection && isSelected && !isCorrect && styles.wrongOption
              ]}
              onPress={() => handleOptionPress(index)}
              disabled={isEliminated || showCorrection}
            >
              <Text style={[
                styles.optionText,
                isEliminated && styles.eliminatedText,
                showCorrection && isCorrect && styles.correctText,
                showCorrection && isSelected && !isCorrect && styles.wrongText
              ]}>
                {option}
              </Text>
              {showCorrection && isCorrect && (
                <Text style={styles.correctIcon}>✓</Text>
              )}
              {showCorrection && isSelected && !isCorrect && (
                <Text style={styles.wrongIcon}>✗</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Correction Display */}
      {showCorrection && (
        <View style={styles.correctionContainer}>
          <Text style={styles.correctionText}>
            {selectedAnswer === correctAnswer ? 'Correct!' : 'Wrong!'}
          </Text>
          {selectedAnswer !== correctAnswer && correctAnswer !== undefined && (
            <Text style={styles.correctAnswerText}>
              Correct answer: {question.options[correctAnswer]}
            </Text>
          )}
        </View>
      )}

      {/* Lifeline Penalty */}
      {showCorrection && lifelineUsed && (
        <View style={styles.penaltyContainer}>
          <Text style={styles.penaltyText}>Lifeline used - Points halved this round</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stats: {
    alignItems: 'center',
  },
  streakText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 28,
  },
  lifelineButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lifelineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionsScrollContainer: {
    flex: 1,
    padding: 20,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eliminatedOption: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  selectedOption: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  correctOption: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  wrongOption: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  eliminatedText: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  correctText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  wrongText: {
    color: '#ef4444',
  },
  correctIcon: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  wrongIcon: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  correctionContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  correctionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correctAnswerText: {
    color: '#10b981',
  },
  incorrectText: {
    color: '#ef4444',
  },
  penaltyContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  penaltyText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
});
