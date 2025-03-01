import { initialState } from './initialState';
import { AppAction, AppState } from './types';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_GUIAS':
      return {
        ...state,
        guias: action.payload,
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

    case 'SET_LOADING_MORE':
      return {
        ...state,
        isLoadingMore: action.payload,
      };

    case 'SET_HAS_MORE':
      return {
        ...state,
        hasMoreGuias: action.payload,
      };

    case 'APPEND_GUIAS':
      return {
        ...state,
        guias: [...state.guias, ...action.payload],
      };

    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      console.warn(`Unknown action, check reducer.ts file and look for: ${action}.`);
      return state;
  }
}
