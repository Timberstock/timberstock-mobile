import { useApp } from '@/context/app/AppContext';
import { GuiaDespachoState } from '@/context/app/types';
import { useUser } from '@/context/user/UserContext';
import { globals } from '@/utils/globals';
import React, { createContext, useContext, useReducer } from 'react';
import { Alert } from 'react-native';
import { guiaFormInitialState, guiaFormOptionsInitialState } from './initialState';
import { guiaFormReducer } from './reducer';
import { SelectorService } from './service';
import {
  GuiaFormContextType,
  GuiaFormData,
  GuiaFormOptions,
  GuiaFormState,
} from './types';

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
    value: GuiaFormData[keyof GuiaFormData]
  ) => {
    globals.startTime = Date.now();
    globals.lastTime = globals.startTime;
    globals.logTimeDelta('GuiaFormContext-Start');

    let selectionResult;
    // Handle special field selections
    switch (field) {
      case 'proveedor': {
        globals.logTimeDelta('Before-ProveedorSelection');

        selectionResult = SelectorService.handleProveedorSelection(
          value as GuiaFormOptions['proveedores'][number] | null,
          contratosCompra
        );

        globals.logTimeDelta('After-ProveedorSelection');
        break;
      }

      case 'faena':
        selectionResult = SelectorService.handleFaenaSelection(
          value as GuiaFormOptions['faenas'][number] | null,
          state.guia.proveedor!,
          contratosCompra
        );
        break;

      case 'cliente':
        selectionResult = SelectorService.handleClienteSelection(
          value as GuiaFormOptions['clientes'][number] | null
        );
        break;

      case 'destino_contrato':
        selectionResult = SelectorService.handleDestinoContratoSelection(
          value as GuiaFormOptions['destinos_contrato'][number] | null,
          contratosVenta,
          state.guia.faena,
          state.guia.cliente!
        );

        break;

      case 'transporte_empresa':
        selectionResult = SelectorService.handleTransporteEmpresaSelection(
          value as GuiaFormOptions['transporte_empresas'][number] | null
        );
        break;

      default:
        // For simple fields like identificacion_folio, identificacion_tipo_despacho, identificacion_tipo_traslado, transporte_empresa_chofer, transporte_empresa_camion, transporte_empresa_carro, servicios_carguio_empresa, servicios_cosecha_empresa
        selectionResult = { newData: { [field]: value }, newOptions: {} };
    }

    globals.logTimeDelta('Before-Dispatch');

    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        field,
        value,
        selectionResult,
      },
    });

    globals.logTimeDelta('After-Dispatch');
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
      'cliente',
      'faena',
      'destino_contrato',
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

  const resetForm = (returnState: boolean = false) => {
    // Parse folios from user
    const initFolios = user!.folios_reservados
      .sort((a, b) => a - b)
      .map((folio) => ({ value: folio, label: folio.toString() }));
    // Parse proveedores from contratosCompra
    const initProveedores = contratosCompra
      .reduce(
        (proveedores: GuiaFormOptions['proveedores'], contrato) => {
          if (!proveedores.some((p) => p.rut === contrato.proveedor.rut)) {
            proveedores.push(contrato.proveedor);
          }
          return proveedores;
        },
        // init empty array
        []
      )
      .sort((a, b) => a.razon_social.localeCompare(b.razon_social));

    const resetState: GuiaFormState = {
      guia: { ...guiaFormInitialState },
      options: {
        ...guiaFormOptionsInitialState,
        identificacion_folios: initFolios,
        proveedores: initProveedores,
      },
    };
    if (returnState) {
      return resetState;
    } else {
      dispatch({ type: 'RESET_VIEW', payload: resetState });
    }
  };

  const repetirGuia = (guia: GuiaDespachoState): boolean => {
    const validation = SelectorService.validateRepetirGuia(
      guia,
      contratosCompra,
      contratosVenta
    );

    if (!validation.isValid) {
      Alert.alert('No se puede copiar esta guía');
      return false;
    }

    const resetState = resetForm(true);
    const { templateFormData, templateFormOptions } =
      SelectorService.initFromGuiaTemplate(
        guia,
        contratosCompra,
        contratosVenta,
        resetState!
      );

    dispatch({
      type: 'RESET_VIEW',
      payload: {
        guia: {
          ...templateFormData,
        },
        options: {
          ...templateFormOptions,
        },
      },
    });

    return true;
  };

  return (
    <GuiaFormContext.Provider
      value={{
        state,
        updateField,
        updateObservacionField,
        isFormValid,
        resetForm,
        repetirGuia,
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
