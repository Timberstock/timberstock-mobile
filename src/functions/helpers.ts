import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '../interfaces/guias';

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

export const formatDate = (date: Date) => {
  return `${[
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/')} ${[
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':')}`;
};

// This function is used to retrieve data form Firestore and then
// push it to an array that is passed. It is used in the fetchData function.
export const getIndividualData = async (
  empresaId: string,
  docId: string,
  collection1Name: string,
  collection2Name: string,
  arrayToPush: FirebaseFirestoreTypes.DocumentData[]
) => {
  const collection = await firestore()
    .collection('empresas')
    .doc(empresaId)
    .collection(collection1Name)
    .doc(docId)
    .collection(collection2Name)
    .get();
  collection.docs.map((document) => {
    arrayToPush.push(document.data());
  });
  return arrayToPush;
};

export const getFoliosDisp = (
  guias: GuiaDespachoSummaryProps[],
  caf_n: number
) => {
  const folios: number[] = [];
  const foliosNoDisp: number[] = [];
  let max_folio_emitido = 0;

  // Primero agregamos todos los folios que ya estan bloqueados
  // a la lista de folios no disponibles
  guias.map((guia) => {
    if (
      guia.estado === 'aceptada' ||
      guia.estado === 'emitida' ||
      guia.estado === 'pendiente'
    )
      foliosNoDisp.push(guia.folio);
  });

  // Luego agregamos todos los folios que esten disponibles desde el 1
  // hasta el maximo folio posible, segun el numero de CAFs solicitados
  // en la empresa.
  // TODO: probablemente sea un numero mayor a 5, actualizar cuando se decida.
  const max_folio_posible = caf_n * 5;
  for (let i = 1; i <= max_folio_posible; i++) {
    if (!foliosNoDisp.includes(i)) folios.push(i);
  }
  return folios;
};
