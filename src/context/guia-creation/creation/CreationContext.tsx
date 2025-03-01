import { useApp } from '@/context/app/AppContext';
import { useFolio } from '@/context/folio/FolioContext';
import { useUser } from '@/context/user/UserContext';
import { router } from 'expo-router';
import React, { createContext, useContext, useReducer } from 'react';
import { Alert } from 'react-native';
import { GuiaFormData } from '../guia-form/types';
import { ProductoFormData } from '../producto-form/types';
import { CreationService, GuiaDespachoIncomplete } from './services/creation';
import {
  GuiaCreationAction,
  GuiaCreationContextType,
  GuiaCreationState,
  StatusCallback,
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
    state: { empresa },
  } = useApp();

  const {
    state: { user },
  } = useUser();

  const { utilizarFolio } = useFolio();

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
    guiaDespachoIncomplete: GuiaDespachoIncomplete,
    onStatusChange?: StatusCallback
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      await CreationService.createGuia(
        guiaDespachoIncomplete,
        empresa,
        user!,
        onStatusChange
      );

      onStatusChange?.('Actualizando folio utilizado...');
      await utilizarFolio(guiaDespachoIncomplete.identificacion.folio);

      onStatusChange?.('Finalizando proceso...');
      router.replace('/');

      Alert.alert(
        `PDF creado correctamente para Guía con folio: ${guiaDespachoIncomplete.identificacion.folio}`,
        `Para compartirla o guardarla en Documentos, presione el botón de PDF de la guía respectiva en la pantalla de guías.`
      );
    } catch (error) {
      console.error('Error al crear la guía:', error);
      Alert.alert(
        'Error al crear la guía',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
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
