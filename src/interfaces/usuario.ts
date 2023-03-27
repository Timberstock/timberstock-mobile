import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface Usuario extends FirebaseAuthTypes.User {
  nombre?: string;
  rut?: string;
  empresa_id?: string;
}
