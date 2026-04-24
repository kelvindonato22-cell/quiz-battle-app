import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Player, EloSystem } from '../utils/elo';

interface RankingScreenProps {
  players: Player[];
  currentPlayer: Player | null;
  onBack: () => void;
}

export default function RankingScreen({
  players,
  currentPlayer,
  onBack
}: RankingScreenProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getSortedPlayers = () => {
    return players.sort((a, b) => b.rating - a.rating);
  };

  const getRatingTier = (rating: number) => {
    return EloSystem.getRatingTier(rating);
  };

  const getPlayerRank = (playerId: string) => {
    const sorted = getSortedPlayers();
    return sorted.findIndex(p => p.id === playerId) + 1;
  };

  const getTierStats = () => {
    const tiers = {
      'Grandmaster': 0,
      'Master': 0,
      'Diamond': 0,
      'Platinum': 0,
      'Gold': 0,
      'Silver': 0,
      'Bronze': 0
    };

    players.forEach(player => {
      const tier = getRatingTier(player.rating).tier;
      if (tier in tiers) {
        tiers[tier as keyof typeof tiers]++;
      }
    });

    return tiers;
  };

  const sortedPlayers = getSortedPlayers();
  const tierStats = getTierStats();
  const currentPlayerRank = currentPlayer ? getPlayerRank(currentPlayer.id) : null;

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ELO Rankings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Player Card */}
        {currentPlayer && (
          <View style={styles.currentPlayerCard}>
            <View style={styles.currentPlayerHeader}>
              <Text style={styles.currentPlayerName}>{currentPlayer.name}</Text>
              <View style={[styles.rankBadge, { backgroundColor: getRatingTier(currentPlayer.rating).color }]}>
                <Text style={styles.rankText}>#{currentPlayerRank}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>{currentPlayer.rating}</Text>
              <Text style={styles.tierName}>{getRatingTier(currentPlayer.rating).tier}</Text>
            </View>
            <Text style={styles.tierDescription}>
              {getRatingTier(currentPlayer.rating).description}
            </Text>
          </View>
        )}

        {/* Tier Distribution */}
        <View style={styles.tierSection}>
          <Text style={styles.sectionTitle}>Tier Distribution</Text>
          <View style={styles.tierGrid}>
            {Object.entries(tierStats).map(([tier, count]) => {
              const tierInfo = EloSystem.getRatingTier(1200); // Default for color
              const color = EloSystem.getRatingTier(
                tier === 'Grandmaster' ? 2000 :
                tier === 'Master' ? 1800 :
                tier === 'Diamond' ? 1600 :
                tier === 'Platinum' ? 1400 :
                tier === 'Gold' ? 1200 :
                tier === 'Silver' ? 1000 : 800
              ).color;
              
              return (
                <View key={tier} style={[styles.tierItem, { backgroundColor: color }]}>
                  <Text style={styles.tierItemName}>{tier}</Text>
                  <Text style={styles.tierItemCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Global Leaderboard</Text>
          
          {sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.id === currentPlayer?.id;
            const tierInfo = getRatingTier(player.rating);
            
            return (
              <View key={player.id} style={[styles.leaderboardItem, isCurrentPlayer && styles.currentPlayerItem]}>
                <View style={styles.rankContainer}>
                  <Text style={[styles.rank, isCurrentPlayer && styles.currentPlayerRank]}>
                    #{index + 1}
                  </Text>
                  {index === 0 && <Text style={styles.crown}>👑</Text>}
                  {index === 1 && <Text style={styles.medal}>🥈</Text>}
                  {index === 2 && <Text style={styles.medal}>🥉</Text>}
                </View>
                
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, isCurrentPlayer && styles.currentPlayerNameText]}>
                    {player.name}
                    {isCurrentPlayer && <Text style={styles.youText}> (You)</Text>}
                  </Text>
                  <View style={styles.playerStats}>
                    <Text style={styles.streak}>Streak: {player.streak}</Text>
                    <Text style={styles.score}>Score: {player.score}</Text>
                  </View>
                </View>
                
                <View style={styles.ratingSection}>
                  <Text style={styles.rating}>{player.rating}</Text>
                  <View style={[styles.miniTier, { backgroundColor: tierInfo.color }]}>
                    <Text style={styles.miniTierText}>{tierInfo.tier[0]}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Arena Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{players.length}</Text>
              <Text style={styles.statLabel}>Total Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length)}
              </Text>
              <Text style={styles.statLabel}>Average ELO</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(...players.map(p => p.rating))}
              </Text>
              <Text style={styles.statLabel}>Highest ELO</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.min(...players.map(p => p.rating))}
              </Text>
              <Text style={styles.statLabel}>Lowest ELO</Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 60,
  },
  currentPlayerCard: {
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
  currentPlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPlayerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  tierName: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  tierSection: {
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
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  tierItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  tierItemName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierItemCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  currentPlayerItem: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  rankContainer: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginRight: 8,
  },
  currentPlayerRank: {
    color: '#1e293b',
  },
  crown: {
    fontSize: 16,
  },
  medal: {
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentPlayerNameText: {
    color: '#6366f1',
  },
  youText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: 'normal',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 15,
  },
  streak: {
    fontSize: 12,
    color: '#10b981',
  },
  score: {
    fontSize: 12,
    color: '#64748b',
  },
  ratingSection: {
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
