import { useApp } from '@/context/app/AppContext';
import React, { createContext, useContext, useReducer } from 'react';
import { Alert } from 'react-native';
import { useGuiaForm } from '../guia-form/GuiaFormContext';
import { productoFormInitialState } from './initialState';
import { productoFormReducer } from './reducer';
import { Calculator } from './services/calculator';
import { ParserService } from './services/parser';
import {
  ProductoFormContextType,
  ProductoFormData,
  ProductoFormOptions,
} from './types';

const ProductoFormContext = createContext<ProductoFormContextType | undefined>(
  undefined
);

export function ProductoFormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productoFormReducer, productoFormInitialState);
  const {
    state: { guia: guiaForm },
  } = useGuiaForm();

  const {
    state: { contratosCompra, contratosVenta },
  } = useApp();

  const updateTipo = (tipo: string | null) => {
    const selectionResult = {
      newTipo: tipo,
      newOptions: {
        ...state.options,
        productos: ParserService.parseProductosOptions(
          guiaForm,
          contratosCompra,
          contratosVenta
        ).filter((producto) => producto.tipo === tipo),
      },
    };

    dispatch({
      type: 'UPDATE_TIPO',
      payload: selectionResult,
    });
  };

  const updateProductoInfo = (
    producto: ProductoFormOptions['productos'][number] | null
  ) => {
    dispatch({
      type: 'UPDATE_PRODUCTO_INFO',
      payload: producto,
    });
  };

  const updateClasesDiametricas = (clase?: string, cantidad?: number) => {
    const volumen_emitido = Number(
      Calculator.volumenClaseDiametrica(
        clase!,
        cantidad!,
        state.productoForm.info!.largo!
      ).toFixed(4)
    );

    dispatch({
      type: 'UPDATE_CLASES_DIAMETRICAS',
      payload: {
        item: {
          clase: clase,
          cantidad: cantidad,
          volumen_emitido: volumen_emitido,
        },
      },
    });
  };

  const updateBancos = (
    index: number,
    dimension: keyof NonNullable<ProductoFormData['bancos']>[number],
    value: number
  ) => {
    const banco = state.productoForm.bancos![index];
    banco[dimension] = value;
    banco.volumen_banco = Number(
      Calculator.volumenBanco(
        banco.altura1!,
        banco.altura2!,
        banco.ancho!,
        state.productoForm.info!.largo!
      ).toFixed(4)
    );

    dispatch({
      type: 'UPDATE_BANCOS',
      payload: { index, item: banco },
    });
  };

  const isFormValid = () => {
    const { tipo, info, clases_diametricas_guia, bancos } = state.productoForm;

    if (!tipo || !info) return false;

    if (
      tipo === 'Aserrable' &&
      (!clases_diametricas_guia?.length ||
        !clases_diametricas_guia.some((cd) => cd.cantidad_emitida > 0))
    ) {
      return false;
    }

    if (
      tipo === 'Pulpable' &&
      (!bancos?.length || !bancos.some((b) => b.volumen_banco > 0))
    ) {
      return false;
    }

    let allow = false;
    // Check if the user has entered any value in the products actual values
    if (tipo === 'Aserrable') {
      for (const claseDiametrica of clases_diametricas_guia || []) {
        if (claseDiametrica.cantidad_emitida !== 0) {
          // If any aserrable product has any valid clase diametrica, allow
          allow = true;
          break;
        }
      }
    } else if (tipo === 'Pulpable') {
      for (const value of bancos || []) {
        if (value.altura1 !== 0 && value.altura2 !== 0 && value.ancho !== 0) {
          // If any pulpable product has any valid banco, allow
          allow = true;
          break;
        }
      }
    }
    if (!allow)
      Alert.alert('Error', 'No se puede crear una guía con todos los valores en 0');

    return allow;
  };

  const resetForm = () => {
    const allProductos = ParserService.parseProductosOptions(
      guiaForm,
      contratosCompra,
      contratosVenta
    );

    const tiposOptions = ParserService.parseTiposOptions(allProductos);

    dispatch({
      type: 'RESET_VIEW',
      payload: {
        newData: {
          ...productoFormInitialState.productoForm,
        },
        newOptions: { tipos: tiposOptions, productos: allProductos },
      },
    });
  };

  return (
    <ProductoFormContext.Provider
      value={{
        state,
        updateTipo,
        updateProductoInfo,
        updateClasesDiametricas,
        updateBancos,
        isFormValid,
        resetForm,
      }}
    >
      {children}
    </ProductoFormContext.Provider>
  );
}

export function useProductoForm() {
  const context = useContext(ProductoFormContext);
  if (context === undefined) {
    throw new Error('useProductoForm must be used within a ProductoFormProvider');
  }
  return context;
}
