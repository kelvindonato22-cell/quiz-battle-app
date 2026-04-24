import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, TextInput } from 'react-native';
import { Player, EloSystem } from '../utils/elo';

interface HomeScreenProps {
  currentPlayer: Player | null;
  players: Player[];
  onPlay: () => void;
  onViewRanking: () => void;
  onJoinLobby: (playerName: string) => void;
}

export default function HomeScreen({
  currentPlayer,
  players,
  onPlay,
  onViewRanking,
  onJoinLobby
}: HomeScreenProps) {
  const [playerName, setPlayerName] = React.useState('');
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleJoinLobby = () => {
    if (playerName.trim()) {
      onJoinLobby(playerName.trim());
      setPlayerName('');
    }
  };

  const getTopPlayers = () => {
    return players
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  };

  const getRatingTier = (rating: number) => {
    return EloSystem.getRatingTier(rating);
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Battle Arena</Text>
          <Text style={styles.subtitle}>Compete with players worldwide!</Text>
        </View>

        {/* Current Player Section */}
        {!currentPlayer ? (
          <View style={styles.joinSection}>
            <Text style={styles.sectionTitle}>Enter Arena</Text>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.nameInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleJoinLobby}
              disabled={!playerName.trim()}
            >
              <Text style={styles.buttonText}>Join Arena</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.playerSection}>
            <View style={styles.currentPlayerCard}>
              <Text style={styles.playerName}>{currentPlayer.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>{currentPlayer.rating}</Text>
                <Text style={styles.ratingLabel}>ELO Rating</Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: getRatingTier(currentPlayer.rating).color }]}>
                <Text style={styles.tierText}>{getRatingTier(currentPlayer.rating).tier}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={onPlay}
              >
                <Text style={styles.buttonText}>🎮 Play</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.rankingButton]}
                onPress={onViewRanking}
              >
                <Text style={styles.buttonText}>🏆 View Ranking</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        {players.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Arena Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{players.length}</Text>
                <Text style={styles.statLabel}>Total Players</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length)}
                </Text>
                <Text style={styles.statLabel}>Avg ELO</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.max(...players.map(p => p.rating))}
                </Text>
                <Text style={styles.statLabel}>Highest ELO</Text>
              </View>
            </View>
          </View>
        )}

        {/* Top Players Preview */}
        {players.length > 0 && (
          <View style={styles.leaderboardSection}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.sectionTitle}>Top Players</Text>
              <TouchableOpacity onPress={onViewRanking}>
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            </View>
            
            {getTopPlayers().slice(0, 5).map((player, index) => (
              <View key={player.id} style={styles.leaderboardItem}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  {index === 0 && <Text style={styles.crown}>👑</Text>}
                </View>
                <Text style={styles.leaderboardName}>{player.name}</Text>
                <View style={styles.leaderboardRating}>
                  <Text style={styles.rating}>{player.rating}</Text>
                  <View style={[styles.miniTier, { backgroundColor: getRatingTier(player.rating).color }]}>
                    <Text style={styles.miniTierText}>{getRatingTier(player.rating).tier[0]}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Game Rules */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <View style={styles.rulesList}>
            <Text style={styles.rule}>🎯 Answer questions within 30 seconds</Text>
            <Text style={styles.rule}>⚡ Build streaks for bonus points</Text>
            <Text style={styles.rule}>💡 Use 50:50 lifeline strategically</Text>
            <Text style={styles.rule}>🏆 Climb ELO rankings with victories</Text>
            <Text style={styles.rule}>⚔️ Battle players of similar skill</Text>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  joinSection: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  playButton: {
    backgroundColor: '#10b981',
    marginBottom: 8,
  },
  rankingButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerSection: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentPlayerCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  leaderboardSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rankContainer: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginRight: 8,
  },
  crown: {
    fontSize: 16,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  leaderboardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniTier: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTierText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rulesSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rulesList: {
    gap: 8,
  },
  rule: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});
