import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface CAF {
  id: string;
  D: number;
  H: number;
  text: string;
}

export interface UsuarioFirestoreData {
  nombre: string;
  rut: string;
  empresa_id: string;
  email: string;
  folios_reservados: number[];
  cafs: CAF[];
  last_login: FirebaseFirestoreTypes.Timestamp;
  // Just so the same interface can be used to extend the received user
  // in the updateUserFirestore function.
  firebaseAuth?: FirebaseAuthTypes.User | null;
}

export interface Usuario extends UsuarioFirestoreData {
  firebaseAuth: FirebaseAuthTypes.User | null;
}
