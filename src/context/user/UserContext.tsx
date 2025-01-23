import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { userReducer } from './reducer';
import { UserService } from './service';
import { UserContextType, UserFirestore } from './types';

// Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    loading: true,
    error: null,
    lastSync: null,
  });

  useEffect(() => {
    let userDataUnsubscribe: (() => void) | undefined;

    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      console.log('🔍 [Auth State Changed]', firebaseUser?.uid);

      if (firebaseUser) {
        // This is triggered two times which is normal behavior, 1. initial check -> 2. refresh of auth token
        console.log('👤 [User signed in]', firebaseUser.uid);

        // Clean up previous listener if it exists
        if (userDataUnsubscribe) {
          console.log('🧹 [Cleaning up previous listener]');
          // Hence, due to the two listeners being created, we need to clean up the previous one
          userDataUnsubscribe();
        }

        // Set up real-time listener for user data
        userDataUnsubscribe = firestore()
          .collection('usuarios')
          .doc(firebaseUser.uid)
          .onSnapshot(
            async (doc) => {
              console.log('📥 [Snapshot Update]', {
                exists: doc.exists,
                data: doc.data(),
                metadata: {
                  hasPendingWrites: doc.metadata.hasPendingWrites,
                  fromCache: doc.metadata.fromCache,
                },
              });

              if (doc.exists) {
                const syncedUserData = doc.data() as UserFirestore;
                syncedUserData.id = firebaseUser.uid;
                console.log('User folios: ', syncedUserData.folios_reservados);
                await UserService.updateUserSyncStatusAndLastLogin(syncedUserData);
                dispatch({
                  type: 'SET_USER',
                  payload: {
                    ...syncedUserData,
                    firebaseAuth: firebaseUser,
                  },
                });
              }
              dispatch({ type: 'SET_LOADING', payload: false });
              router.replace('/(tabs)');
            },
            (error) => {
              console.error('❌ [Snapshot Error]:', error);
              dispatch({
                type: 'SET_ERROR',
                payload: 'Error en sincronización de datos',
              });
              // We want to finish loading here if there is an error
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          );
      } else {
        console.log('👋 [User signed out]');
        if (userDataUnsubscribe) {
          userDataUnsubscribe();
          userDataUnsubscribe = undefined;
        }
        router.replace('/(auth)');
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => {
      console.log('♻️ [Cleanup Effect]');
      unsubscribe();
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Login with email and password
      const loginResult = await UserService.login(email, password);
      if (loginResult !== 'success') {
        throw new Error(loginResult);
      }
      // If login is successful, we will wait for the user data to be fetched in the listener
      // hence we don't want to set loading to false prematurely here
    } catch (error) {
      console.error(error);
      dispatch({ type: 'SET_ERROR', payload: 'Error en inicio de sesión' });
      // We only want to finish loading here if the login failed
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await UserService.logout();
    } catch (error) {
      console.error(error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cerrar sesión' });
    }
  };

  const value: UserContextType = {
    state,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
