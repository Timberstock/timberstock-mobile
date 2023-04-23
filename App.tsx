import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import Home from './src/screens/Home';
import CreateGuia from './src/screens/CreateGuia';
import Login from './src/screens/Login';
import { SelectProvider } from '@mobile-reality/react-native-select-pro';
import 'expo-dev-client';
import { Usuario } from './src/interfaces/usuario';

import { fetchUserData } from './src/functions/firebase/auth';

import { foliosDummy } from './src/resources/dummyData';
import AddProductos from './src/screens/AddProductos';

import AppProvider from './src/AppContext';

const Stack = createNativeStackNavigator();
// This works really weird and I have to mess up with the emulator and with index.js here to be able to change from production to emulator (seems to).
// import firestore from '@react-native-firebase/firestore';
// firestore().useEmulator('localhost', 8080);

export default function App() {
  // TODO ADD REACT NATIVE UI COMPONENT LIBRARY
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<Usuario | null>();
  const [rutEmpresa, setRutEmpresa] = useState('');

  const onAuthStateChanged = async (inputUser: Usuario | null) => {
    // IN CASE OF LOGIN
    if (inputUser) {
      const userData = await fetchUserData(inputUser.uid);
      inputUser.nombre = userData?.nombre;
      inputUser.empresa_id = userData?.empresa_id;
      inputUser.rut = userData?.rut;
      setUser(inputUser);
      setRutEmpresa(userData?.empresa_id);
    }
    // IN CASE OF LOGOUT
    else {
      setUser(null);
      setRutEmpresa('');
    }
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  if (!user) {
    return <Login />;
  }

  const GlobalState = {
    user,
    rutEmpresa,
  };

  return (
    <AppProvider>
      <SelectProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" options={{ headerShown: false }}>
              {(props) => <Home {...props} GlobalState={GlobalState} />}
            </Stack.Screen>
            <Stack.Screen name="CreateGuia" options={{ headerShown: false }}>
              {(props) => <CreateGuia {...props} GlobalState={GlobalState} />}
            </Stack.Screen>
            <Stack.Screen name="AddProductos" options={{ headerShown: false }}>
              {(props) => <AddProductos {...props} GlobalState={GlobalState} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SelectProvider>
    </AppProvider>
  );
}
