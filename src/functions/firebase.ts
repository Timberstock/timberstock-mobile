// import { collection, addDoc, getDocs, DocumentData } from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import { GuiaDespachoProps } from '../interfaces/guias';

export const createGuia = async (
  rutEmpresa: string,
  guiaData: GuiaDespachoProps
) => {
  try {
    const docRef = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .add(guiaData);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const readGuias = async (rutEmpresa: string) => {
  try {
    const querySnapshot = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .orderBy('folio', 'desc')
      .get();
    const guias: GuiaDespachoProps[] = [];
    // ANY because we don't know exactly the structure of the data since it can be different from doc to doc
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      const time = data.fecha;
      data.fecha = new Date(time.seconds * 1000 + time.nanoseconds / 1000000);
      guias.push(data);
      console.log(
        `${doc.id} => Folio: ${data.folio} | Estado: ${data.estado} | Receptor: ${data.receptor.razon_social}`
      );
    });
    return guias;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};
