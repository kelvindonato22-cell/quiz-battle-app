import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Player } from '../utils/elo';

interface BattleResultProps {
  winner: Player;
  loser: Player;
  matchResult: any;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
  playerPoints?: number;
  opponentPoints?: number;
  playerStreak?: number;
  opponentStreak?: number;
  seriesStatus?: {
    gameCount: number;
    currentPlayerWins: number;
    opponentWins: number;
    seriesWinner: any;
    canPlayAgain: boolean;
  };
}

export default function BattleResult({
  winner,
  loser,
  matchResult,
  onPlayAgain,
  onReturnToLobby,
  playerPoints,
  opponentPoints,
  playerStreak,
  opponentStreak,
  seriesStatus
}: BattleResultProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(50));

  // Determine if current player won or lost
  const isVictory = winner.id === 'current';
  const resultTitle = isVictory ? 'VICTORY!' : 'DEFEAT';
  const resultColor = isVictory ? '#10b981' : '#ef4444';

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const isPlayerWinner = winner.id === 'current';

  const getRatingChange = (player: Player) => {
    const ratingChange = matchResult.ratingChanges?.find((change: any) => change.player.id === player.id);
    return ratingChange?.ratingChange || 0;
  };

  const getNewRating = (player: Player) => {
    return player.rating + getRatingChange(player);
  };

  const getStatsSummary = () => {
    const totalQuestions = 5;
    const playerStats = {
      score: winner.id === 'current' ? winner.score : loser.score,
      correct: Math.round((winner.id === 'current' ? winner.score : loser.score) / 100),
      accuracy: Math.round(((winner.id === 'current' ? winner.score : loser.score) / 100) / totalQuestions * 100),
      avgTime: 15 // Simulated
    };

    const opponentStats = {
      score: winner.id === 'current' ? loser.score : winner.score,
      correct: Math.round((winner.id === 'current' ? loser.score : winner.score) / 100),
      accuracy: Math.round(((winner.id === 'current' ? loser.score : winner.score) / 100) / totalQuestions * 100),
      avgTime: 18 // Simulated
    };

    return { playerStats, opponentStats };
  };

  const { playerStats, opponentStats } = getStatsSummary();

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <Animated.View style={[styles.resultBadge, { backgroundColor: resultColor, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.resultBadgeText}>
              {isVictory ? '🏆 VICTORY!' : '� DEFEAT'}
            </Text>
          </Animated.View>
          <Text style={styles.resultSubtitle}>
            {isVictory ? 'You dominated the battle!' : 'Better luck next time!'}
          </Text>
        </View>

        {/* Players Comparison */}
        <View style={styles.playersContainer}>
          {/* Player */}
          <View style={[styles.playerCard, isVictory && styles.winnerCard]}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerName}>{winner.id === 'current' ? winner.name : loser.name}</Text>
              <View style={[styles.resultIndicator, { backgroundColor: isVictory ? '#10b981' : '#ef4444' }]}>
                <Text style={styles.resultIndicatorText}>
                  {isVictory ? 'WINNER' : 'LOSER'}
                </Text>
              </View>
            </View>
            <View style={styles.playerStats}>
              <Text style={styles.playerScore}>{winner.id === 'current' ? winner.score : loser.score}</Text>
              <Text style={styles.playerSubtitle}>Final Score</Text>
              <Text style={styles.playerAccuracy}>
                {playerStats.accuracy}% Accuracy
              </Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Avg Time:</Text>
                <Text style={styles.statValue}>{playerStats.avgTime}s</Text>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingChange}>
                {getRatingChange(winner.id === 'current' ? winner : loser) > 0 ? '+' : ''}
                {getRatingChange(winner.id === 'current' ? winner : loser)}
              </Text>
              <Text style={styles.newRating}>
                {getNewRating(winner.id === 'current' ? winner : loser)}
              </Text>
            </View>
          </View>

          {/* VS */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Opponent */}
          <View style={[styles.playerCard, !isPlayerWinner && styles.winnerCard]}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerName}>{winner.id === 'current' ? loser.name : winner.name}</Text>
              <View style={[styles.resultIndicator, { backgroundColor: !isPlayerWinner ? '#10b981' : '#ef4444' }]}>
                <Text style={styles.resultIndicatorText}>OPPONENT</Text>
              </View>
            </View>
            
            <View style={styles.playerStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Score:</Text>
                <Text style={styles.statValue}>{winner.id === 'current' ? loser.score : winner.score}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Correct:</Text>
                <Text style={styles.statValue}>{opponentStats.correct}/{5}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accuracy:</Text>
                <Text style={styles.statValue}>{opponentStats.accuracy}%</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Avg Time:</Text>
                <Text style={styles.statValue}>{opponentStats.avgTime}s</Text>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingChange}>
                {getRatingChange(winner.id === 'current' ? loser : winner) > 0 ? '+' : ''}
                {getRatingChange(winner.id === 'current' ? loser : winner)}
              </Text>
              <Text style={styles.newRating}>
                {getNewRating(winner.id === 'current' ? loser : winner)}
              </Text>
            </View>
          </View>
        </View>

        {/* Scoring Details */}
        <View style={styles.scoringContainer}>
          <Text style={styles.scoringTitle}>Scoring Details</Text>
          <View style={styles.scoringGrid}>
            <View style={[styles.playerScoring, isVictory && styles.winnerScoring]}>
              <Text style={styles.scoringPlayerName}>Your Score</Text>
              <Text style={styles.scoringPoints}>{playerPoints || 0} pts</Text>
              <Text style={styles.scoringStreak}>🔥 {playerStreak || 0} streak</Text>
              <Text style={styles.scoringResult}>
                {isVictory ? '🏆 VICTORY' : '💔 DEFEAT'}
              </Text>
            </View>
            <View style={[styles.opponentScoring, !isVictory && styles.winnerScoring]}>
              <Text style={styles.scoringPlayerName}>Opponent Score</Text>
              <Text style={styles.scoringPoints}>{opponentPoints || 0} pts</Text>
              <Text style={styles.scoringStreak}>🔥 {opponentStreak || 0} streak</Text>
              <Text style={styles.scoringResult}>
                {!isVictory ? '🏆 VICTORY' : '💔 DEFEAT'}
              </Text>
            </View>
          </View>
          <View style={styles.scoringFormula}>
            <Text style={styles.formulaTitle}>Scoring Formula:</Text>
            <Text style={styles.formulaText}>Base: 100pts</Text>
            <Text style={styles.formulaText}>Time: +{(30 - 15) * 2}pts</Text>
            <Text style={styles.formulaText}>Streak: +{(playerStreak || 0) * 10}pts</Text>
            <Text style={styles.formulaText}>Lifeline: ×0.5 multiplier</Text>
          </View>
        </View>

        {/* Battle Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Battle Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{Math.max(winner.score, loser.score)}</Text>
              <Text style={styles.summaryStatLabel}>Highest Score</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{Math.abs(winner.score - loser.score)}</Text>
              <Text style={styles.summaryStatLabel}>Score Difference</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>5</Text>
              <Text style={styles.summaryStatLabel}>Total Questions</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {Math.round((playerStats.correct + opponentStats.correct) / 5 * 100)}%
              </Text>
              <Text style={styles.summaryStatLabel}>Combined Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Series Status */}
        {seriesStatus && (
          <View style={styles.seriesContainer}>
            <Text style={styles.seriesTitle}>Series Status</Text>
            <View style={styles.seriesScore}>
              <Text style={styles.seriesScoreText}>
                Game {seriesStatus.gameCount}/3
              </Text>
              <Text style={styles.seriesWinsText}>
                You: {seriesStatus.currentPlayerWins} - Opponent: {seriesStatus.opponentWins}
              </Text>
            </View>
            {seriesStatus.seriesWinner && (
              <View style={styles.seriesWinnerContainer}>
                <Text style={styles.seriesWinnerText}>
                  🏆 {seriesStatus.seriesWinner.id === 'current' ? 'You won the series!' : 'Opponent won the series!'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {seriesStatus?.canPlayAgain && (
            <TouchableOpacity
              style={[styles.button, styles.playAgainButton]}
              onPress={onPlayAgain}
            >
              <Text style={styles.buttonText}>🎮 Play Again (Game {seriesStatus.gameCount + 1}/3)</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, seriesStatus?.canPlayAgain ? styles.lobbyButtonSecondary : styles.lobbyButton]}
            onPress={onReturnToLobby}
          >
            <Text style={styles.buttonText}>
              {seriesStatus?.seriesWinner ? '🏠 End Series' : '🏠 Return to Lobby'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 16,
  },
  resultBadgeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 16,
  },
  playerCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  winnerCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  resultIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ratingChange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  newRating: {
    fontSize: 14,
    color: '#64748b',
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
  },
  scoringContainer: {
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
  scoringTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoringGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerScoring: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginRight: 8,
  },
  opponentScoring: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginLeft: 8,
  },
  scoringPlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  scoringPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  scoringStreak: {
    fontSize: 12,
    color: '#64748b',
  },
  scoringResult: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  winnerScoring: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  scoringFormula: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  summaryContainer: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: '#10b981',
  },
  lobbyButton: {
    backgroundColor: '#6366f1',
  },
  lobbyButtonSecondary: {
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seriesContainer: {
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
  seriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  seriesScore: {
    alignItems: 'center',
    marginBottom: 12,
  },
  seriesScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  seriesWinsText: {
    fontSize: 14,
    color: '#64748b',
  },
  seriesWinnerContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  seriesWinnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
