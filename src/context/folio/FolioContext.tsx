import { useUser } from '@/context/user/UserContext';
import React, { createContext, useContext, useReducer } from 'react';
import { folioReducer } from './reducer';
import { FolioService } from './service';
import { FolioContextType, FolioState } from './types';

const initialState: FolioState = {
  loading: false,
  error: null,
  lastSync: null,
  syncStatus: 'synced',
};

export const FolioContext = createContext<FolioContextType | undefined>(undefined);

export function FolioProvider({ children }: { children: React.ReactNode }) {
  const {
    state: { user },
  } = useUser();
  const [state, dispatch] = useReducer(folioReducer, initialState);

  const reserveFolios = async (cantidad: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      const result = await FolioService.reserveFoliosForUser(cantidad, user);

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Error al reservar folios');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const liberarFolios = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      return await FolioService.liberarFolios(user.id);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: FolioContextType = {
    state,
    reserveFolios,
    liberarFolios,
  };

  return <FolioContext.Provider value={value}>{children}</FolioContext.Provider>;
}

export const useFolio = () => {
  const context = useContext(FolioContext);
  if (!context) {
    throw new Error('useFolio must be used within a FolioProvider');
  }
  return context;
};
