import auth from '@react-native-firebase/auth';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import * as Updates from 'expo-updates';
import { UserFirestore } from './types';

export class UserService {
  static async login(email: string, password: string): Promise<string> {
    if (!email || !password) {
      return 'Debe llenar ambos campos';
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
      return 'success';
    } catch (e: any) {
      console.error('💥 Error al iniciar sesión:', {
        code: e.code,
        message: e.message,
      });
      const errorMap: Record<string, string> = {
        'auth/invalid-email': 'Formato incorrecto de email',
        'auth/invalid-password': 'Contraseña incorrecta',
        'auth/user-not-found': 'Usuario incorrecto o no registrado',
        'auth/wrong-password': 'Contraseña incorrecta',
      };
      return errorMap[e.code] || 'Error de autenticación';
    }
  }

  static async logout(): Promise<void> {
    try {
      // 1. Sign out from Firebase Auth
      await auth().signOut();
      
      // 2. Clean up Firestore
      await firestore().terminate();
      await firestore().clearPersistence();
      
      // 3. Force a clean reload of the app
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  static async updateUserSyncStatusAndLastLogin(user: UserFirestore): Promise<void> {
    // Helper function to check if a date is from a previous day
    const isFromPreviousDay = (date: Date) => {
      const today = new Date();
      // Reset time parts to compare just the dates
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate < today;
    };

    // Only proceed if we need to update something
    const needsSyncUpdate = user.syncStatus === 'pending';
    const needsLoginUpdate = isFromPreviousDay(user.last_login.toDate());

    if (!needsSyncUpdate && !needsLoginUpdate) return;

    // Data to update in firestore
    const metaDataUpdates: Partial<UserFirestore> = {};

    if (needsSyncUpdate) {
      console.log('Sync status updated to synced');
      metaDataUpdates.syncStatus = 'synced';
    }

    if (needsLoginUpdate) {
      console.log('Last login updated to now');
      metaDataUpdates.last_login = Timestamp.now();
    }

    // Only update firestore if we have changes to make
    if (Object.keys(metaDataUpdates).length > 0) {
      await firestore().collection('usuarios').doc(user.id).update(metaDataUpdates);
    }
  }
}
