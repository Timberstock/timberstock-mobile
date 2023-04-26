import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '../interfaces/guias';

const fromFirebaseDateToJSDate = (firebaseDate: any) => {
  const date = new Date(
    firebaseDate.seconds * 1000 + firebaseDate.nanoseconds / 1000000
  );
  return date;
};

const daysSinceFirestoreTimestamp = (
  timestamp: FirebaseFirestoreTypes.Timestamp
): number => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const timestampDate = timestamp.toDate();
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - timestampDate.getTime();
  const daysDiff = Math.round(timeDiff / millisecondsPerDay);
  return daysDiff;
};

const formatDate = (date: Date) => {
  // From Date to string
  function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }
  return `${[
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/')} ${[
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':')}`;
};

const getFoliosDisp = (guias: GuiaDespachoSummaryProps[], caf_n: number) => {
  const folios: number[] = [];
  const foliosNoDisp: number[] = [];

  // Primero agregamos todos los folios que ya estan bloqueados
  // a la lista de folios no disponibles
  try {
    guias.map((guia) => {
      if (
        guia.estado === 'aceptada' ||
        guia.estado === 'emitida' ||
        guia.estado === 'pendiente' ||
        guia.estado === 'sin conexion'
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
  } catch (e) {
    console.log(e);
    return [];
  }
};

const customHelpers = {
  fromFirebaseDateToJSDate,
  daysSinceFirestoreTimestamp,
  formatDate,
  getFoliosDisp,
};

export default customHelpers;
