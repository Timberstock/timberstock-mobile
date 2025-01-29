import { useApp } from '@/context/app/AppContext';
import { useUser } from '@/context/user/UserContext';
import { router } from 'expo-router';
import React, { createContext, useContext, useReducer } from 'react';
import { GuiaFormData } from '../guia-form/types';
import { ProductoFormData } from '../producto-form/types';
import { CreationService, GuiaDespachoIncomplete } from './services/creation';
import {
  GuiaCreationAction,
  GuiaCreationContextType,
  GuiaCreationState,
} from './types';

const initialState: GuiaCreationState = {
  currentStep: 'index',
  isSubmitting: false,
  error: null,
};

function guiaCreationReducer(
  state: GuiaCreationState,
  action: GuiaCreationAction
): GuiaCreationState {
  switch (action.type) {
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'RESET_CREATION':
      return initialState;

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

const GuiaCreationContext = createContext<GuiaCreationContextType | undefined>(
  undefined
);

export function GuiaCreationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(guiaCreationReducer, initialState);

  const {
    state: { empresa, localFiles },
  } = useApp();

  const {
    state: { user },
  } = useUser();

  const combineGuiaProductoForms = (
    precioUnitarioGuia: number,
    guiaForm: GuiaFormData,
    productoForm: ProductoFormData
  ): GuiaDespachoIncomplete => {
    const guiaDespachoIncomplete = CreationService.formatGuiaDespacho(
      precioUnitarioGuia,
      guiaForm,
      productoForm,
      empresa
    );

    return guiaDespachoIncomplete;
  };

  const submitGuia = async (
    guiaDespachoIncomplete: GuiaDespachoIncomplete
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      // Format that fucken' guia
      const guiaCreated = await CreationService.createGuia(
        guiaDespachoIncomplete,
        empresa,
        user!,
        localFiles
      );

      if (guiaCreated) {
        dispatch({ type: 'SET_SUBMITTING', payload: false });
        router.replace('/');
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const resetCreation = () => {
    dispatch({ type: 'RESET_CREATION' });
  };

  return (
    <GuiaCreationContext.Provider
      value={{
        state,
        submitGuia,
        combineGuiaProductoForms,
        resetCreation,
      }}
    >
      {children}
    </GuiaCreationContext.Provider>
  );
}

export function useGuiaCreation() {
  const context = useContext(GuiaCreationContext);
  if (context === undefined) {
    throw new Error('useGuiaCreation must be used within a GuiaCreationProvider');
  }
  return context;
}
