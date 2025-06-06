import { initialize_bancos, productoFormInitialState } from './initialState';
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
          bancos: action.payload.newTipo === 'Pulpable' ? initialize_bancos() : null,
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
            bancos: state.productoForm.tipo === 'Pulpable' ? initialize_bancos() : null,
          },
          // Options remain the same
        };
      }

      return {
        ...state,
        productoForm: {
          ...action.payload,
          bancos: state.productoForm.tipo === 'Pulpable' ? initialize_bancos() : null,
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
          volumen_emitido: Number(claseItem.volumen_emitido!.toFixed(4)),
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
        (acc, clase) => acc + Number(clase.volumen_emitido.toFixed(4)),
        0
      );

      return {
        ...state,
        productoForm: {
          ...state.productoForm,
          clases_diametricas_guia: newClasesDiametricas,
          volumen_total_emitido: Number(newVolumenTotalEmitido.toFixed(4)),
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
        (acc, banco) => acc + Number(banco.volumen_banco.toFixed(4)),
        0
      );

      return {
        ...state,
        productoForm: {
          ...state.productoForm,
          bancos: newBancos,
          volumen_total_emitido: Number(newVolumenTotalEmitido.toFixed(4)),
        },
      };

    case 'RESET_VIEW':
      return {
        productoForm: {
          ...productoFormInitialState.productoForm,
          bancos: null,
        },
        options: {
          ...productoFormInitialState.options,
          ...action.payload.newOptions,
        },
      };

    default:
      return state;
  }
};
