import { useApp } from '@/context/app/AppContext';
import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { useUser } from '@/context/user/UserContext';
import React, { createContext, useContext, useReducer } from 'react';
import { guiaFormInitialState, guiaFormOptionsInitialState } from './initialState';
import { guiaFormReducer } from './reducer';
import { ParserService } from './services/parser';
import { SelectorService } from './services/selector';
import { GuiaFormContextType, GuiaFormData, SelectorOption } from './types';

const GuiaFormContext = createContext<GuiaFormContextType | undefined>(undefined);

export function GuiaFormProvider({ children }: { children: React.ReactNode }) {
  const {
    state: { contratosCompra, contratosVenta },
  } = useApp();
  const {
    state: { user },
  } = useUser();
  const [state, dispatch] = useReducer(guiaFormReducer, {
    guia: guiaFormInitialState,
    options: guiaFormOptionsInitialState,
  });

  const updateField = (
    field: keyof GuiaFormData,
    value: SelectorOption['optionObject'] | null
  ) => {
    let selectionResult;

    // Handle special field selections
    switch (field) {
      case 'proveedor':
        selectionResult = SelectorService.handleProveedorSelection(
          value as ContratoCompra['proveedor'] | null,
          contratosCompra
        );
        break;

      case 'predio_origen':
        selectionResult = SelectorService.handlePredioSelection(
          value as ContratoCompra['faena'] | null,
          state.guia.proveedor as ContratoCompra['proveedor'],
          contratosCompra
        );
        break;

      case 'receptor':
        selectionResult = SelectorService.handleReceptorSelection(
          value as ContratoCompra['clientes'][number] | null
        );
        break;

      case 'destino':
        selectionResult = SelectorService.handleDestinoSelection(
          value as
            | ContratoCompra['clientes'][number]['destinos_contrato'][number]
            | null,
          contratosVenta,
          state.guia.predio_origen,
          state.guia.receptor
        );

        break;

      case 'transporte_empresa':
        selectionResult = SelectorService.handleTransporteEmpresaSelection(
          value as
            | ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]
            | null
        );
        break;

      default:
        console.log('🔄 Entering default');
        console.log(field);
        console.log(value);
        // For simple fields like identificacion_folio, identificacion_tipo_despacho, identificacion_tipo_traslado, transporte_empresa_chofer, transporte_empresa_camion, transporte_empresa_carro, servicios_carguio_empresa, servicios_cosecha_empresa
        selectionResult = { newData: { [field]: value }, newOptions: {} };
    }

    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        field,
        value,
        selectionResult,
      },
    });
  };

  const updateObservacionField = (
    mode: 'add' | 'update' | 'remove',
    observacion_index?: number,
    observacion?: string
  ) => {
    switch (mode) {
      case 'add':
        dispatch({
          type: 'UPDATE_FIELD',
          payload: {
            field: 'observaciones',
            value: state.guia.observaciones ? [...state.guia.observaciones, ''] : [''],
          },
        });
        break;
      case 'update':
        observacion_index &&
          observacion &&
          dispatch({
            type: 'UPDATE_FIELD',
            payload: {
              field: 'observaciones',
              value: state.guia.observaciones
                ? [
                    ...state.guia.observaciones.slice(0, observacion_index),
                    observacion,
                    ...state.guia.observaciones.slice(observacion_index + 1),
                  ]
                : [observacion],
            },
          });
        break;
      case 'remove':
        observacion_index &&
          dispatch({
            type: 'UPDATE_FIELD',
            payload: {
              field: 'observaciones',
              value: state.guia.observaciones
                ? state.guia.observaciones.filter(
                    (_, index) => index !== observacion_index
                  )
                : [],
            },
          });
        break;
    }
  };

  const isFormValid = () => {
    const requiredFields: (keyof GuiaFormData)[] = [
      'identificacion_folio',
      'identificacion_tipo_despacho',
      'identificacion_tipo_traslado',
      'proveedor',
      'receptor',
      'predio_origen',
      'destino',
      'transporte_empresa',
      'transporte_empresa_chofer',
      'transporte_empresa_camion',
      'transporte_empresa_carro',
      'contrato_compra_id',
      'contrato_venta_id',
    ];

    console.log('🔍 Validating form fields...');
    const invalidFields = requiredFields.filter((field) => {
      const valid = state.guia[field] !== null && state.guia[field] !== undefined;
      if (!valid) {
        console.log(`❌ Field "${field}" is missing or invalid`);
      }
      return !valid;
    });

    const isValid = invalidFields.length === 0;
    console.log(
      isValid
        ? '🎉 Form is valid!'
        : `⚠️ Form is invalid. Missing ${invalidFields.length} fields`
    );

    return isValid;
  };

  const resetForm = () => {
    const resetState = {
      guia: { ...guiaFormInitialState },
      options: {
        ...guiaFormOptionsInitialState,
        identificacion_folios: ParserService.parseFoliosOptions(
          user!.folios_reservados
        ),
        proveedores: ParserService.parseProveedoresOptions(contratosCompra),
      },
    };
    dispatch({ type: 'RESET_VIEW', payload: resetState });
  };

  return (
    <GuiaFormContext.Provider
      value={{
        state,
        updateField,
        updateObservacionField,
        isFormValid,
        resetForm,
      }}
    >
      {children}
    </GuiaFormContext.Provider>
  );
}

export function useGuiaForm() {
  const context = useContext(GuiaFormContext);
  if (context === undefined) {
    throw new Error('useGuiaForm must be used within a GuiaFormProvider');
  }
  return context;
}
