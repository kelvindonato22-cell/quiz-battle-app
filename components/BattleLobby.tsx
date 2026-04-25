import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, TextInput } from 'react-native';
import { Player, EloSystem } from '../utils/elo';
import MatchmakingScreen from './MatchmakingScreen';

interface BattleLobbyProps {
  players: Player[];
  currentPlayer: Player | null;
  onStartMatchmaking: () => void;
  onJoinLobby: (playerName: string) => void;
  isMatchmaking: boolean;
}

export default function BattleLobby({
  players,
  currentPlayer,
  onStartMatchmaking,
  onJoinLobby,
  isMatchmaking
}: BattleLobbyProps) {
  const [playerName, setPlayerName] = React.useState('');
  const [showJoinForm, setShowJoinForm] = React.useState(!currentPlayer);

  const handleJoinLobby = () => {
    if (playerName.trim()) {
      onJoinLobby(playerName.trim());
      setShowJoinForm(false);
    }
  };

  const handleMatchFound = (opponent: Player) => {
    // For BattleApp, just start the game with the found opponent
    onStartMatchmaking();
  };

  const handleDirectGame = (opponent: Player) => {
    // For BattleApp, just start the game with the selected opponent
    onStartMatchmaking();
  };

  if (isMatchmaking) {
    return (
      <MatchmakingScreen
        currentPlayer={currentPlayer}
        players={players}
        onMatchFound={handleMatchFound}
        onCancel={() => {}}
        onDirectGame={handleDirectGame}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quiz Battle Arena</Text>
        <Text style={styles.subtitle}>Challenge opponents in epic quiz battles!</Text>
      </View>

      {showJoinForm ? (
        <View style={styles.joinForm}>
          <Text style={styles.formTitle}>Enter Your Name</Text>
          <TextInput
            style={styles.nameInput}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Your name"
            maxLength={20}
          />
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinLobby}>
            <Text style={styles.joinButtonText}>Join Battle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.lobbyContent}>
          <View style={styles.playerCard}>
            <Text style={styles.playerName}>{currentPlayer?.name}</Text>
            <Text style={styles.playerRating}>ELO: {currentPlayer?.rating || 1000}</Text>
            <Text style={styles.playerStatus}>Ready for Battle</Text>
          </View>

          <View style={styles.opponentsSection}>
            <Text style={styles.sectionTitle}>Available Opponents ({players.filter(p => p.id !== currentPlayer?.id).length})</Text>
            <ScrollView style={styles.opponentsList}>
              {players.filter(p => p.id !== currentPlayer?.id).map((player) => (
                <View key={player.id} style={styles.opponentCard}>
                  <Text style={styles.opponentName}>{player.name}</Text>
                  <Text style={styles.opponentRating}>ELO: {player.rating}</Text>
                  <Text style={styles.opponentTier}>{EloSystem.getRatingTier(player.rating).tier}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={onStartMatchmaking}>
            <Text style={styles.startButtonText}>🎮 Start Matchmaking</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
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
  joinForm: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  nameInput: {
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lobbyContent: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  playerRating: {
    fontSize: 18,
    color: '#6366f1',
    marginBottom: 4,
  },
  playerStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  opponentsSection: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  opponentsList: {
    flex: 1,
  },
  opponentCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  opponentRating: {
    fontSize: 14,
    color: '#6366f1',
  },
  opponentTier: {
    fontSize: 12,
    color: '#64748b',
  },
  startButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
