import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Player, EloSystem } from './utils/elo';
import { QuizBattleFSM, GameState } from './utils/fsm';
import { quizService } from './services/quizService';
import HomeScreen from './components/HomeScreen';
import RankingScreen from './components/RankingScreen';
import BattleLobby from './components/BattleLobby';
import BattleQuizCard from './components/BattleQuizCard';
import BattleResult from './components/BattleResult';
import GameProgress from './components/GameProgress';
import { useBattleTimer } from './hooks/useBattleTimer';

type Screen = 'HOME' | 'RANKING' | 'LOBBY' | 'MATCHMAKING' | 'ROUND' | 'RESULT';

export default function HomeBattleApp() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('HOME');
  const [fsm] = React.useState(() => new QuizBattleFSM());
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | null>(null);
  const [opponent, setOppponent] = React.useState<Player | null>(null);
  const [isMatchmaking, setIsMatchmaking] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState<any>(null);
  const [showCorrection, setShowCorrection] = React.useState(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [lifelineUsed, setLifelineUsed] = React.useState(false);
  const [eliminatedOptions, setEliminatedOptions] = React.useState<number[]>([]);
  const [matchResult, setMatchResult] = React.useState<any>(null);

  const timer = useBattleTimer({
    duration: 30,
    onTick: (timeLeft) => {
      if (timeLeft === 0 && !showCorrection && currentScreen === 'ROUND') {
        handleTimeUp();
      }
    },
  });

  // Initialize with some AI players for demonstration
  React.useEffect(() => {
    const aiPlayers: Player[] = [
      EloSystem.createPlayer('ai1', 'QuizMaster'),
      EloSystem.createPlayer('ai2', 'BrainStorm'),
      EloSystem.createPlayer('ai3', 'SmartAlex'),
      EloSystem.createPlayer('ai4', 'ThinkTank'),
      EloSystem.createPlayer('ai5', 'ProGamer'),
      EloSystem.createPlayer('ai6', 'QuizNinja'),
    ];
    
    // Give AI players varied ratings
    aiPlayers[0].rating = 1800; // Master
    aiPlayers[1].rating = 1200; // Silver
    aiPlayers[2].rating = 1350; // Gold
    aiPlayers[3].rating = 1100; // Bronze
    aiPlayers[4].rating = 1600; // Platinum
    aiPlayers[5].rating = 2000; // Grandmaster
    
    setPlayers(aiPlayers);
  }, []);

  // Subscribe to FSM state changes
  React.useEffect(() => {
    const unsubscribe = fsm.subscribe('LOBBY', (context: any) => {
      console.log('State: LOBBY', context);
      setCurrentScreen('LOBBY');
    });

    fsm.subscribe('MATCHMAKING', (context: any) => {
      console.log('State: MATCHMAKING', context);
      setCurrentScreen('MATCHMAKING');
      // Simulate finding a match after 2 seconds
      setTimeout(() => {
        const availablePlayers = players.filter(p => p.id !== currentPlayer?.id);
        if (availablePlayers.length > 0 && currentPlayer) {
          const randomOpponent = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          fsm.handleEvent({
            type: 'MATCH_FOUND',
            payload: { players: [currentPlayer, randomOpponent] }
          });
          setOppponent(randomOpponent);
          setIsMatchmaking(false);
        }
      }, 2000);
    });

    fsm.subscribe('ROUND', (context: any) => {
      console.log('State: ROUND', context);
      setCurrentScreen('ROUND');
      if (context.roundState === 'QUESTION') {
        loadNewQuestion();
      }
    });

    fsm.subscribe('GAME_OVER', (context: any) => {
      console.log('State: GAME_OVER', context);
      setCurrentScreen('RESULT');
      if (context.winner && opponent) {
        const result = EloSystem.processMatch(context.winner, opponent === context.winner ? currentPlayer! : opponent);
        setMatchResult(result);
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
  };

  const handleJoinLobby = (playerName: string) => {
    const newPlayer = EloSystem.createPlayer('current', playerName);
    setCurrentPlayer(newPlayer);
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handlePlay = () => {
    if (!currentPlayer) return;
    
    setCurrentScreen('LOBBY');
    fsm.handleEvent({
      type: 'START_MATCHMAKING',
      payload: { players: [currentPlayer] }
    });
  };

  const handleViewRanking = () => {
    setCurrentScreen('RANKING');
  };

  const handleBackToHome = () => {
    setCurrentScreen('HOME');
  };

  const handleStartMatchmaking = () => {
    if (!currentPlayer) return;
    
    setIsMatchmaking(true);
    quizService.resetGame(); // Reset used questions for new game
    fsm.handleEvent({
      type: 'START_MATCHMAKING',
      payload: { players: [currentPlayer] }
    });
  };

  const handleAnswer = (answerIndex: number, timeUsed: number) => {
    if (!currentPlayer || !currentQuestion || !opponent) return;
    
    timer.stop();
    setSelectedAnswer(answerIndex);
    
    // Calculate points
    let points = 0;
    const isCorrect = answerIndex === currentQuestion.correct;
    
    if (isCorrect) {
      points = 100;
      
      // Time bonus
      const timeBonus = Math.max(0, timeUsed * 2);
      points += timeBonus;
      
      // Lifeline penalty
      if (lifelineUsed) {
        points = Math.floor(points / 2);
      }
      
      // Streak bonus
      currentPlayer.streak += 1;
      points += currentPlayer.streak * 10;
      
      currentPlayer.score += points;
    } else {
      currentPlayer.streak = 0;
    }

    // Simulate opponent answer
    const opponentAnswer = Math.floor(Math.random() * 4);
    const opponentCorrect = opponentAnswer === currentQuestion.correct;
    
    if (opponentCorrect) {
      opponent.streak += 1;
      opponent.score += 100 + (opponent.streak * 10);
    } else {
      opponent.streak = 0;
    }

    setShowCorrection(true);
    
    // Auto advance after showing correction
    setTimeout(() => {
      handleNextRound();
    }, 2000);
  };

  const handleTimeUp = () => {
    if (!currentPlayer || !currentQuestion || !opponent) return;
    
    setSelectedAnswer(-1); // -1 indicates time up
    currentPlayer.streak = 0;
    setShowCorrection(true);
    
    // Simulate opponent answer
    const opponentAnswer = Math.floor(Math.random() * 4);
    const opponentCorrect = opponentAnswer === currentQuestion.correct;
    
    if (opponentCorrect) {
      opponent.streak += 1;
      opponent.score += 100 + (opponent.streak * 10);
    } else {
      opponent.streak = 0;
    }

    setTimeout(() => {
      handleNextRound();
    }, 2000);
  };

  const handleUseLifeline = () => {
    if (!currentQuestion || lifelineUsed) return;
    
    const wrongAnswers = currentQuestion.options
      .map((_: any, index: number) => index)
      .filter((index: number) => index !== currentQuestion.correct);
    
    const toEliminate = wrongAnswers
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    setEliminatedOptions(toEliminate);
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
    // Reset scores for new game but keep series stats
    if (currentPlayer) {
      currentPlayer.score = 0;
      currentPlayer.streak = 0;
    }
    if (opponent) {
      opponent.score = 0;
      opponent.streak = 0;
    }
    setMatchResult(null);
    quizService.resetGame(); // Reset used questions for new game
    fsm.handleEvent({
      type: 'PLAY_AGAIN'
    });
  };

  const handleReturnToLobby = () => {
    setMatchResult(null);
    setOppponent(null);
    setIsMatchmaking(false);
    setCurrentScreen('LOBBY');
    fsm.handleEvent({
      type: 'RESET_SERIES'
    });
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return (
          <HomeScreen
            currentPlayer={currentPlayer}
            players={players}
            onPlay={handlePlay}
            onViewRanking={handleViewRanking}
            onJoinLobby={handleJoinLobby}
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
        
      case 'LOBBY':
        return (
          <BattleLobby
            players={players}
            currentPlayer={currentPlayer}
            onStartMatchmaking={handleStartMatchmaking}
            onJoinLobby={handleJoinLobby}
            isMatchmaking={isMatchmaking}
          />
        );
        
      case 'MATCHMAKING':
        return (
          <View style={styles.matchmakingContainer}>
            <Text style={styles.matchmakingText}>Finding worthy opponent...</Text>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        );
        
      case 'ROUND':
        return (
          <View style={styles.gameContainer}>
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
          </View>
        );
        
      case 'RESULT':
        return matchResult ? (
          <BattleResult
            winner={matchResult.winner}
            loser={matchResult.loser}
            matchResult={matchResult}
            onPlayAgain={handlePlayAgain}
            onReturnToLobby={handleReturnToLobby}
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
  matchmakingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  matchmakingText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.3,
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
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 4,
  },
  streak: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  separator: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
});
