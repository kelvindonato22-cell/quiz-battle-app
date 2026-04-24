import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Player, EloSystem } from '../utils/elo';

const { width } = Dimensions.get('window');

interface MatchmakingScreenProps {
  currentPlayer: Player;
  players: Player[];
  onMatchFound: (opponent: Player) => void;
  onCancel: () => void;
  onDirectGame: (opponent: Player) => void;
}

export default function MatchmakingScreen({
  currentPlayer,
  players,
  onMatchFound,
  onCancel,
  onDirectGame
}: MatchmakingScreenProps) {
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchStatus, setSearchStatus] = React.useState('');
  const [searchProgress, setSearchProgress] = React.useState(0);
  const [connectionStatus, setConnectionStatus] = React.useState('');
  const [availableOpponents, setAvailableOpponents] = React.useState<Player[]>([]);
  const [showDirectChallenge, setShowDirectChallenge] = React.useState(false);
  
  const [pulseAnim] = React.useState(new Animated.Value(1));
  const [slideAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    // Set initial connection status
    setConnectionStatus('Connected to matchmaking server');
    
    // Filter available opponents
    const available = players.filter(p => p.id !== currentPlayer.id);
    setAvailableOpponents(available);
  }, [currentPlayer, players]);

  React.useEffect(() => {
    // Pulse animation for searching state
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (isSearching) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
  }, [isSearching]);

  React.useEffect(() => {
    // Slide animation for direct challenge panel
    Animated.timing(slideAnim, {
      toValue: showDirectChallenge ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showDirectChallenge]);

  const handleStartSearch = async () => {
    setIsSearching(true);
    setSearchStatus('Connecting to matchmaking server...');
    setSearchProgress(0);

    // Simulate socket connection and search phases
    const searchPhases = [
      'Connecting to matchmaking server...',
      'Finding players in your skill range...',
      'Evaluating potential opponents...',
      'Calculating match quality...',
      'Finalizing match...'
    ];

    let phaseIndex = 0;
    const phaseInterval = setInterval(() => {
      if (phaseIndex < searchPhases.length) {
        setSearchStatus(searchPhases[phaseIndex]);
        setSearchProgress(prev => Math.min(prev + 16, 80));
        phaseIndex++;
      } else {
        clearInterval(phaseInterval);
      }
    }, 800);

    try {
      // Simulate matchmaking delay (2-4 seconds)
      const searchDelay = 2000 + Math.random() * 2000;
      
      setTimeout(() => {
        clearInterval(phaseInterval);
        
        // Find best match based on ELO
        const availablePlayers = players.filter(p => p.id !== currentPlayer.id);
        
        if (availablePlayers.length > 0) {
          // Sort by ELO proximity
          const sortedByElo = availablePlayers
            .map(player => ({
              player,
              eloDifference: Math.abs(player.rating - currentPlayer.rating)
            }))
            .sort((a, b) => a.eloDifference - b.eloDifference);

          // Add randomness to avoid always matching same person
          const topCandidates = sortedByElo.slice(0, Math.min(3, sortedByElo.length));
          const selectedCandidate = topCandidates[Math.floor(Math.random() * topCandidates.length)];
          const opponent = selectedCandidate.player;

          setSearchProgress(100);
          setSearchStatus('Match found! Starting game...');
          
          // Direct transition to game after 1.5 seconds
          setTimeout(() => {
            setIsSearching(false);
            onMatchFound(opponent);
          }, 1500);
        } else {
          setIsSearching(false);
          setSearchStatus('No opponents available');
        }
      }, searchDelay);
    } catch (error) {
      clearInterval(phaseInterval);
      setIsSearching(false);
      setSearchStatus('Search error. Please try again.');
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchStatus('Search cancelled');
    setSearchProgress(0);
  };

  const handleDirectChallenge = (opponent: Player) => {
    onDirectGame(opponent);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return { backgroundColor: '#fbbf24', borderColor: '#f59e0b' }; // Gold
    if (rating >= 1800) return { backgroundColor: '#c084fc', borderColor: '#a855f7' }; // Purple
    if (rating >= 1600) return { backgroundColor: '#60a5fa', borderColor: '#3b82f6' }; // Blue
    if (rating >= 1400) return { backgroundColor: '#34d399', borderColor: '#10b981' }; // Green
    if (rating >= 1200) return { backgroundColor: '#fbbf24', borderColor: '#f59e0b' }; // Yellow
    return { backgroundColor: '#94a3b8', borderColor: '#64748b' }; // Gray
  };

  const getTier = (rating: number) => {
    return EloSystem.getRatingTier(rating).tier;
  };

  const getEloDifference = (playerRating: number, opponentRating: number) => {
    const diff = opponentRating - playerRating;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getMatchQuality = (playerRating: number, opponentRating: number) => {
    const diff = Math.abs(playerRating - opponentRating);
    if (diff <= 50) return { text: 'Perfect Match', color: '#10b981' };
    if (diff <= 100) return { text: 'Good Match', color: '#f59e0b' };
    if (diff <= 200) return { text: 'Fair Match', color: '#64748b' };
    return { text: 'Skill Mismatch', color: '#ef4444' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Matchmaking</Text>
        <View style={styles.connectionIndicator}>
          <View style={[styles.dot, styles.connected]} />
          <Text style={styles.connectionText}>{connectionStatus}</Text>
        </View>
      </View>

      {/* Current Player Info */}
      <View style={styles.playerCard}>
        <Text style={styles.playerName}>{currentPlayer?.name || 'Guest'}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{currentPlayer?.rating || 1000}</Text>
          <Text style={styles.ratingLabel}>ELO</Text>
        </View>
        {currentPlayer && (
          <View style={[styles.tierBadge, { backgroundColor: getTier(currentPlayer.rating) }]}>
            <Text style={styles.tierText}>{getTier(currentPlayer.rating)}</Text>
          </View>
        )}
      </View>

      {/* Matchmaking Pool */}
      <View style={styles.poolContainer}>
        <View style={styles.poolHeader}>
          <Text style={styles.poolTitle}>Matchmaking Pool</Text>
          <Text style={styles.poolSubtitle}>Available Opponents ({currentPlayer ? players.filter(p => p.id !== currentPlayer.id).length : players.length})</Text>
        </View>
        
        <ScrollView 
          style={styles.poolScrollContainer}
          contentContainerStyle={styles.poolList}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {currentPlayer && players.filter(p => p.id !== currentPlayer.id).map((player, index) => (
            <TouchableOpacity
              key={player.id}
              style={styles.poolOpponentCard}
              onPress={() => handleDirectChallenge(player)}
            >
              <View style={styles.poolOpponentInfo}>
                <View style={styles.poolOpponentHeader}>
                  <Text style={styles.poolOpponentName}>{player.name}</Text>
                  <View style={[styles.poolRatingBadge, getRatingColor(player.rating)]}>
                    <Text style={styles.poolRatingText}>{player.rating}</Text>
                  </View>
                </View>
                <Text style={styles.poolOpponentTier}>{getTier(player.rating)}</Text>
                <View style={styles.poolOpponentStats}>
                  <Text style={styles.poolStatText}>Win Rate: {Math.floor(Math.random() * 30 + 40)}%</Text>
                  <Text style={styles.poolStatText}>Games: {Math.floor(Math.random() * 100 + 50)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.poolChallengeButton}
                onPress={() => handleDirectChallenge(player)}
              >
                <Text style={styles.poolChallengeText}>⚔️ Challenge</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Matchmaking Buttons */}
      <Animated.View style={[styles.searchContainer, { transform: [{ scale: pulseAnim }] }]}>
        {isSearching ? (
          <View style={styles.searchingContent}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchEmoji}>🔍</Text>
            </View>
            <Text style={styles.searchStatus}>{searchStatus}</Text>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${searchProgress}%` }]} />
            </View>
            
            <TouchableOpacity style={styles.cancelSearchButton} onPress={handleCancelSearch}>
              <Text style={styles.cancelSearchText}>Cancel Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.searchOptions}>
            <TouchableOpacity
              style={[styles.button, styles.searchButton]}
              onPress={handleStartSearch}
            >
              <Text style={styles.buttonText}>🎮 Find Match</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.directButton]}
              onPress={() => setShowDirectChallenge(true)}
            >
              <Text style={styles.buttonText}>⚔️ Direct Challenge</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Direct Challenge Panel */}
      <Animated.View style={[
        styles.directChallengePanel,
        { transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0]
        }) }] }
      ]}>
        <View style={styles.directChallengeHeader}>
          <Text style={styles.directChallengeTitle}>Choose Opponent</Text>
          <TouchableOpacity onPress={() => setShowDirectChallenge(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.opponentScrollContainer}
          contentContainerStyle={styles.opponentList}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {currentPlayer && availableOpponents.map((opponent) => {
            const matchQuality = getMatchQuality(currentPlayer.rating, opponent.rating);
            const eloDiff = getEloDifference(currentPlayer.rating, opponent.rating);
            
            return (
              <TouchableOpacity
                key={opponent.id}
                style={styles.opponentCard}
                onPress={() => handleDirectChallenge(opponent)}
              >
                <View style={styles.opponentInfo}>
                  <Text style={styles.opponentName}>{opponent.name}</Text>
                  <View style={styles.opponentRating}>
                    <Text style={styles.rating}>{opponent.rating}</Text>
                    <Text style={[styles.eloDiff, eloDiff.startsWith('+') ? styles.eloGain : styles.eloLoss]}>
                      {eloDiff}
                    </Text>
                  </View>
                  <View style={[styles.matchBadge, { backgroundColor: matchQuality.color }]}>
                    <Text style={styles.matchText}>{matchQuality.text}</Text>
                  </View>
                </View>
                
                <View style={[styles.miniTier, { backgroundColor: EloSystem.getRatingTier(opponent.rating).color }]}>
                  <Text style={styles.miniTierText}>{EloSystem.getRatingTier(opponent.rating).tier[0]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

          </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 18,
    color: '#64748b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#10b981',
  },
  connectionText: {
    fontSize: 12,
    color: '#64748b',
  },
  playerCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rating: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
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
  searchContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchingContent: {
    alignItems: 'center',
    width: '100%',
  },
  searchIcon: {
    marginBottom: 20,
  },
  searchEmoji: {
    fontSize: 48,
  },
  searchStatus: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  cancelSearchButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  cancelSearchText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  searchOptions: {
    width: '100%',
    gap: 12,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#6366f1',
  },
  directButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  directChallengePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  directChallengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  directChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeText: {
    fontSize: 18,
    color: '#64748b',
  },
  opponentsList: {
    maxHeight: 300,
  },
  opponentScrollContainer: {
    flex: 1,
    maxHeight: 400,
  },
  opponentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  opponentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  opponentRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eloDiff: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  eloGain: {
    color: '#10b981',
  },
  eloLoss: {
    color: '#ef4444',
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
  statsContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  poolContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  poolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  poolSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  poolScrollContainer: {
    flex: 2,
    maxHeight: 400,
  },
  poolList: {
    gap: 12,
    paddingBottom: 20,
  },
  poolOpponentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poolOpponentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  poolOpponentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  poolOpponentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  poolRatingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  poolRatingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  poolOpponentTier: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  poolOpponentStats: {
    gap: 2,
  },
  poolStatText: {
    fontSize: 11,
    color: '#64748b',
  },
  poolChallengeButton: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 6,
  },
  poolChallengeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
