import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { User } from '../user/types';
import { Empresa } from './types';
import { ContratoCompra } from './types/contratoCompra';
import { ContratoVenta } from './types/contratoVenta';
import { GuiaDespachoFirestore } from './types/guia';

export class AppService {
  static formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static listenToGuias(
    currentUser: User,
    callback: (guias: GuiaDespachoFirestore[]) => void,
    limit: number = 20 // Default initial load
  ) {
    // Keep realtime listener for recent guias
    const realtimeQuery = firestore()
      .collection(`empresas/${currentUser.empresa_id}/guias`)
      .where('usuario_metadata.usuario_id', '==', currentUser.id)
      .orderBy('identificacion.fecha', 'desc')
      .limit(limit);

    const unsubscribe = realtimeQuery.onSnapshot(
      {
        includeMetadataChanges: true,
      },
      (querySnapshot: FirebaseFirestoreTypes.QuerySnapshot | null) => {
        console.log('🔄 [AppContext - Realtime listener]', {
          querySnapshot,
        });
        if (querySnapshot === null) {
          console.error('QuerySnapshot is null. This is unexpected behavior.');
          console.log('Current user:', currentUser);
          return;
        }
        const newGuias: GuiaDespachoFirestore[] = [];
        querySnapshot.docs.forEach(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const guiaData = doc.data() as GuiaDespachoFirestore;
            guiaData.id = this._handleGuiaId(guiaData, doc.id);
            newGuias.push(guiaData);
          }
        );
        callback(newGuias);
      },
      (error) => {
        console.error('Error in Firestore listener:', error);
        callback([]);
      }
    );

    const unsubscribeFunction = () => {
      console.log('🔄 [AppContext - Unsubscribing from realtime listener]');
      unsubscribe();
    };

    return unsubscribeFunction;
  }

  // New method for pagination
  static async fetchMoreGuias(
    currentUser: User,
    lastGuia: GuiaDespachoFirestore,
    limit: number = 20
  ): Promise<GuiaDespachoFirestore[]> {
    const snapshot = await firestore()
      .collection(`empresas/${currentUser.empresa_id}/guias`)
      .where('usuario_metadata.usuario_id', '==', currentUser.id)
      .orderBy('identificacion.fecha', 'desc')
      .startAfter(lastGuia.identificacion.fecha)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const guiaData = doc.data() as GuiaDespachoFirestore;
      guiaData.id = this._handleGuiaId(guiaData, doc.id);
      return guiaData;
    });
  }

  static async fetchAllData(empresaId: string, currentUser: User) {
    try {
      const [empresa, guias, contratosCompra, contratosVenta] = await Promise.all([
        this.fetchEmpresa(empresaId),
        this.fetchGuias(empresaId, currentUser),
        this.fetchContratosCompra(empresaId),
        this.fetchContratosVenta(empresaId),
      ]);

      return {
        empresa,
        guias,
        contratosCompra,
        contratosVenta,
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw new Error('Failed to fetch all data');
    }
  }

  static async fetchEmpresa(empresaId: string): Promise<Empresa> {
    try {
      const doc = await firestore().doc(`empresas/${empresaId}`).get();

      if (!doc.exists) {
        throw new Error('Empresa not found');
      }
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        actividad_economica: data?.activ_econom,
      } as Empresa;
    } catch (error) {
      console.error('Error fetching empresa:', error);
      throw new Error('Failed to fetch empresa data');
    }
  }

  static async fetchGuias(
    empresaId: string,
    currentUser: User
  ): Promise<GuiaDespachoFirestore[]> {
    try {
      const snapshot = await firestore()
        .collection(`empresas/${empresaId}/guias`)
        .where('usuario_metadata.usuario_id', '==', currentUser.id)
        .orderBy('identificacion.fecha', 'desc')
        .get();

      return snapshot.docs.map((doc) => {
        const guiaData = doc.data() as GuiaDespachoFirestore;
        guiaData.id = this._handleGuiaId(guiaData, doc.id);
        return guiaData;
      });
    } catch (error) {
      console.error('Error fetching guias:', error);
      throw new Error('Failed to fetch guias');
    }
  }

  static async fetchContratosCompra(empresaId: string): Promise<ContratoCompra[]> {
    try {
      const snapshot = await firestore()
        .collection(`empresas/${empresaId}/contratos_compra`)
        .where('vigente', '==', true)
        .get();

      return snapshot.docs.map((doc) => ({
        firestoreID: doc.id,
        ...doc.data(),
      })) as ContratoCompra[];
    } catch (error) {
      console.error('Error fetching contratos compra:', error);
      throw new Error('Failed to fetch contratos compra');
    }
  }

  static async fetchContratosVenta(empresaId: string): Promise<ContratoVenta[]> {
    try {
      const snapshot = await firestore()
        .collection(`empresas/${empresaId}/contratos_venta`)
        .where('vigente', '==', true)
        .get();

      return snapshot.docs.map((doc) => ({
        firestoreID: doc.id,
        ...doc.data(),
      })) as ContratoVenta[];
    } catch (error) {
      console.error('Error fetching contratos venta:', error);
      throw new Error('Failed to fetch contratos venta');
    }
  }

  static handleUpdateFound() {
    Updates.fetchUpdateAsync();
    Alert.alert('Actualización disponible', 'Se descargarán las actualizaciones.', [
      {
        text: 'Ok',
        // onPress: async () => {
        //   await Updates.fetchUpdateAsync();
        // },
      },
    ]);
  }

  static handleUpdateDownloaded() {
    Alert.alert(
      'Actualización descargada',
      'La aplicación se reiniciará para aplicar los cambios.',
      [
        {
          text: 'Ok',
          onPress: async () => {
            await Updates.reloadAsync();
          },
        },
      ]
    );
  }

  static _handleGuiaId(guiaData: GuiaDespachoFirestore, docId: string): string {
    let IdToReturn = '';
    // Handle
    if (guiaData.id) {
      IdToReturn = guiaData.id;
    } else {
      IdToReturn = docId;
    }
    if (guiaData.version) {
      IdToReturn = `${IdToReturn}_${guiaData.version}`;
    }

    return IdToReturn;
  }
}
