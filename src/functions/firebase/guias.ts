import firestore from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '../../interfaces/guias';
import { GuiaDespachoFirebase } from '../../interfaces/firestore';
import { Alert } from 'react-native';

export const createGuia = async (
  rutEmpresa: string,
  guiaData: GuiaDespachoFirebase
) => {
  if (rutEmpresa === '') {
    return null;
  }
  try {
    const guiaDocumentId =
      'DTE_GD_' + rutEmpresa + 'f' + guiaData.identificacion.folio;
    const docRef = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .doc(guiaDocumentId)
      .set(guiaData);
    console.log('Document written with ID: ', guiaDocumentId);
    Alert.alert('Guía creada con éxito');
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
      .orderBy('identificacion.folio', 'desc')
      .get();
    const guias: GuiaDespachoSummaryProps[] = [];
    // ANY because we don't know exactly the structure of the data since it can be different from doc to doc
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      const guiaData = {
        folio: data.identificacion.folio,
        estado: data.estado,
        total: data.total,
        receptor: data.receptor,
        fecha: data.identificacion.fecha,
      };
      const time = data.identificacion.fecha;
      guiaData.fecha = new Date(
        time.seconds * 1000 + time.nanoseconds / 1000000
      );
      //@ts-ignore
      guias.push(guiaData);
      //   console.log(
      //     `${doc.id} => Folio: ${guiaData.folio} | Estado: ${guiaData.estado} | Receptor: ${guiaData.receptor.razon_social}`
      //   );
    });
    return guias;
  } catch (e) {
    console.error('Error adding document: ', e);
    Alert.alert('Error al agregar guía(s)');
  }
};
