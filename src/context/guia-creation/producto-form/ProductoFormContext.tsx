import { useApp } from '@/context/app/AppContext';
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { useGuiaForm } from '../guia-form/GuiaFormContext';
import { productoFormInitialState } from './initialState';
import { productoFormReducer } from './reducer';
import { Calculator } from './services/calculator';
import { ParserService } from './services/parser';
import { ProductoFormContextType, ProductoFormData, SelectorOption } from './types';

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

  const updateTipo = useCallback(
    (tipo: 'Aserrable' | 'Pulpable' | null) => {
      const selectionResult = {
        newTipo: tipo,
        newOptions: {
          ...state.options,
          productos: ParserService.parseProductosOptions(
            guiaForm,
            contratosCompra,
            contratosVenta
          ).filter((producto) => producto.optionObject?.tipo === tipo),
        },
      };

      dispatch({
        type: 'UPDATE_TIPO',
        payload: selectionResult,
      });
    },
    [guiaForm, contratosCompra, contratosVenta]
  );

  const updateProductoInfo = (producto: SelectorOption<ProductoFormData> | null) => {
    console.log('🔄 Updating producto info');
    console.log(producto);
    dispatch({
      type: 'UPDATE_PRODUCTO_INFO',
      payload: producto,
    });
  };

  const updateClasesDiametricas = (clase?: string, cantidad?: number) => {
    const volumen_emitido = Calculator.volumenClaseDiametrica(
      clase!,
      cantidad!,
      state.productoForm.info!.largo!
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

  const updateBancos = useCallback(
    (
      index: number,
      dimension: keyof NonNullable<ProductoFormData['bancos']>[number],
      value: number
    ) => {
      const banco = state.productoForm.bancos![index];
      banco[dimension] = value;
      banco.volumen_banco = Calculator.volumenBanco(
        banco.altura1!,
        banco.altura2!,
        banco.ancho!,
        state.productoForm.info!.largo!
      );

      dispatch({
        type: 'UPDATE_BANCOS',
        payload: { index, item: banco },
      });
    },
    [state.productoForm.bancos, state.productoForm.info?.largo]
  );

  const isFormValid = useCallback(() => {
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

    return true;
  }, [state.productoForm]);

  const resetForm = () => {
    console.log('🔄 Resetting producto form');
    const productos = ParserService.parseProductosOptions(
      guiaForm,
      contratosCompra,
      contratosVenta
    );

    const tipos = ParserService.parseTiposOptions(productos);

    dispatch({
      type: 'RESET_VIEW',
      payload: {
        newData: {
          ...productoFormInitialState.productoForm,
        },
        newOptions: { tipos, productos },
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
