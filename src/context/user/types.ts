import { CAF } from '@/context/folio/types';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface UserFirestore {
  id: string;
  admin: boolean;
  cafs: CAF[];
  email: string;
  empresa_id: string;
  folios_reservados: number[];
  last_login: FirebaseFirestoreTypes.Timestamp;
  nombre: string;
  rut: string;
  superadmin: boolean;
  syncStatus?: 'pending' | 'synced';
}

export interface User extends UserFirestore {
  firebaseAuth: FirebaseAuthTypes.User | null;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  lastSync: number | null;
}

export interface UserContextType {
  state: UserState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export type UserAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SYNC_USER_DATA'; payload: UserFirestore }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };
