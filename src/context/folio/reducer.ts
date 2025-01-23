import { initialState } from './initialState';
import { FolioAction, FolioState } from './types';

export function folioReducer(state: FolioState, action: FolioAction): FolioState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        syncStatus: 'error',
        loading: false,
      };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      console.warn('Unknown action type:', action);
      return state;
  }
}
