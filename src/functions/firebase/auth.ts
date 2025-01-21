import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export const authenticateUser = async (email: string, password: string) => {
  try {
    console.log('Authenticating user...');
    await auth().signInWithEmailAndPassword(email, password);
    return 'Sesión iniciada';
  } catch (e: any) {
    if (e.code === 'auth/invalid-email') return 'Formato incorrecto de email';
    if (e.code === 'auth/invalid-password') return 'Contraseña incorrecta';
    if (e.code === 'auth/user-not-found') return 'Usuario incorrecto o no registrado';
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
    try {
      await logoutUser();
      await firestore().terminate();
      await firestore().clearPersistence();
      Alert.alert('Persistence cleared');
      return 'Sesión cerrada';
    } catch (error: any) {
      console.error('Could not enable persistence:', error);
      Alert.alert('No se pudo limpiar el cache: ', error);
      return 400;
    }
  } catch (e: any) {
    console.log(e);
    return 'Error para cerrar sesión';
  }
};
