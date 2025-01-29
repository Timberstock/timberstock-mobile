import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { User } from '../user/types';
import { Empresa, GuiaDespachoState, LocalFile } from './types';
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
    localFiles: LocalFile[],
    callback: (guias: GuiaDespachoState[]) => void,
    limit: number = 30 // Default initial load
  ) {
    // Keep realtime listener for recent guias
    const realtimeQuery = firestore()
      .collection(`empresas/${currentUser.empresa_id}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .limit(limit);

    return realtimeQuery.onSnapshot((querySnapshot) => {
      const newGuias: GuiaDespachoState[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists) {
          const guiaData = doc.data() as GuiaDespachoFirestore;
          const guiaState: GuiaDespachoState = {
            ...guiaData,
            id: doc.id,
            pdf_local_checked_uri: this._checkForPdfURILocal(
              guiaData as GuiaDespachoFirestore,
              localFiles,
              currentUser.id
            ),
          };

          newGuias.push(guiaState);
        }
      });
      callback(newGuias);
    });
  }

  // New method for pagination
  static async fetchMoreGuias(
    currentUser: User,
    localFiles: LocalFile[],
    lastGuia: GuiaDespachoState,
    limit: number = 20
  ): Promise<GuiaDespachoState[]> {
    const snapshot = await firestore()
      .collection(`empresas/${currentUser.empresa_id}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .startAfter(lastGuia.identificacion.fecha)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const guiaData = doc.data() as GuiaDespachoFirestore;
      const guiaState: GuiaDespachoState = {
        ...guiaData,
        id: doc.id,
        pdf_local_checked_uri: this._checkForPdfURILocal(
          guiaData as GuiaDespachoState,
          localFiles,
          currentUser.id
        ),
      };
      return guiaState;
    });
  }

  static async fetchAllData(
    empresaId: string,
    localFiles: LocalFile[],
    currentUser: User
  ) {
    try {
      const [empresa, guias, contratosCompra, contratosVenta] = await Promise.all([
        this.fetchEmpresa(empresaId),
        this.fetchGuias(empresaId, localFiles, currentUser),
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
    localFiles: LocalFile[],
    currentUser: User
  ): Promise<GuiaDespachoState[]> {
    try {
      const snapshot = await firestore()
        .collection(`empresas/${empresaId}/guias`)
        .orderBy('identificacion.fecha', 'desc')
        .get();

      return snapshot.docs.map((doc) => {
        const guiaData = doc.data() as GuiaDespachoFirestore;
        const guiaState: GuiaDespachoState = {
          ...guiaData,
          id: doc.id,
          pdf_local_checked_uri: this._checkForPdfURILocal(
            guiaData as GuiaDespachoFirestore,
            localFiles,
            currentUser.id
          ),
        };
        return guiaState;
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

  static async loadLocalFiles(empresaId: string): Promise<LocalFile[]> {
    const localFiles: LocalFile[] = [];

    const appFolderContent = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory as string
    );
    appFolderContent.forEach((fileName) => {
      const fileURI = FileSystem.documentDirectory + fileName;

      if (fileName.includes('.pdf')) {
        localFiles.push({
          name: fileName,
          path: fileURI,
          type: 'pdf',
        });
      }
    });

    const empresaFolder = FileSystem.documentDirectory + empresaId;

    if (!appFolderContent.includes(empresaId)) {
      await FileSystem.makeDirectoryAsync(empresaFolder);
    }
    const empresaFolderContent = await FileSystem.readDirectoryAsync(empresaFolder);

    empresaFolderContent.forEach(async (fileName: string) => {
      const fileURI = empresaFolder + '/' + fileName;

      // TODO: this can be used if implemented something related to cover more files with the same folio
      // const fileInfo = await FileSystem.getInfoAsync(fileURI);

      localFiles.push({
        name: fileName,
        path: fileURI,
        type: fileName.includes('.pdf')
          ? 'pdf'
          : fileName.includes('.png')
            ? 'image'
            : 'other',
      });
    });

    if (!empresaFolderContent.includes('logo.png')) {
      try {
        const logoUrl = await storage()
          .ref(`empresas/${empresaId}/logo.png`)
          .getDownloadURL();

        const fileUri = `${FileSystem.documentDirectory}${empresaId}/logo.png`;

        const downloadResult = await FileSystem.downloadAsync(logoUrl, fileUri);

        if (downloadResult.status === 200) {
          localFiles.push({
            name: 'logo.png',
            path: fileUri,
            type: 'image',
          });
        } else {
          console.error('❌ [Error] Download failed:', downloadResult.status);
          throw new Error(`Download failed: ${downloadResult.status}`);
        }
      } catch (error: any) {
        console.error('🚨 [Error] Storage operation failed:', {
          code: error.code,
          message: error.message,
        });
        if (error.code === 'storage/object-not-found') {
        }
      }
    } else {
      localFiles.push({
        name: 'logo.png',
        path: `${FileSystem.documentDirectory}${empresaId}/logo.png`,
        type: 'image',
      });
    }

    return localFiles;
  }

  static async shareGuiaPDF(folio: string, localFiles: LocalFile[]): Promise<void> {
    try {
      const pdfFile = localFiles.find(
        (file) =>
          file.name === `GuiaFolio${folio}.pdf` || file.name === `GD_${folio}.pdf`
      );

      if (pdfFile) {
        await shareAsync(pdfFile.path, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('PDF no encontrado', 'No se encontró el PDF local para esta guía');
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'No se pudo compartir el PDF');
    }
  }

  static async checkForUpdates(): Promise<void> {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error checking for updates:', error);
      throw new Error('Failed to check for updates');
    }
  }

  static _checkForPdfURILocal(
    guia: GuiaDespachoFirestore,
    localFiles: LocalFile[],
    currentUserID: string
  ): string {
    // First look for the direct uri stored in the guia if it was created by the current user
    let pdfLocalUri = '';
    if (
      guia?.usuario_metadata &&
      guia.usuario_metadata.usuario_id &&
      guia.usuario_metadata.usuario_id === currentUserID &&
      guia.usuario_metadata.pdf_local_uri
    ) {
      const localFile = localFiles.find((f) => {
        f.path === guia.usuario_metadata.pdf_local_uri;
      });
      if (localFile) {
        pdfLocalUri = localFile.path;
      }
    }

    if (!pdfLocalUri) {
      // If the guia was not found, let's check if we have a pdf in the local files for that folio
      const localFile = localFiles.find(
        (f) =>
          f.name === `GuiaFolio${guia?.identificacion.folio}.pdf` ||
          f.name === `GD_${guia?.identificacion.folio}.pdf`
      );
      if (localFile) {
        pdfLocalUri = localFile.path;
      }
    }

    return pdfLocalUri;
  }
}
