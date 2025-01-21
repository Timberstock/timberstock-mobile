import Loading from '@/components/Loading';
import AppProvider from '@/context/AppContext';
import UserContextProvider from '@/context/UserContext';
import { UserContext } from '@/context/UserContext';
import { SelectProvider } from '@mobile-reality/react-native-select-pro';
import auth from '@react-native-firebase/auth';
import { Redirect, Slot } from 'expo-router';
import { useContext, useEffect } from 'react';

function RootLayoutNav() {
  const { user, loading, updateUserAuth } = useContext(UserContext);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (inputUser) => {
      await updateUserAuth(inputUser);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Loading errorMessage="Intentando conectarse al servidor o buscando datos en cache" />
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SelectProvider>
      <AppProvider>
        {/* This is the way to render a a view that is neither a tab nor a stack (as per this route in particular, (tabs) will have its own layout)  with tabs navigation*/}
        <Slot screenOptions={{ headerShown: false }} />
      </AppProvider>
    </SelectProvider>
  );
}

export default function RootLayout() {
  return (
    <UserContextProvider>
      <RootLayoutNav />
    </UserContextProvider>
  );
}
