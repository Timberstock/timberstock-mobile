import auth from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { UsuarioFirestoreData } from '../../interfaces/usuario';
import { MutableRefObject } from 'react';

export const getUserDocRef = (userUid: string) => {
  const userDocRef = firestore().collection('usuarios').doc(userUid);
  return userDocRef;
};

export const createUserDocSnapListener = (
  userDocRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>,
  previousSnapshotRef: MutableRefObject<FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>,
  updateUserFirestore: (userInfo: UsuarioFirestoreData) => void
) => {
  // The listener is returned so it can be unsubscribed later (just by calling listener()).
  // Also, keep in mind that this is only needed to be created once, since the "doc"
  // inside onSnapshot() exists from the userDocRef which is created outside of this function.
  const listener = userDocRef.onSnapshot((doc) => {
    if (doc.exists) {
      if (
        !previousSnapshotRef.current ||
        !doc.isEqual(previousSnapshotRef.current)
      ) {
        const userData = doc.data();
        if (userData) {
          updateUserFirestore({
            nombre: userData.nombre,
            rut: userData.rut,
            empresa_id: userData.empresa_id,
            email: userData.email,
          });
          previousSnapshotRef.current = doc;
        }
        console.log('User info updated');
      }
    } else {
      console.log('No user data found with id: ' + userDocRef.id);
    }
  });
  return listener;
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    console.log('Authenticating user...');
    await auth().signInWithEmailAndPassword(email, password);
    return 'Sesión iniciada';
  } catch (e: any) {
    if (e.code === 'auth/invalid-email') return 'Formato incorrecto de email';
    if (e.code === 'auth/invalid-password') return 'Contraseña incorrecta';
    if (e.code === 'auth/user-not-found')
      return 'Usuario incorrecto o no registrado';
    if (e.code === 'auth/wrong-password') return 'Contraseña incorrecta';
    else {
      console.log(e);
      Alert.alert('Error de autenticación');
      return 'Error de autenticación';
    }
  }
};

export const getCurrentAuthUser = () => {
  return auth().currentUser;
};

export const logoutUser = async () => {
  try {
    await auth().signOut();
    return 'Sesión cerrada';
  } catch (e: any) {
    console.log(e);
    Alert.alert('Error para cerrar sesión');
    return 'Error para cerrar sesión';
  }
};
