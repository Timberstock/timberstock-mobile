import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '@/interfaces/screens/home';
import { Alert } from 'react-native';
import { GuiaDespachoFirestore } from '@/interfaces/firestore/guia';

export const createGuiaDoc = async (
  rutEmpresa: string,
  preGuia: GuiaDespachoFirestore
): Promise<string | null> => {
  function snapshotPromise(
    ref: FirebaseFirestoreTypes.DocumentReference
  ): Promise<FirebaseFirestoreTypes.DocumentSnapshot> {
    // From https://github.com/firebase/firebase-js-sdk/issues/1497
    // Workaround for the issue of createGuiaDoc not resolving when creating a new guia offline.
    // The issue is that the set() function returns a promise that resolves only when the data is written to the server.
    // So with this workaround, we are listening to the snapshot of the document, and resolving the promise when the snapshot is received.
    return new Promise((resolve, reject) => {
      var unsubscribe = ref.onSnapshot(
        (doc) => {
          resolve(doc);
          unsubscribe();
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  if (!rutEmpresa) return null;
  const creationDate = new Date();
  const guia: GuiaDespachoFirestore = {
    ...preGuia,
    identificacion: { ...preGuia.identificacion, fecha: creationDate },
    estado: 'pendiente',
  };
  try {
    const guiaDocumentId =
      'DTE_GD_' + rutEmpresa + 'f' + guia.identificacion.folio.toString();

    const newGuiaDocRef = firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .doc(guiaDocumentId);
    newGuiaDocRef.set(guia);
    const createdGuiaDoc = await snapshotPromise(newGuiaDocRef);

    console.log('Guía agregada a firebase: ', guiaDocumentId);

    // if (createdGuiaDoc.metadata.hasPendingWrites) {
    //   Alert.alert(
    //     'Guía agregada correctamente',
    //     `Guía de folio: ${guia.identificacion.folio}`
    //   );
    // } else {
    // }
    Alert.alert(
      'Guía agregada correctamente',
      `Guía de folio: ${guia.identificacion.folio}`
    );
    return creationDate.toISOString();
  } catch (e) {
    console.error('Error adding document: ', e);
    Alert.alert('Error al agregar guía');
    throw new Error(' Error al agregar guía ');
  }
};

export const _createGuiaTest = async (folio: number) => {
  console.log('[TEST GUIA CREATION]');
  const rutEmpresa = '770685532';
  const guia = {
    transporte: {
      chofer: {
        nombre: 'Chofer de Prueba',
        rut: '19810662-3',
      },
      direccion_destino: 'Planta Laja',
      patente: 'CH1203',
      rut_transportista: '77068553-2',
    },
    emisor: {
      actividad_economica: [477399, 492300, 702000],
      comuna: 'PADRE LAS CASAS',
      direccion: 'PARCELA 2 PUENTE EL SAPO',
      giro: '466301',
      razon_social: 'Alfa Trading Chile SPA',
      rut: '77068553-2',
    },
    estado: 'pendiente',
    identificacion: {
      // fecha: new Date().toISOString(),
      fecha: new Date(),
      folio: folio,
      tipo_despacho: 'Por cuenta del emisor a instalaciones cliente',
      tipo_traslado: 'Venta por efectuar',
    },
    predio: {
      certificado: 'FSC CONTROLLED WOOD SA-CW 006947',
      comuna: 'TOLTEN',
      georreferencia: {
        latitude: -38.213758,
        longitude: -73.107909,
      },
      manzana: '243',
      nombre: 'LOTE 3',
      plan_de_manejo: ['N.M. 311/32-13/21'],
      rol: '243-62',
    },
    productos: [
      {
        calidad: 'Metro Ruma',
        cantidad: 14,
        claseDiametrica: '',
        especie: 'Pino',
        largo: 2.44,
        precio_ref: 38000,
        tipo: 'Pulpable',
        total: 1298079,
        unidad: 'mr',
        volumen: 34.16,
      },
    ],
    receptor: {
      comuna: 'NACIMIENTO',
      direccion: 'AVDA JULIO HEMMELMANN 320',
      giro: '',
      razon_social: 'CMPC PULP SPA',
      rut: '96532330-9',
    },
    precio_ref: 38000,
    total: 1298079,
  };

  try {
    const guiaDocumentId =
      'DTE_GD_' + rutEmpresa + 'f' + guia.identificacion.folio.toString();
    await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .doc(guiaDocumentId)
      .set(guia);
    console.log('Guía agregada a firebase: ', guiaDocumentId);
    Alert.alert(
      'Guía agregada correctamente',
      `Guía de folio: ${guia.identificacion.folio}`
    );
    return guia;
  } catch (e) {
    console.error('Error adding document: ', e);
    Alert.alert('Error al agregar guía');
    throw new Error(' Error al agregar guía ');
  }
};

export const fetchGuiasDocs = async (rutEmpresa: string) => {
  // Error addressed:
  // // 1. In the app create guia with folio 10 -> 2. Disconnect from the app -> 3. In Firestore console delete guia with folio 10 just created -> 4. Connect to the app -> 5. Read guias, deleted document is still being shown, however if any other change was made to the document, it will be updated.
  // For the moment, we will only read from server (not cache)
  // just to make sure that we are working with the latest data.
  // TODO: implement last_modified field
  try {
    const querySnapshot = await firestore()
      .collection(`empresas/${rutEmpresa}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .get();
    console.log('Guias read from cache: ', querySnapshot.metadata.fromCache);
    const guiasSummary: GuiaDespachoSummaryProps[] = [];
    querySnapshot.forEach((doc: FirebaseFirestoreTypes.DocumentData) => {
      const data = doc.data();
      const guiaData = {
        folio: data.identificacion.folio,
        estado: data.estado,
        monto_total_guia: data.total_guia || data.monto_total_guia,
        receptor: data.receptor,
        // We parse the firestore timestamp to a string
        fecha: formatDateToYYYYMMDD(data.identificacion.fecha.toDate()),
        url: data?.pdf_url ? data.pdf_url : '',
      };
      guiasSummary.push(guiaData);
    });
    return guiasSummary;
  } catch (e: any) {
    console.error('Error read document: ', e);
    throw new Error(`Error al leer guía(s): ${e}`);
  }
};

const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
