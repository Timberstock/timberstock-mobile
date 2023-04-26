import React, { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from './context/UserContext';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Login from './screens/Login';
import AppProvider from './context/AppContext';
import Loading from './components/Loading';

function AuthWrapper({ children }: any) {
  const { user, updateUserAuth } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  // This is the Callback function passed to auth().onAuthStateChanged()
  // It will be called every time the auth state changes (Firebase Auth)
  const customOnAuthStateChangedCallback = (
    inputUser: FirebaseAuthTypes.User | null
  ) => {
    // IN CASE OF LOGIN
    if (inputUser) {
      updateUserAuth(inputUser);
    }
    // IN CASE OF LOGOUT
    else {
      updateUserAuth(null);
    }
  };

  useEffect(() => {
    // Used when unmounting component (not yet necessary)
    const unsubscribe = auth().onAuthStateChanged(
      // For some reason, this callback is called twice: one just mounted (inputUser==null when not previously logged in
      // or inputUser==previousUser otherwise), and another one which is the actual change (inputUser==newUser).
      // Seems to be expected behavior: https://stackoverflow.com/questions/37674823/firebase-android-onauthstatechanged-fire-twice-after-signinwithemailandpasswor
      customOnAuthStateChangedCallback
    );

    return () => {
      unsubscribe(); // unsubscribe on unmount
    };
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading && user) {
    return <Loading />;
  }

  // If the user is not logged in, we show the login screen
  if (!user) {
    return <Login />;
  }

  // If the user is logged in, we read the data according to the user and show the app
  return <AppProvider>{children}</AppProvider>;
}

export default AuthWrapper;
