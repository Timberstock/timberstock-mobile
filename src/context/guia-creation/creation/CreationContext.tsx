import { useApp } from '@/context/app/AppContext';
import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { ContratoVenta } from '@/context/app/types/contratoVenta';
import React, { createContext, useContext, useReducer } from 'react';
import { GuiaFormData } from '../guia-form/types';
import { ProductoFormData } from '../producto-form/types';
// import { GuiaCreationService } from './service';
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
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
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
    state: { contratosCompra, contratosVenta },
  } = useApp();

  const submitGuia = async () => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      // This will be implemented later when we have the form contexts
      // const guiaData = await collectGuiaData();
      // await validateGuiaData(guiaData);
      // await submitGuiaToFirebase(guiaData);

      // For now, just a placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const moveToNextStep = (
    nextStepResetFunction: (
      contratoCompra?: ContratoCompra,
      contratoVenta?: ContratoVenta
    ) => void,
    guiaForm?: GuiaFormData,
    productoForm?: ProductoFormData
  ) => {
    switch (state.currentStep) {
      case 'index':
        dispatch({ type: 'SET_STEP', payload: 'guia-form' });
        break;
      case 'guia-form':
        // if (!contratoVenta || !contratoCompra) {
        //   Alert.alert('Error', 'No se encontró contrato vigente');
        //   return;
        // }

        // nextStepResetFunction(contratoCompra, contratoVenta);

        dispatch({ type: 'SET_STEP', payload: 'producto-form' });
        break;
      case 'producto-form':
        dispatch({ type: 'SET_STEP', payload: 'preview' });
        break;
    }
  };

  const moveToPreviousStep = () => {
    dispatch({ type: 'SET_STEP', payload: 'index' });
  };

  const resetCreation = () => {
    dispatch({ type: 'RESET_CREATION' });
  };

  return (
    <GuiaCreationContext.Provider
      value={{
        state,
        moveToNextStep,
        moveToPreviousStep,
        submitGuia,
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

// const handleNavigateToCreateGuiaProductos = () => {
//   if (!isGuiaValid(guia, options)) {
//     alert('Debes llenar todos los campos');
//     return;
//   }

//   const { contratoVenta, productosOptions } = parseProductosFromContratos(
//     contratosCompra,
//     contratosVenta,
//     guia
//   );

//   // Get the corresponding faena from the selected destino_contrato from the cliente selected
//   const faenaContratoVenta = contratoVenta?.cliente.destinos_contrato
//     .find((destino) => destino.nombre === guia.destino.nombre)
//     ?.faenas.find((faena) => faena.rol === guia.predio_origen.rol);

//   guia.codigo_fsc = faenaContratoVenta?.codigo_fsc || '';
//   guia.codigo_contrato_externo = faenaContratoVenta?.codigo_contrato_externo || '';
//   guia.contrato_venta_id = contratoVenta?.firestoreID || '';
//   guia.receptor.giro = contratoVenta?.cliente.giro || '';

//   if (!productosOptions || productosOptions.length === 0) {
//     alert('No hay productos asociados a esta combinación');
//     return;
//   }

//   if (!guia.contrato_venta_id) {
//     Alert.alert(
//       'Error',
//       'No se encontró contrato de venta vigente para esta combinación cliente-destino-origen-producto'
//     );
//     return;
//   }

//   guia.emisor = {
//     razon_social: empresa.razon_social,
//     rut: empresa.rut,
//     giro: empresa.giro,
//     direccion: empresa.direccion,
//     comuna: empresa.comuna,
//     actividad_economica: empresa.actividad_economica,
//   };

//   // Clean up the observaciones array from empty strings
//   guia.observaciones = guia.observaciones?.filter((obs) => obs !== '');

//   console.log(guia);
//   console.log(productosOptions);

//   router.push('datos-producto');
//   return;
// };
