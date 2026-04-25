import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameProgressProps {
  gameCount: number;
  currentPlayerWins: number;
  opponentWins: number;
  currentRound: number;
  totalRounds: number;
}

export default function GameProgress({
  gameCount,
  currentPlayerWins,
  opponentWins,
  currentRound,
  totalRounds
}: GameProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.gameInfo}>
        <View style={styles.gameCounter}>
          <Text style={styles.gameCounterText}>
            {gameCount === 1 ? '1️⃣' : gameCount === 2 ? '2️⃣' : '3️⃣'} Game {gameCount}/3
          </Text>
        </View>
        
        <View style={styles.seriesScore}>
          <Text style={styles.scoreText}>
            You: {currentPlayerWins} - Opponent: {opponentWins}
          </Text>
        </View>
      </View>
      
      {/* Progress Dots */}
      <View style={styles.progressDots}>
        {[1, 2, 3].map((gameNum) => (
          <View 
            key={gameNum} 
            style={[
              styles.progressDot, 
              gameNum <= gameCount ? styles.completedDot : styles.incompleteDot
            ]}
          >
            <Text style={[
              styles.progressDotText,
              gameNum <= gameCount ? styles.completedDotText : styles.incompleteDotText
            ]}>
              {gameNum}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.roundInfo}>
        <Text style={styles.roundText}>
          Round {currentRound}/{totalRounds}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameCounter: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  gameCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seriesScore: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDot: {
    backgroundColor: '#10b981',
  },
  incompleteDot: {
    backgroundColor: '#e2e8f0',
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedDotText: {
    color: 'white',
  },
  incompleteDotText: {
    color: '#64748b',
  },
  roundInfo: {
    alignItems: 'center',
  },
  roundText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
