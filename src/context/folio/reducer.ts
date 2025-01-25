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

    default:
      console.warn('Unknown action type:', action);
      return state;
  }
}
