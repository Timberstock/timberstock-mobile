import { productoFormInitialState } from './initialState';
import { ProductoFormAction, ProductoFormState } from './types';

export const productoFormReducer = (
  state: ProductoFormState,
  action: ProductoFormAction
): ProductoFormState => {
  let newVolumenTotalEmitido = 0;

  switch (action.type) {
    case 'UPDATE_TIPO':
      if (action.payload.newTipo === null) {
        return {
          productoForm: {
            ...productoFormInitialState.productoForm,
            tipo: null,
          },
          options: {
            ...state.options,
            productos: [],
          },
        };
      }

      return {
        productoForm: {
          ...productoFormInitialState.productoForm,
          tipo: action.payload.newTipo,
        },
        options: {
          ...state.options,
          ...action.payload.newOptions,
        },
      };

    case 'UPDATE_PRODUCTO_INFO':
      if (action.payload === null) {
        return {
          ...state,
          productoForm: {
            ...productoFormInitialState.productoForm,
            info: null,
            tipo: state.productoForm.tipo,
          },
          // Options remain the same
        };
      }

      return {
        ...state,
        productoForm: {
          ...action.payload.optionObject!,
        },
        // Options remain the same
      };

    case 'UPDATE_CLASES_DIAMETRICAS':
      const { item: claseItem } = action.payload;
      const newClasesDiametricas = [...state.productoForm.clases_diametricas_guia!];

      if (claseItem.clase) {
        const claseIndex = newClasesDiametricas.findIndex(
          (clase) => clase.clase === claseItem.clase
        );
        newClasesDiametricas[claseIndex] = {
          ...newClasesDiametricas[claseIndex],
          cantidad_emitida: claseItem.cantidad!,
          volumen_emitido: claseItem.volumen_emitido!,
        };
      } else {
        // Add new clase diametrica if index is not provided
        const lastCD =
          state.productoForm.clases_diametricas_guia![
            state.productoForm.clases_diametricas_guia!.length - 1
          ];
        const newCD = {
          // Use price from last clase diametrica
          ...lastCD,
          clase: (parseInt(lastCD.clase) + 2).toString(),
          cantidad_emitida: 0,
          volumen_emitido: 0,
        };
        newClasesDiametricas.push(newCD);
      }

      newVolumenTotalEmitido = newClasesDiametricas.reduce(
        (acc, clase) => acc + clase.volumen_emitido,
        0
      );

      return {
        ...state,
        productoForm: {
          ...state.productoForm,
          clases_diametricas_guia: newClasesDiametricas,
          volumen_total_emitido: newVolumenTotalEmitido,
        },
      };

    case 'UPDATE_BANCOS':
      const { index: bancoIndex, item: bancoItem } = action.payload;
      const newBancos = [...state.productoForm.bancos!];

      newBancos[bancoIndex] = {
        ...newBancos[bancoIndex],
        ...bancoItem,
      };

      newVolumenTotalEmitido = newBancos.reduce(
        (acc, banco) => acc + banco.volumen_banco,
        0
      );

      return {
        ...state,
        productoForm: {
          ...state.productoForm,
          bancos: newBancos,
          volumen_total_emitido: newVolumenTotalEmitido,
        },
      };

    case 'RESET_VIEW':
      // TODO: Reset view
      return {
        productoForm: {
          ...productoFormInitialState.productoForm,
        },
        options: {
          ...productoFormInitialState.options,
        },
      };

    default:
      return state;
  }
};
