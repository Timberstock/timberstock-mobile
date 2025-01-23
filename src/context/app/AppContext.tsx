import { useUser } from '@/context/user/UserContext';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Alert } from 'react-native';
import { initialState } from './initialState';
import { appReducer } from './reducer';
import { AppService } from './service';
import { AppContextType, GuiaDespachoSummary, LocalFile } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    state: { user },
  } = useUser();

  // Initial data load and guias listener setup
  useEffect(() => {
    let guiasUnsubscribe: (() => void) | undefined;

    if (user?.empresa_id) {
      // Using an IIFE to handle async operations
      (async () => {
        try {
          // 1. Load local files
          const localFiles = await loadLocalFiles(false);

          // 2. Fetch empresa data
          await fetchAllEmpresaData(false);

          // 3. Set up guias listener
          guiasUnsubscribe = AppService.listenToGuias(
            user.empresa_id,
            localFiles as LocalFile[],
            (guias) => {
              dispatch({ type: 'SET_GUIAS_SUMMARY', payload: guias });
            }
          );

          // Set loading to false after all operations are complete
          dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
          console.error('Error in initial data load:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Error loading initial data' });
        }
      })();
    }

    return () => {
      if (guiasUnsubscribe) {
        guiasUnsubscribe();
      }
    };
  }, [user?.empresa_id]);

  const fetchAllEmpresaData = async (withLoading = true) => {
    if (!user?.empresa_id) return;

    withLoading && dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [empresa, contratosCompra, contratosVenta] = await Promise.all([
        AppService.fetchEmpresa(user.empresa_id),
        AppService.fetchContratosCompra(user.empresa_id),
        AppService.fetchContratosVenta(user.empresa_id),
      ]);

      // Use a single action to update everything
      dispatch({
        type: 'SET_EMPRESA_DATA',
        payload: {
          empresa,
          contratosCompra,
          contratosVenta,
        },
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar los datos de la empresa');
      dispatch({ type: 'SET_ERROR', payload: 'Error loading data' });
    } finally {
      withLoading && dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadLocalFiles = async (withLoading = true) => {
    if (!user?.empresa_id) return;
    withLoading && dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const files = await AppService.loadLocalFiles(user.empresa_id);
      dispatch({ type: 'SET_LOCAL_FILES', payload: files });
      return files;
    } catch (error) {
      console.error('Error loading local files:', error);
      Alert.alert('Error', 'No se pudo cargar los archivos locales');
      dispatch({ type: 'SET_ERROR', payload: 'Error loading local files' });
    } finally {
      withLoading && dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const shareGuiaPDF = async (guia: GuiaDespachoSummary): Promise<void> => {
    await AppService.shareGuiaPDF(guia.folio.toString(), state.localFiles);
  };

  const value: AppContextType = {
    state,
    fetchAllEmpresaData,
    shareGuiaPDF,
    handleUpdateAvailable: AppService.checkForUpdates,
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
