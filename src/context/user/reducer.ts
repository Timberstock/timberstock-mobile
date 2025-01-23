import { User, UserAction, UserState } from './types';

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        error: null,
        lastSync: Date.now(),
      };

    case 'SYNC_USER_DATA':
      return {
        ...state,
        user: {
          ...(state.user as User),
          ...action.payload,
        },
        error: null,
        lastSync: Date.now(),
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

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
