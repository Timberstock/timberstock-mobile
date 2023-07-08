import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import CreateGuia from './src/screens/CreateGuia';
import { SelectProvider } from '@mobile-reality/react-native-select-pro';
import 'expo-dev-client';
import { StyleSheet, TouchableOpacity, View, Text, Alert } from 'react-native';

import AddProductos from './src/screens/AddProductos';

import UserContextProvider from './src/context/UserContext';
import AuthWrapper from './src/AuthWrapper';
import firestore from '@react-native-firebase/firestore';
import { logoutUser } from './src/functions/firebase/auth';

const Stack = createNativeStackNavigator();

// This works really weird, try playing with emulator and with index.js if doesn't work
// import firestore from '@react-native-firebase/firestore';
// firestore().useEmulator('localhost', 8080);

export default function App() {
  const deleteCache = async (): Promise<number> => {
    try {
      await logoutUser();
      await firestore().terminate();
      await firestore().clearPersistence();
      Alert.alert('Persistence cleared');
      return 200;
    } catch (error: any) {
      console.error('Could not enable persistence:', error);
      Alert.alert('Could not clear cache: ', error.code);
      return 400;
    }
  };
  const [clearCache, setClearCache] = React.useState(false);
  const [loadApp, setLoadApp] = React.useState(false);

  const handleLoadApp = () => {
    console.log('Loading the app...');
    setLoadApp(true);
    // Implement your app loading logic here
  };

  const handleClearCache = async () => {
    console.log('Clearing cache...');
    setClearCache(true);
    const result: number = await deleteCache();
    if (result === 200) {
      setClearCache(true);
      return;
    } else {
      setClearCache(false);
      return;
    }
  };

  if (!clearCache && !loadApp) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleLoadApp}>
          <Text style={styles.buttonText}>Load App</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (clearCache) {
    return null;
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
