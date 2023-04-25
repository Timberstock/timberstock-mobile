import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './context/UserContext';
import auth from '@react-native-firebase/auth';
import { Usuario } from './interfaces/usuario';
import Login from './screens/Login';
import AppProvider from './context/AppContext';
import OverlayLoading from './resources/OverlayLoading';
import Loading from './components/Loading';

function AuthWrapper({ children }: any) {
  const { user, updateUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  // This is the Callback function passed to auth().onAuthStateChanged()
  // It will be called every time the auth state changes.
  const customOnAuthStateChangedCallback = async (
    inputUser: Usuario | null
  ) => {
    // IN CASE OF LOGIN
    if (inputUser) {
      await updateUser(inputUser);
    }
    // IN CASE OF LOGOUT
    else {
      await updateUser(null);
    }
  };

  useEffect(() => {
    // Used when unmounting component (not yet necessary)
    const unsubscribe = auth().onAuthStateChanged(
      customOnAuthStateChangedCallback
    );

    return () => {
      unsubscribe(); // unsubscribe on unmount
    };
  }, [updateUser]);

  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
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
