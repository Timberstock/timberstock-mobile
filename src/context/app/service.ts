import { ContratoCompra } from '@/interfaces/contratos/contratoCompra';
import { ContratoVenta } from '@/interfaces/contratos/contratoVenta';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { Empresa, GuiaDespachoSummary, LocalFile } from './types';

export class AppService {
  private static formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static listenToGuias(
    empresaId: string,
    localFiles: LocalFile[],
    callback: (guias: GuiaDespachoSummary[]) => void
  ) {
    return firestore()
      .collection(`empresas/${empresaId}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .onSnapshot((querySnapshot) => {
        const newGuias: GuiaDespachoSummary[] = [];
        querySnapshot.forEach((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
          if (doc.exists) {
            const data = doc.data();
            const localFile = localFiles.find(
              (file) =>
                file.name === `GuiaFolio${data?.identificacion.folio}.pdf` ||
                file.name === `GD_${data?.identificacion.folio}.pdf`
            );

            newGuias.push({
              id: doc.id,
              folio: data?.identificacion.folio,
              estado: data?.estado,
              monto_total_guia: data?.monto_total_guia,
              receptor: data?.receptor,
              fecha: this.formatDateToYYYYMMDD(data?.identificacion.fecha.toDate()),
              pdf_url: data?.pdf_url,
              pdf_local_uri: localFile?.path,
              volumen_total_emitido: data?.volumen_total_emitido,
            });
          }
        });
        callback(newGuias);
      });
  }

  static async fetchAllData(empresaId: string) {
    try {
      const [empresa, guias, contratosCompra, contratosVenta] = await Promise.all([
        this.fetchEmpresa(empresaId),
        this.fetchGuias(empresaId),
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

      return { id: doc.id, ...doc.data() } as Empresa;
    } catch (error) {
      console.error('Error fetching empresa:', error);
      throw new Error('Failed to fetch empresa data');
    }
  }

  static async fetchGuias(empresaId: string): Promise<GuiaDespachoSummary[]> {
    try {
      const snapshot = await firestore()
        .collection(`empresas/${empresaId}/guias`)
        .orderBy('identificacion.fecha', 'desc')
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          folio: data.identificacion.folio,
          estado: data.estado,
          monto_total_guia: data.monto_total_guia,
          receptor: data.receptor,
          fecha: this.formatDateToYYYYMMDD(data.identificacion.fecha.toDate()),
          pdf_url: data.pdf_url,
          volumen_total_emitido: data.volumen_total_emitido,
        };
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

      console.log(fileName);

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
      console.log('Empresa folder not found, creating...');
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
        console.log('🔍 [Logo Check] Checking storage for company logo...');

        const logoUrl = await storage()
          .ref(`empresas/${empresaId}/logo.png`)
          .getDownloadURL();

        console.log(logoUrl);

        console.log('🌐 [Storage] Found logo URL:', logoUrl);

        const fileUri = `${FileSystem.documentDirectory}${empresaId}/logo.png`;
        console.log('📂 [Local] Setting save path:', fileUri);

        const downloadResult = await FileSystem.downloadAsync(logoUrl, fileUri);

        console.log('📊 [Download] Status:', {
          status: downloadResult.status,
          size: `${Math.round(parseInt(downloadResult.headers['content-length']) / 1024)}KB`,
          type: downloadResult.headers['content-type'],
        });

        if (downloadResult.status === 200) {
          console.log('✅ [Success] Logo downloaded and saved locally');
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
          console.log('ℹ️ [Info] No logo found for this empresa');
        }
      }
    } else {
      console.log('📱 Logo found locally stored');
      localFiles.push({
        name: 'logo.png',
        path: `${FileSystem.documentDirectory}${empresaId}/logo.png`,
        type: 'image',
      });
    }

    console.log('🔍 [Local Files] Found:', localFiles);

    return localFiles;
  }

  static async shareGuiaPDF(folio: string, localFiles: LocalFile[]): Promise<void> {
    try {
      const pdfFile = localFiles.find(
        (file) =>
          file.name === `GuiaFolio${folio}.pdf` || file.name === `GD_${folio}.pdf`
      );

      console.log(pdfFile);

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
}
