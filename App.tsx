import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import Guias from './src/screens/Guias';
import CreateGuia from './src/screens/CreateGuia';
import Login from './src/screens/Login';
import { GuiaDespachoProps } from './src/interfaces/guias';
import 'expo-dev-client';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [guias, setGuias] = useState<GuiaDespachoProps[]>([]);
  const rutEmpresa = '770685532';

  const GlobalState = {
    guias,
    setGuias,
    rutEmpresa,
  };

  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  if (!user) {
    return <Login />;
  }

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
