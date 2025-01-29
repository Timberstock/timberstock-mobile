import { useUser } from '@/context/user/UserContext';
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { Alert } from 'react-native';
import { initialState } from './initialState';
import { appReducer } from './reducer';
import { AppService } from './service';
import { AppContextType, GuiaDespachoState } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    state: { user },
  } = useUser();

  // Lift this up to component level so it's accessible everywhere
  const guiasUnsubscribeRef = useRef<(() => void) | undefined>();

  // Initial data load and guias listener setup
  useEffect(() => {
    if (user?.empresa_id) {
      // Using an IIFE to handle async operations
      (async () => {
        try {
          // 1. Load local files
          const localFiles = await loadLocalFiles(false);

          // 2. Fetch empresa data
          await fetchAllEmpresaData(false);

          // 3. Set up guias listener
          guiasUnsubscribeRef.current = AppService.listenToGuias(
            user,
            localFiles,
            (guias) => {
              dispatch({ type: 'SET_GUIAS', payload: guias });
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          );
        } catch (error) {
          console.error('Error in initial data load:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Error loading initial data' });
        }
      })();
    }

    return () => {
      if (guiasUnsubscribeRef.current) {
        guiasUnsubscribeRef.current();
      }
    };
  }, [user?.empresa_id]);

  const fetchAllEmpresaData = async (withLoading = true) => {
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
      const [empresa, contratosCompra, contratosVenta, localFiles] = await Promise.all([
        AppService.fetchEmpresa(user.empresa_id),
        AppService.fetchContratosCompra(user.empresa_id),
        AppService.fetchContratosVenta(user.empresa_id),
        loadLocalFiles(false),
      ]);

      // 4. Set up new guias listener
      guiasUnsubscribeRef.current = AppService.listenToGuias(
        user,
        localFiles,
        (guias) => {
          dispatch({ type: 'SET_GUIAS', payload: guias });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      );

      // 5. Update empresa data
      dispatch({
        type: 'SET_EMPRESA_DATA',
        payload: {
          empresa,
          contratosCompra,
          contratosVenta,
        },
      });

      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar los datos de la empresa');
    } finally {
      withLoading && dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadLocalFiles = async (withLoading = true) => {
    if (!user?.empresa_id) return [];
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
    return [];
  };

  const shareGuiaPDF = async (guia: GuiaDespachoState): Promise<void> => {
    await AppService.shareGuiaPDF(
      guia.identificacion.folio.toString(),
      state.localFiles
    );
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
      const moreGuias = await AppService.fetchMoreGuias(
        user,
        state.localFiles,
        lastGuia
      );

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

  const value: AppContextType = {
    state,
    fetchAllEmpresaData,
    shareGuiaPDF,
    loadMoreGuias,
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
