import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/functions';
import { User } from '../user/types';
import { ReserveFoliosCloudFunctionResponse, ReserveFoliosResult } from './types';

export class FolioService {
  static async reserveFoliosForUser(
    cantidad: number,
    user: User
  ): Promise<ReserveFoliosResult> {
    if (!user.firebaseAuth?.uid) {
      return { success: false, error: 'Usuario no autenticado' };
    }
    const reservarFoliosFunction = firebase
      .app()
      .functions('us-central1')
      .httpsCallable('reservarFolios');

    try {
      // Call cloud function to reserve folios
      const result = await reservarFoliosFunction({
        uid: user.firebaseAuth?.uid,
        n_folios: cantidad,
      });

      const response = result.data as ReserveFoliosCloudFunctionResponse;

      if (
        response.folios_reservados.length > 0 &&
        response.cafs.length > 0 &&
        // all folios asked for
        (response.status === '200' ||
          // not all folios available but we still got some
          response.status === '420' ||
          response.status === '400')
      ) {
        // Update Firestore with new folios
        await firestore().collection('usuarios').doc(user.firebaseAuth?.uid).update({
          // We don't need to merge the new folios with the existing ones, as the cloud function will return the new folios with the existing ones already merged
          folios_reservados: response.folios_reservados,
          // Same for cafs
          cafs: response.cafs,
          syncStatus: 'pending',
        });

        return {
          success: true,
          foliosReservados: response.folios_reservados,
          cafs: response.cafs,
        };
      }

      return {
        success: false,
        error: response.message || 'Error desconocido',
      };
    } catch (error) {
      console.error('Error reserving folios:', error);
      return {
        success: false,
        error: 'Error al reservar folios',
      };
    }
  }

  static async liberarFolios(id: string | undefined): Promise<boolean> {
    if (!id) return false;

    try {
      const userRef = firestore().collection('usuarios').doc(id);
      await userRef.update({
        folios_reservados: [],
        cafs: [],
        syncStatus: 'pending',
      });
      return true;
    } catch (error) {
      console.error('Error releasing folios:', error);
      return false;
    }
  }
}
