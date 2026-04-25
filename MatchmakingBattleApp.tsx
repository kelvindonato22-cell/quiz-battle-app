import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Player, EloSystem } from './utils/elo';
import { QuizBattleFSM, GameState } from './utils/fsm';
import { quizService } from './services/quizService';
import { MatchmakingService, SocketSimulation } from './utils/matchmaking';
import HomeScreen from './components/HomeScreen';
import RankingScreen from './components/RankingScreen';
import MatchmakingScreen from './components/MatchmakingScreen';
import BattleQuizCard from './components/BattleQuizCard';
import BattleResult from './components/BattleResult';
import PeerConnection from './components/PeerConnection';
import GameProgress from './components/GameProgress';
import { useBattleTimer } from './hooks/useBattleTimer';

type Screen = 'HOME' | 'RANKING' | 'MATCHMAKING' | 'ROUND' | 'RESULT';

export default function MatchmakingBattleApp() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('HOME');
  const [fsm] = React.useState(() => new QuizBattleFSM());
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | null>(null);
  const [opponent, setOppponent] = React.useState<Player | null>(null);
  const [currentQuestion, setCurrentQuestion] = React.useState<any>(null);
  const [showCorrection, setShowCorrection] = React.useState(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [lifelineUsed, setLifelineUsed] = React.useState(false);
  const [eliminatedOptions, setEliminatedOptions] = React.useState<number[]>([]);
  const [matchResult, setMatchResult] = React.useState<any>(null);

  const timer = useBattleTimer({
    duration: 30,
    onTick: (timeLeft) => {
      if (timeLeft === 0 && !showCorrection && fsm.getState() === 'QUESTION_ACTIVE') {
        handleTimeUp();
      }
    },
  });

  // Initialize with AI players
  React.useEffect(() => {
    const aiPlayers: Player[] = [
      EloSystem.createPlayer('ai1', 'QuizMaster'),
      EloSystem.createPlayer('ai2', 'BrainStorm'),
      EloSystem.createPlayer('ai3', 'SmartAlex'),
      EloSystem.createPlayer('ai4', 'ThinkTank'),
      EloSystem.createPlayer('ai5', 'ProGamer'),
      EloSystem.createPlayer('ai6', 'QuizNinja'),
      EloSystem.createPlayer('ai7', 'ElitePlayer'),
      EloSystem.createPlayer('ai8', 'Challenger'),
    ];
    
    // Give AI players varied ratings
    aiPlayers[0].rating = 1800; // Master
    aiPlayers[1].rating = 1200; // Silver
    aiPlayers[2].rating = 1350; // Gold
    aiPlayers[3].rating = 1100; // Bronze
    aiPlayers[4].rating = 1600; // Platinum
    aiPlayers[5].rating = 2000; // Grandmaster
    aiPlayers[6].rating = 1450; // Platinum
    aiPlayers[7].rating = 1250; // Silver
    
    setPlayers(aiPlayers);
  }, []);

  // Subscribe to FSM state changes
  React.useEffect(() => {
    const unsubscribe = fsm.subscribe('LOBBY', (context: any) => {
      // State: LOBBY
      setCurrentScreen('MATCHMAKING');
    });

    fsm.subscribe('MATCH_FOUND', (context: any) => {
      // State: MATCH_FOUND
      setCurrentScreen('MATCHMAKING');
    });

    fsm.subscribe('START_GAME', (context: any) => {
      // State: START_GAME
      if (opponent) {
        setCurrentScreen('ROUND');
        loadNewQuestion();
      } else {
        setCurrentScreen('MATCHMAKING');
      }
    });

    fsm.subscribe('ROUND_START', (context: any) => {
      // State: ROUND_START
      setCurrentScreen('ROUND');
      loadNewQuestion();
    });

    fsm.subscribe('QUESTION_ACTIVE', (context: any) => {
      // State: QUESTION_ACTIVE
      setCurrentScreen('ROUND');
    });

    fsm.subscribe('ANSWER_SUBMITTED', (context: any) => {
      // State: ANSWER_SUBMITTED
      setCurrentScreen('ROUND');
      setShowCorrection(true);
    });

    fsm.subscribe('ROUND_RESULT', (context: any) => {
      // State: ROUND_RESULT
      setCurrentScreen('ROUND');
    });

    fsm.subscribe('GAME_OVER', (context: any) => {
      // State: GAME_OVER
      setCurrentScreen('RESULT');
      if (currentPlayer && opponent) {
        const winner = currentPlayer.score > opponent.score ? currentPlayer : opponent;
        const result = EloSystem.processMatch(winner, winner === currentPlayer ? opponent : currentPlayer);
        
        // Create proper matchResult with scoring data
        setMatchResult({
          ...result,
          playerPoints: currentPlayer.score,
          opponentPoints: opponent.score,
          playerStreak: currentPlayer.streak,
          opponentStreak: opponent.streak,
          winner: winner,
          loser: winner === currentPlayer ? opponent : currentPlayer
        });
      }
    });

    return unsubscribe;
  }, [fsm, players, currentPlayer, opponent]);

  const loadNewQuestion = () => {
    const currentRound = fsm.getContext().currentRound;
    const question = quizService.getQuestionForRound(currentRound);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowCorrection(false);
    setEliminatedOptions([]);
    timer.reset();
    timer.start();
    
    // Trigger question display
    fsm.handleEvent({
      type: 'SHOW_QUESTION',
      payload: { question }
    });
  };

  const handleJoinLobby = (playerName: string) => {
    const newPlayer = EloSystem.createPlayer('current', playerName);
    setCurrentPlayer(newPlayer);
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handlePlay = () => {
    if (!currentPlayer) return;
    setCurrentScreen('MATCHMAKING');
  };

  const handleViewRanking = () => {
    setCurrentScreen('RANKING');
  };

  const handleBackToHome = () => {
    setCurrentScreen('HOME');
  };

  const handleMatchFound = (foundOpponent: Player) => {
    setOppponent(foundOpponent);
    quizService.resetGame(); // Reset used questions for new game
    
    // Start matchmaking
    fsm.handleEvent({
      type: 'START_MATCHMAKING',
      payload: { players: [currentPlayer!] }
    });
    
    setTimeout(() => {
      fsm.handleEvent({
        type: 'START_GAME',
        payload: { players: [currentPlayer!, foundOpponent] }
      });
      
      setTimeout(() => {
        fsm.handleEvent({
          type: 'BEGIN_ROUND'
        });
      }, 500);
    }, 1500);
  };

  const handleDirectGame = (directOpponent: Player) => {
    setOppponent(directOpponent);
    quizService.resetGame(); // Reset used questions for new game
    
    // Immediate direct game
    fsm.handleEvent({
      type: 'START_MATCHMAKING',
      payload: { players: [currentPlayer!] }
    });
    
    setTimeout(() => {
      fsm.handleEvent({
        type: 'START_GAME',
        payload: { players: [currentPlayer!, directOpponent] }
      });
      
      setTimeout(() => {
        fsm.handleEvent({
          type: 'BEGIN_ROUND'
        });
      }, 200);
    }, 500);
  };

  const handleAnswer = (answerIndex: number, timeUsed: number) => {
    if (!currentPlayer || !currentQuestion || !opponent) return;
    
    timer.stop();
    setSelectedAnswer(answerIndex);
    
    // Submit answer to FSM
    fsm.handleEvent({
      type: 'SUBMIT_ANSWER',
      payload: { answer: answerIndex, timeUsed }
    });
    
    // Calculate points using FSM scoring
    const isCorrect = answerIndex === currentQuestion.correct;
    const points = fsm.calculateScore(isCorrect, timeUsed, currentPlayer.streak, lifelineUsed);
    
    if (isCorrect) {
      currentPlayer.streak += 1;
      currentPlayer.score += points;
    } else {
      currentPlayer.streak = 0;
    }

    // Simulate opponent answer with FSM scoring
    const opponentAnswer = Math.floor(Math.random() * 4);
    const opponentCorrect = opponentAnswer === currentQuestion.correct;
    const opponentTimeUsed = Math.floor(Math.random() * 30);
    const opponentPoints = fsm.calculateScore(opponentCorrect, opponentTimeUsed, opponent.streak, false);
    
    if (opponentCorrect) {
      opponent.streak += 1;
      opponent.score += opponentPoints;
    } else {
      opponent.streak = 0;
    }

    // Process result after showing correction
    setTimeout(() => {
      fsm.handleEvent({
        type: 'PROCESS_RESULT',
        payload: { 
          roundScores: [currentPlayer.score, opponent.score],
          playerPoints: points,
          opponentPoints: opponentPoints,
          playerStreak: currentPlayer.streak,
          opponentStreak: opponent.streak
        }
      });
      
      setTimeout(() => {
        handleNextRound();
      }, 1000);
    }, 2000);
  };

  const handleTimeUp = () => {
    if (!currentPlayer || !currentQuestion || !opponent) return;
    
    setSelectedAnswer(-1); // -1 indicates time up
    currentPlayer.streak = 0;
    setShowCorrection(true);
    
    // Submit time up to FSM
    fsm.handleEvent({
      type: 'TIME_UP'
    });
    
    // Simulate opponent answer with FSM scoring
    const opponentAnswer = Math.floor(Math.random() * 4);
    const opponentCorrect = opponentAnswer === currentQuestion.correct;
    const opponentTimeUsed = Math.floor(Math.random() * 30);
    const opponentPoints = fsm.calculateScore(opponentCorrect, opponentTimeUsed, opponent.streak, false);
    
    if (opponentCorrect) {
      opponent.streak += 1;
      opponent.score += opponentPoints;
    } else {
      opponent.streak = 0;
    }

    // Process result after showing correction
    setTimeout(() => {
      fsm.handleEvent({
        type: 'PROCESS_RESULT',
        payload: { 
          roundScores: [currentPlayer.score, opponent.score],
          playerPoints: 0,
          opponentPoints: opponentPoints,
          playerStreak: currentPlayer.streak,
          opponentStreak: opponent.streak
        }
      });
      
      setTimeout(() => {
        handleNextRound();
      }, 1000);
    }, 2000);
  };

  const handleUseLifeline = () => {
    if (!currentQuestion || lifelineUsed) return;
    
    const wrongAnswers = currentQuestion.options
      .map((_: any, index: number) => index)
      .filter((index: number) => index !== currentQuestion.correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    setEliminatedOptions(wrongAnswers);
    setLifelineUsed(true);
  };

  const handleNextRound = () => {
    const currentRound = fsm.getContext().currentRound;
    const totalRounds = fsm.getContext().totalRounds;
    
    if (currentRound >= totalRounds) {
      // Game over
      if (currentPlayer && opponent) {
        const winner = currentPlayer.score > opponent.score ? currentPlayer : opponent;
        fsm.handleEvent({
          type: 'GAME_OVER',
          payload: { winner }
        });
      }
    } else {
      // Next round
      fsm.handleEvent({
        type: 'NEXT_ROUND'
      });
    }
  };

  const handlePlayAgain = () => {
    // Reset game state for new round with same opponent
    if (currentPlayer) {
      currentPlayer.score = 0;
      currentPlayer.streak = 0;
    }
    if (opponent) {
      opponent.score = 0;
      opponent.streak = 0;
    }
    
    setLifelineUsed(false);
    setEliminatedOptions([]);
    setSelectedAnswer(null);
    setShowCorrection(false);
    setCurrentQuestion(null);
    setMatchResult(null);
    
    fsm.handleEvent({
      type: 'PLAY_AGAIN'
    });
  };

  const handleReturnToLobby = () => {
    // Go to home screen
    setLifelineUsed(false);
    setEliminatedOptions([]);
    setSelectedAnswer(null);
    setShowCorrection(false);
    setCurrentQuestion(null);
    setMatchResult(null);
    
    // Reset series and go to home
    fsm.handleEvent({
      type: 'RESET_SERIES'
    });
    setCurrentScreen('HOME');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return (
          <HomeScreen
            currentPlayer={currentPlayer}
            players={players}
            onJoinLobby={handleJoinLobby}
            onPlay={handlePlay}
            onViewRanking={handleViewRanking}
          />
        );
        
      case 'RANKING':
        return (
          <RankingScreen
            players={players}
            currentPlayer={currentPlayer}
            onBack={handleBackToHome}
          />
        );
        
      case 'MATCHMAKING':
        return (
          <MatchmakingScreen
            currentPlayer={currentPlayer}
            players={players}
            onMatchFound={handleMatchFound}
            onCancel={handleBackToHome}
            onDirectGame={handleDirectGame}
          />
        );
        
      case 'ROUND':
        return (
          <ScrollView style={styles.gameContainer}>
            <PeerConnection
              isConnected={true}
              opponentName={opponent?.name || 'Unknown'}
              latency={Math.floor(Math.random() * 50) + 10}
            />
            
            <GameProgress
              gameCount={fsm.getContext().gameCount}
              currentPlayerWins={fsm.getContext().currentPlayerWins}
              opponentWins={fsm.getContext().opponentWins}
              currentRound={fsm.getContext().currentRound}
              totalRounds={fsm.getContext().totalRounds}
            />
            
            <View style={styles.scoreBoard}>
              <View style={styles.playerScore}>
                <Text style={styles.playerName}>{currentPlayer?.name}</Text>
                <Text style={styles.score}>{currentPlayer?.score}</Text>
                <Text style={styles.streak}>Streak: {currentPlayer?.streak}</Text>
              </View>
              
              <View style={styles.separator}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              
              <View style={styles.playerScore}>
                <Text style={styles.playerName}>{opponent?.name}</Text>
                <Text style={styles.score}>{opponent?.score}</Text>
                <Text style={styles.streak}>Streak: {opponent?.streak}</Text>
              </View>
            </View>
            
            <BattleQuizCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              timeLeft={timer.timeLeft}
              lifelineUsed={lifelineUsed}
              onUseLifeline={handleUseLifeline}
              eliminatedOptions={eliminatedOptions}
              showCorrection={showCorrection}
              correctAnswer={currentQuestion?.correct}
              selectedAnswer={selectedAnswer}
              currentStreak={currentPlayer?.streak || 0}
              onBack={handleReturnToLobby}
            />
          </ScrollView>
        );
        
      case 'RESULT':
        return matchResult ? (
          <BattleResult
            winner={matchResult.winner || (currentPlayer?.score > opponent?.score ? currentPlayer! : opponent!)}
            loser={matchResult.loser || (currentPlayer?.score > opponent?.score ? opponent! : currentPlayer!)}
            matchResult={matchResult}
            onPlayAgain={handlePlayAgain}
            onReturnToLobby={handleReturnToLobby}
            playerPoints={matchResult.playerPoints || currentPlayer?.score || 0}
            opponentPoints={matchResult.opponentPoints || opponent?.score || 0}
            playerStreak={matchResult.playerStreak || currentPlayer?.streak || 0}
            opponentStreak={matchResult.opponentStreak || opponent?.streak || 0}
            seriesStatus={fsm.getSeriesStatus()}
          />
        ) : null;
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderCurrentScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  scoreBoard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playerScore: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  streak: {
    fontSize: 12,
    color: '#64748b',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
