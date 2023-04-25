import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import CreateGuia from './src/screens/CreateGuia';
import { SelectProvider } from '@mobile-reality/react-native-select-pro';
import 'expo-dev-client';

import AddProductos from './src/screens/AddProductos';

import UserContextProvider from './src/context/UserContext';
import AuthWrapper from './src/AuthWrapper';

const Stack = createNativeStackNavigator();
// This works really weird, try playing with emulator and with index.js if doesn't work
// import firestore from '@react-native-firebase/firestore';
// firestore().useEmulator('localhost', 8080);

export default function App() {
  return (
    <UserContextProvider>
      <AuthWrapper>
        <SelectProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                options={{ headerShown: false }}
                component={Home}
              />
              <Stack.Screen
                name="CreateGuia"
                options={{ headerShown: false }}
                component={CreateGuia}
              />
              <Stack.Screen
                name="AddProductos"
                options={{ headerShown: false }}
                component={AddProductos}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SelectProvider>
      </AuthWrapper>
    </UserContextProvider>
  );
}
