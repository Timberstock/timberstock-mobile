import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface UsuarioFirestoreData {
  nombre: string;
  rut: string;
  empresa_id: string;
  email: string;
  last_login: FirebaseFirestoreTypes.Timestamp;
  // Just so the same interface can be used to extend the received user
  // in the updateUserFirestore function.
  firebaseAuth?: FirebaseAuthTypes.User | null;
}

export interface Usuario extends UsuarioFirestoreData {
  firebaseAuth: FirebaseAuthTypes.User | null;
}
