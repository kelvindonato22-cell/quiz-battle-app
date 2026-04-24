import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchmakingBattleApp from './MatchmakingBattleApp';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuizBattle" component={MatchmakingBattleApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
