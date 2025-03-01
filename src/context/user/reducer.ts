import { UserAction, UserState } from './types';

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
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...action.payload,
          firebaseAuth: state.user.firebaseAuth,
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

    case 'RESET_STATE':
      return {
        user: action.payload ? {
          id: '',
          admin: false,
          cafs: [],
          email: action.payload.email || '',
          empresa_id: '',
          folios_reservados: [],
          last_login: new Date() as any,
          nombre: '',
          rut: '',
          superadmin: false,
          firebaseAuth: action.payload,
        } : null,
        loading: true,
        error: null,
        lastSync: null,
      };

    default:
      return state;
  }
}
