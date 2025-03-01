import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
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

  // Move userDataUnsubscribe to ref so it's accessible across the component
  const userDataUnsubscribeRef = useRef<(() => void) | undefined>();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // This is triggered two times which is normal behavior, 1. initial check -> 2. refresh of auth token
        console.log('👤 [User signed in]', firebaseUser.uid);

        // Clean up previous listener if it exists
        if (userDataUnsubscribeRef.current) {
          console.log('🧹 [Cleaning up previous listener]');
          userDataUnsubscribeRef.current();
        }

        // Set up real-time listener for user data
        userDataUnsubscribeRef.current = firestore()
          .collection('usuarios')
          .doc(firebaseUser.uid)
          .onSnapshot(
            {
              // Include metadata changes to detect offline/online state
              includeMetadataChanges: true,
            },
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

                // If we're offline and this is from cache, don't update sync status
                if (!doc.metadata.fromCache) {
                  await UserService.updateUserSyncStatusAndLastLogin(syncedUserData);
                }

                dispatch({
                  type: 'SET_USER',
                  payload: {
                    ...syncedUserData,
                    firebaseAuth: firebaseUser,
                  },
                });
              } else if (doc.metadata.fromCache) {
                // If document doesn't exist and we're offline, create a minimal user object
                // TODO: NOT SURE ABOUT THIS
                console.log('📱 Offline mode - Using minimal user object');
                dispatch({
                  type: 'SET_USER',
                  payload: {
                    id: firebaseUser.uid,
                    admin: false,
                    cafs: [],
                    email: firebaseUser.email || '',
                    empresa_id: '',
                    folios_reservados: [],
                    last_login: new Date() as any,
                    nombre: firebaseUser.displayName || '',
                    rut: '',
                    superadmin: false,
                    firebaseAuth: firebaseUser,
                  },
                });
              }
              dispatch({ type: 'SET_LOADING', payload: false });
              // router.replace('/(tabs)');
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
        if (userDataUnsubscribeRef.current) {
          userDataUnsubscribeRef.current();
          userDataUnsubscribeRef.current = undefined;
        }
        router.replace('/(auth)');
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => {
      console.log('🧹 [UserContext - Cleanup Effect]');
      unsubscribe();
      if (userDataUnsubscribeRef.current) {
        userDataUnsubscribeRef.current();
      }
    };
  }, []);

  const resetState = () => {
    // Unsubscribe from user document listener if it exists
    if (userDataUnsubscribeRef.current) {
      userDataUnsubscribeRef.current();
      userDataUnsubscribeRef.current = undefined;
    }

    // Reset state but preserve the user auth state
    const currentUser = state.user?.firebaseAuth || null;
    dispatch({ type: 'RESET_STATE', payload: currentUser });
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Login with email and password
      const loginResult = await UserService.login(email, password);
      if (loginResult !== 'success') {
        dispatch({ type: 'SET_ERROR', payload: loginResult });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
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
    resetState,
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
