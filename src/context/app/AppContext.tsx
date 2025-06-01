import { useNetwork } from '@/context/network/NetworkContext';
import { useUser } from '@/context/user/UserContext';
import { LocalFilesService } from '@/services/LocalFilesService';
import firestore from '@react-native-firebase/firestore';
import * as Updates from 'expo-updates';
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { Alert } from 'react-native';
import { initialState } from './initialState';
import { appReducer } from './reducer';
import { AppService } from './service';
import { AppContextType } from './types';
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isUpdatePending, isUpdateAvailable } = Updates.useUpdates();
  const { isConnected } = useNetwork();

  const {
    state: { user },
    resetState,
  } = useUser();

  // Lift this up to component level so it's accessible everywhere
  const guiasUnsubscribeRef = useRef<() => void>();

  // Initial data load and guias listener setup
  useEffect(() => {
    if (user?.empresa_id) {
      // Using an IIFE to handle async operations
      (async () => {
        try {
          // Fetch empresa data
          await LocalFilesService.ensureLogoExists(user.empresa_id);
          await fetchAllEmpresaData();
        } catch (error) {
          console.error('Error in initial data load:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Error loading initial data' });
        }
      })();
    }

    return () => {
      console.log('🧹 [AppContext - Cleanup Effect]');
      if (guiasUnsubscribeRef.current) {
        guiasUnsubscribeRef.current();
      }
    };
  }, [user?.empresa_id]);

  useEffect(() => {
    if (isUpdateAvailable) {
      AppService.handleUpdateFound();
    }
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (isUpdatePending) {
      resetFirestoreAndReloadApp();
    }
  }, [isUpdatePending]);

  const fetchAllEmpresaData = async (withLoading = true): Promise<void> => {
    if (!user?.empresa_id) return;

    withLoading && dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // 1. Unsubscribe from current listener if exists
      if (guiasUnsubscribeRef.current) {
        guiasUnsubscribeRef.current();
      }

      // 2. Reset pagination state
      dispatch({ type: 'SET_HAS_MORE', payload: true });

      // 3. Fetch empresa data
      const [empresa, contratosCompra, contratosVenta] = await Promise.all([
        AppService.fetchEmpresa(user.empresa_id),
        AppService.fetchContratosCompra(user.empresa_id),
        AppService.fetchContratosVenta(user.empresa_id),
      ]);

      // 4. Set up new guias listener and wait for first data
      // We wrap the listener setup in a Promise to ensure we wait for the first data load
      // This is necessary because the listener callback can fire multiple times,
      // but we only want to consider the refresh complete after we get the first data
      // (which is why we add the resolve() after the first load)
      await new Promise<void>((resolve) => {
        let isFirstLoad = true; // Flag to track first load

        // Set up the real-time listener that will fire on every data change
        const unsubscribe = AppService.listenToGuias(user, (guias) => {
          // This callback will be called every time the data changes in Firestore
          dispatch({ type: 'SET_GUIAS', payload: guias });

          if (isFirstLoad) {
            // These operations should only happen once, on the first load
            dispatch({
              type: 'SET_EMPRESA_DATA',
              payload: { empresa, contratosCompra, contratosVenta },
            });
            dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
            dispatch({ type: 'SET_LOADING', payload: false });

            isFirstLoad = false; // Mark first load as complete
            resolve(); // Resolve the promise only on first load
          }
        });

        // Store the unsubscribe function immediately so we can clean up the listener later
        guiasUnsubscribeRef.current = unsubscribe;
      });
      // At this point, we've received the first data load and updated the UI
      // The listener remains active for future updates
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar los datos de la empresa');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadMoreGuias = async () => {
    if (
      !user?.empresa_id ||
      !state.guias.length ||
      state.isLoadingMore ||
      !state.hasMoreGuias
    ) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING_MORE', payload: true });

      const lastGuia = state.guias[state.guias.length - 1];
      const moreGuias = await AppService.fetchMoreGuias(user, lastGuia);

      if (moreGuias.length < 20) {
        dispatch({ type: 'SET_HAS_MORE', payload: false });
      }

      dispatch({
        type: 'APPEND_GUIAS',
        payload: moreGuias,
      });
    } catch (error) {
      console.error('Error loading more guias:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_MORE', payload: false });
    }
  };

  const resetFirestoreAndReloadApp = async () => {
    try {
      // 1. Unsubscribe from all listeners and reset states
      if (guiasUnsubscribeRef.current) {
        guiasUnsubscribeRef.current();
        guiasUnsubscribeRef.current = undefined;
      }

      // Reset both app and user states (user state preserves auth)
      dispatch({ type: 'RESET_STATE' });
      resetState();

      // 2. Clean up Firestore - but handle offline case
      if (isConnected) {
        await firestore().terminate();
        await firestore().clearPersistence();
      } else {
        console.log('📱 Offline mode detected - skipping clearPersistence');
        Alert.alert(
          'Sin conexión',
          'Al no estar conectado a internet, se conservarán los datos en cache'
        );
      }

      // 3. Set loading states before reload
      dispatch({ type: 'SET_LOADING', payload: true });

      // 4. Force a clean reload
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error resetting app:', error);
      Alert.alert('Error', 'No se pudo reiniciar la aplicación');
      // Ensure loading is false even on error
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: AppContextType = {
    state,
    fetchAllEmpresaData,
    loadMoreGuias,
    resetFirestoreAndReloadApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
