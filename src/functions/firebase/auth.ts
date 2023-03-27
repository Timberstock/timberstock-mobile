import auth from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export const fetchUserData = async (
  userId: string
): Promise<FirebaseFirestoreTypes.DocumentData | undefined> => {
  try {
    const userInfo = await firestore().collection('usuarios').doc(userId).get();
    const userData = userInfo.data();
    return userData;
  } catch (e: any) {
    console.log(e);
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
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
      return 'Error de autenticación';
    }
  }
};

export const logoutUser = async () => {
  try {
    await auth().signOut();
    return 'Sesión cerrada';
  } catch (e: any) {
    console.log(e);
    return 'Error de autenticación';
  }
};
