# Quiz Battle App

A fully functional quiz battle mobile application built with React Native, Expo, and Expo Router.

## Features

- **Multi-category Quiz Battles**: Choose from Science, History, Geography, Sports, Art, and more
- **Real-time Multiplayer**: Battle against random players or AI bots with live scoring
- **ELO Rating System**: Competitive ranking system with skill-based matchmaking
- **Finite State Machine**: Robust game flow management (lobby > match > round > result > gameOver)
- **Timed Questions**: 30-second timer for each question with visual feedback
- **Streak System**: Build winning streaks for bonus points
- **50/50 Lifeline**: Eliminate 2 wrong answers but halves the points for that question
- **Achievement System**: Unlock achievements for various accomplishments
- **Profile Statistics**: Track your performance, win rate, and best scores
- **Modern Architecture**: Expo Router with file-based routing and clean separation of concerns

## Project Structure

```
quiz-battle-app/
  app/                     # Expo Router (main navigation)
    _layout.js           # Root layout with providers
    (tabs)/              # Tab navigation
      _layout.js         # Tab layout configuration
      index.js           # Home screen
      profile.js         # Profile screen
    quiz/                # Quiz flow screens (stack)
      lobby.js           # Game lobby and settings
      match.js           # Active quiz battle
      result.js          # Game results and statistics
      gameover.js        # Game over screen
    modal/               # Modal screens
      settings.js        # Settings modal
  components/            # Reusable UI components
    QuestionCard.js      # Question display component
    Timer.js             # Timer components (circular & linear)
    ScoreBoard.js        # Live scoring display
    AnswerButton.js      # Interactive answer buttons
  context/               # Global state management
    GameContext.js       # Game state with FSM
  algorithms/            # Core logic (defense focus)
    fsm.js               # Finite state machine
    elo.js               # ELO rating system
  hooks/                 # Custom React hooks
    useTimer.js          # Timer management
  services/              # API or mock data
    quizService.js       # Question data and logic
  storage/               # Local storage
    storage.js           # Async storage helpers
  utils/                 # Helper functions
    helpers.js           # Common utilities
  tests/                 # Unit tests
    fsm.test.js          # FSM tests
    elo.test.js          # ELO system tests
    setup.js             # Test configuration
  assets/                # Images and fonts
  package.json           # Dependencies and scripts
  jest.config.js         # Test configuration
  babel.config.js        # Babel configuration
  app.json              # Expo configuration
  README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- React Native development environment (for iOS/Android)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quiz-battle-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:
```bash
# For iOS
npm run ios

# For Android
npm run android

# For Web
npm run web
```

## Game Flow

1. **Home Screen**: Browse categories and view recent scores
2. **Lobby**: Select category, difficulty, and opponent
3. **Match**: Answer questions within time limit
4. **Results**: View battle outcome, statistics, and achievements
5. **Profile**: Track progress, rankings, and unlock achievements

## Key Features Explained

### ELO Rating System
- Competitive ranking based on performance
- Points gained/lost based on opponent strength
- Persistent rating stored locally

### Game State Management
- Finite State Machine (FSM) for game flow
- React Context for global state
- Real-time score updates

### Timer System
- Visual countdown with color coding
- Circular and linear timer variants
- Automatic answer submission on timeout

### Question System
- Multiple choice questions
- Instant feedback on answers
- Category-based question pools

## Dependencies

- **React Native**: Mobile app framework
- **Expo**: Development platform and tools
- **React Navigation**: Navigation and routing
- **AsyncStorage**: Local data persistence
- **React Native Reanimated**: Smooth animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- Online multiplayer with real-time synchronization
- More question categories and difficulty levels
- Voice chat during battles
- Tournament mode
- Social features and friend system
- Leaderboards and global rankings
