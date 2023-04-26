import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface UsuarioFirestoreData {
  nombre: string;
  rut: string;
  empresa_id: string;
  email: string;
  // Just so the same interface can be used to extend the received user
  // in the updateUserFirestore function.
  firebaseAuth?: FirebaseAuthTypes.User | null;
}

export interface Usuario extends UsuarioFirestoreData {
  firebaseAuth: FirebaseAuthTypes.User | null;
}
