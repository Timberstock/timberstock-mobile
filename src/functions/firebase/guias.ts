import firestore from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '../../interfaces/guias';
import { GuiaDespachoFirebase } from '../../interfaces/firestore';
import { Alert } from 'react-native';
import customHelpers from '../helpers';

export const createGuia = async (
  rutEmpresa: string,
  guiaData: GuiaDespachoFirebase
) => {
  if (!rutEmpresa) return null;
  try {
    const guiaDocumentId =
      'DTE_GD_' + rutEmpresa + 'f' + guiaData.identificacion.folio.toString();
    const docRef = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .doc(guiaDocumentId)
      .set(guiaData);
  } catch (e) {
    console.error('Error adding document: ', e);
    Alert.alert('Error al agregar guía');
  }
};

export const readGuias = async (rutEmpresa: string) => {
  if (rutEmpresa === '') {
    return null;
  }
  try {
    const querySnapshot = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .get();
    const guiasSummary: GuiaDespachoSummaryProps[] = [];
    // ANY because we don't know exactly the structure of the data since it can be different from doc to doc
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      const guiaData = {
        folio: data.identificacion.folio,
        estado: data.estado,
        total: data.total,
        receptor: data.receptor,
        fecha: data.identificacion.fecha,
        url: data.url,
      };
      guiaData.fecha = customHelpers.fromFirebaseDateToJSDate(guiaData.fecha);
      //@ts-ignore
      guiasSummary.push(guiaData);
    });
    return guiasSummary;
  } catch (e) {
    console.error('Error read document: ', e);
    Alert.alert('Error al leer guía(s)');
  }
};
