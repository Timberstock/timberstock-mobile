// import { collection, addDoc, getDocs, DocumentData } from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GuiaDespachoProps } from '../interfaces/guias';

export const createGuia = async (
  rutEmpresa: string,
  guiaData: GuiaDespachoProps
) => {
  try {
    const guiaDocumentId = 'DTE_GD_' + rutEmpresa + 'f' + guiaData.folio;
    const docRef = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .doc(guiaDocumentId)
      .set(guiaData);
    console.log('Document written with ID: ', guiaDocumentId);
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
      const guiaData = {
        folio: doc.data().folio,
        estado: doc.data().estado,
        monto: doc.data().monto,
        receptor: doc.data().receptor,
        fecha: doc.data().fecha,
      };
      const time = doc.data().fecha;
      guiaData.fecha = new Date(
        time.seconds * 1000 + time.nanoseconds / 1000000
      );
      guias.push(guiaData);
      console.log(
        `${doc.id} => Folio: ${guiaData.folio} | Estado: ${guiaData.estado} | Receptor: ${guiaData.receptor.razon_social}`
      );
    });
    return guias;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
    return 'Sesión iniciada';
  } catch (e: any) {
    if (e.code === 'auth/invalid-email') return 'Formato incorrecto de email';
    if (e.code === 'auth/invalid-password') return 'Contraseña incorrecta';
    if (e.code === 'auth/user-not-found')
      return 'Usuario incorrecto o no registrado';
    if (e.code === 'auth/wrong-password') return 'Contraseña incorrecta';
    else {
      console.log(e);
      return 'Error de autenticación';
    }
  }
};

export const logoutUser = async () => {
  try {
    await auth().signOut();
    return 'Sesión cerrada';
  } catch (e: any) {
    console.log(e);
    return 'Error de autenticación';
  }
};
