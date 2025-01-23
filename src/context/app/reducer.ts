import { AppAction, AppState } from './types';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_GUIAS_SUMMARY':
      return {
        ...state,
        guiasSummary: action.payload,
        lastSync: new Date(),
        error: null,
        loading: false,
      };

    case 'SET_EMPRESA_DATA':
      return {
        ...state,
        contratosCompra: action.payload.contratosCompra,
        contratosVenta: action.payload.contratosVenta,
        empresa: action.payload.empresa,
        lastSync: new Date(),
        error: null,
        loading: false,
      };

    case 'SET_LOCAL_FILES':
      return {
        ...state,
        localFiles: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      console.warn(`Unknown action, check reducer.ts file and look for: ${action}.`);
      return state;
  }
}
