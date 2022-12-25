import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Guias from './src/screens/Guias';
import CreateGuia from './src/screens/CreateGuia';
import { GuiaDespachoProps } from './src/interfaces/guias';
import { readGuias } from './src/functions/firebase';

const Stack = createNativeStackNavigator();

export default function App() {
  const [guias, setGuias] = useState<GuiaDespachoProps[]>([]);
  const rutEmpresa = '770685532';

  const GlobalState = {
    guias,
    setGuias,
    rutEmpresa,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Guias" options={{ headerShown: false }}>
          {(props) => <Guias {...props} GlobalState={GlobalState} />}
        </Stack.Screen>
        <Stack.Screen name="CreateGuia" options={{ headerShown: false }}>
          {(props) => <CreateGuia {...props} GlobalState={GlobalState} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
