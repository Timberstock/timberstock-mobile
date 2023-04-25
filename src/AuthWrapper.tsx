import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './context/UserContext';
import auth from '@react-native-firebase/auth';
import { Usuario } from './interfaces/usuario';
import { fetchUserData } from './functions/firebase/auth';
import Loading from './components/Loading';
import Login from './screens/Login';

function AuthWrapper({ children }: any) {
  const { user, updateUser } = useContext(UserContext);
  //   const [loading, setLoading] = useState(true);
  console.log('User in AuthWrapper: ', user?.uid || user);

  // This "inputUser" is the user received by Firebase which is not actually
  // sent by us directly, but by Firebase auth whenever a method
  // auth().signIn{sign in mechanism}({token || email && password || phone number})
  // or auth().signOut() is called by us.
  // This means that we do not run this function directly but we pass our onAuthStateChanged
  // logic through this customOnAuthStateChanged function definition to auth().onAuthStateChanged()
  const customOnAuthStateChangedCallback = (inputUser: Usuario | null) => {
    // console.log('User received in customOnAuthStateChanged: ', inputUser);
    // IN CASE OF LOGIN
    if (inputUser) {
      updateUser(inputUser);
    }
    // IN CASE OF LOGOUT
    else {
      updateUser(null);
    }
    console.log('This should print two times');
    // if (loading) setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      customOnAuthStateChangedCallback
    );

    return () => {
      unsubscribe(); // unsubscribe on unmount
    };
  }, [updateUser]);

  // If the app is initializing, we wait
  //   if (loading) {
  //     return <Loading />;
  //   }

  // If the user is not logged in, we show the login screen
  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

export default AuthWrapper;
