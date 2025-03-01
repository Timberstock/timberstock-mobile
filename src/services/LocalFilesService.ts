// src/services/LocalFilesService.ts
import storage from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Alert } from 'react-native';

export class LocalFilesService {
  private static baseDir = FileSystem.documentDirectory;

  static async ensureDirectoryExists(dirName: string) {
    console.log('🔍 [ensureDirectoryExists] dirName:', dirName);
    const dirPath = `${this.baseDir}${dirName}`;
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
    return dirPath;
  }

  static async getLocalFiles(empresaId: string): Promise<string[]> {
    try {
      const dirPath = `${this.baseDir}${empresaId}`;
      console.log('🔍 [getLocalFiles] Reading files from:', dirPath);
      const files = await FileSystem.readDirectoryAsync(dirPath);
      return files.map((file) => `${dirPath}/${file}`);
    } catch (error) {
      console.error('Error reading local files:', error);
      return [];
    }
  }

  static async moveFile(
    empresaId: string,
    fileName: string,
    fileUri: string
  ): Promise<string> {
    try {
      const dirPath = await this.ensureDirectoryExists(empresaId);
      const destinationUri = `${dirPath}/${fileName}`;
      console.log(`🔍 [moveFile] Saving file ${fileUri} to: ${destinationUri}`);
      await FileSystem.moveAsync({
        from: fileUri,
        to: destinationUri,
      });
      return destinationUri;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  static async fileExistsPath(
    empresaId: string,
    fileName: string
  ): Promise<string | null> {
    try {
      const filePath = `${this.baseDir}${empresaId}/${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) return filePath;
      return null;
    } catch {
      return null;
    }
  }

  static async getLogoFileBase64(empresaId: string): Promise<string | null> {
    // Maybe not necessary to check if the file exists, because we are sure that the file is in the local files
    const files = await this.getLocalFiles(empresaId);
    const logoFileURI = files.find((file) => file.includes('logo.png'));
    if (!logoFileURI) return null;
    const base64 = await FileSystem.readAsStringAsync(logoFileURI, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  }

  static async shareGuiaPDF(folio: string, empresaId: string): Promise<void> {
    const files = await this.getLocalFiles(empresaId);
    try {
      const pdfFile = files.find(
        (file) =>
          file.includes(`GuiaFolio${folio}.pdf`) || file.includes(`GD_${folio}.pdf`)
      );

      console.log('🔍 [shareGuiaPDF] pdfFile:', pdfFile);

      if (pdfFile) {
        await shareAsync(pdfFile, {
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

  static async ensureLogoExists(empresaId: string): Promise<boolean> {
    console.log(
      '🔍 [ensureLogoExists] baseDir according to FileSystem.documentDirectory:',
      FileSystem.documentDirectory
    );
    await this.ensureDirectoryExists(empresaId);

    const filePath = await this.fileExistsPath(empresaId, 'logo.png');
    if (filePath) {
      console.log('✅ [Success] Logo already exists in local files');
      return true;
    }
    try {
      const logoUrl = await storage()
        .ref(`empresas/${empresaId}/logo.png`)
        .getDownloadURL();

      const fileUri = `${FileSystem.documentDirectory}${empresaId}/logo.png`;

      const downloadResult = await FileSystem.downloadAsync(logoUrl, fileUri);
      console.log('🔍 [ensureLogoExists] downloadResult:', downloadResult);

      if (downloadResult.status === 200) {
        console.log('✅ [Success] Logo loaded');
        return true;
      } else {
        console.error('❌ [Error] Download failed:', downloadResult.status);
        throw new Error(`Download failed: ${downloadResult.status}`);
      }
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.log('🚨 [Error] Logo not found in storage');
        return false;
      }
      console.error('🚨 [Error] Storage operation failed:', {
        code: error.code,
        message: error.message,
      });
      return false;
    }
  }
}
