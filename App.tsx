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

import AddProductos from './src/screens/AddProductos';

import AppProvider from './src/context/AppContext';

import UserContextProvider from './src/context/UserContext';
import AuthWrapper from './src/AuthWrapper';

const Stack = createNativeStackNavigator();
// This works really weird and I have to mess up with the emulator and with index.js here to be able to change from production to emulator (seems to).
// import firestore from '@react-native-firebase/firestore';
// firestore().useEmulator('localhost', 8080);

export default function App() {
  // If the user is logged in and it finished initializing, we show the app
  const GlobalState = {
    user: null,
    rutEmpresa: '',
  };

  return (
    <UserContextProvider>
      <AuthWrapper>
        <AppProvider>
          <SelectProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen name="Home" options={{ headerShown: false }}>
                  {(props) => <Home {...props} GlobalState={GlobalState} />}
                </Stack.Screen>
                <Stack.Screen
                  name="CreateGuia"
                  options={{ headerShown: false }}
                >
                  {(props) => (
                    <CreateGuia {...props} GlobalState={GlobalState} />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="AddProductos"
                  options={{ headerShown: false }}
                >
                  {(props) => (
                    <AddProductos {...props} GlobalState={GlobalState} />
                  )}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
          </SelectProvider>
        </AppProvider>
      </AuthWrapper>
    </UserContextProvider>
  );
}
