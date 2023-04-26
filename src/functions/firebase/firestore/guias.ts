import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '../../../interfaces/guias';
import { GuiaDespachoFirebase, PreGuia } from '../../../interfaces/firestore';
import { Alert } from 'react-native';
import customHelpers from '../../helpers';

export const createGuiaDoc = async (rutEmpresa: string, preGuia: PreGuia) => {
  if (!rutEmpresa) return null;
  const guia: GuiaDespachoFirebase = { ...preGuia, estado: 'pendiente' };
  guia.identificacion.fecha = new Date();
  try {
    const guiaDocumentId =
      'DTE_GD_' + rutEmpresa + 'f' + guia.identificacion.folio.toString();
    await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .doc(guiaDocumentId)
      .set(guia);
  } catch (e) {
    console.error('Error adding document: ', e);
    Alert.alert('Error al agregar guía');
  }
};

export const fetchGuiasDocs = async (rutEmpresa: string) => {
  // For the moment, we will only read from server (not cache)
  // just to make sure that we are working with the latest data.
  // TODO: implement last_modified field
  try {
    const querySnapshot = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .get();
    console.log('Guias read from server: ', !querySnapshot.metadata.fromCache);
    const guiasSummary: GuiaDespachoSummaryProps[] = [];
    querySnapshot.forEach((doc: FirebaseFirestoreTypes.DocumentData) => {
      const data = doc.data();
      const guiaData = {
        folio: data.identificacion.folio,
        estado: data.estado,
        total: data.total,
        receptor: data.receptor,
        fecha: customHelpers.fromFirebaseDateToJSDate(
          data.identificacion.fecha
        ),
        url: data.url,
      };
      guiasSummary.push(guiaData);
    });
    return guiasSummary;
  } catch (e) {
    console.error('Error read document: ', e);
    Alert.alert('Error al leer guía(s)');
    return [];
  }
};
