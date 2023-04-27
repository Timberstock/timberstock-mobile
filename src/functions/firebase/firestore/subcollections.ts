import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Cliente } from '../../../interfaces/firestore';
import { Predio, Producto, Proveedor } from '../../../interfaces/detalles';
import { Alert } from 'react-native';

// This function is used to retrieve data form Firestore and then
// push it to an array that is passed.
const getIndividualData = async (
  source: 'cache' | 'server',
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
    .get({ source: source });
  collection.docs.map((document) => {
    arrayToPush.push(document.data());
  });
  return arrayToPush;
};

const empresaSubCollectionRequestConstructor = (empresaId: string) => {
  const proveedores: any[] = [];
  const predios: FirebaseFirestoreTypes.DocumentData[] = [];
  const productos: FirebaseFirestoreTypes.DocumentData[] = [];
  const clientes: FirebaseFirestoreTypes.DocumentData[] = [];

  const contratosDocRequest = async (
    source: 'cache' | 'server',
    second_collection: string
  ) => {
    return firestore()
      .collection('empresas')
      .doc(empresaId)
      .collection(second_collection)
      .get({ source: source });
  };
  const contratosSubCollectionsDocRequest = async (
    source: 'cache' | 'server',
    contratosCollection: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
    contratosVentaCollection: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>
  ) => {
    for (const doc of contratosCollection.docs) {
      const contrato = doc.data();
      proveedores.push(contrato.proveedor);

      await getIndividualData(
        source,
        empresaId,
        doc.id,
        'contratos',
        'predios',
        predios
      );

      await getIndividualData(
        source,
        empresaId,
        doc.id,
        'contratos',
        'productos',
        productos
      );
    }

    for (const doc of contratosVentaCollection.docs) {
      await getIndividualData(
        source,
        empresaId,
        doc.id,
        'contratos_venta',
        'clientes',
        clientes
      );
    }
    return {
      proveedores: proveedores,
      predios: predios as Predio[],
      productos: productos as Producto[],
      clientes: clientes as Cliente[],
    };
  };

  const uponRequestResolution = async (source: 'cache' | 'server') => {
    const contratosCollection = await contratosDocRequest(source, 'contratos');
    const contratosVentaCollection = await contratosDocRequest(
      source,
      'contratos_venta'
    );
    const response = await contratosSubCollectionsDocRequest(
      source,
      contratosCollection,
      contratosVentaCollection
    );
    return response;
  };
  return uponRequestResolution;
};

export const fetchSubCollections = async (
  empresaId: string
): Promise<{
  proveedores: Proveedor[];
  predios: Predio[];
  productos: Producto[];
  clientes: Cliente[];
}> => {
  // In order to unclutter and reduce code duplicate, we call a function constructor
  const empresaSubCollectionRequest =
    empresaSubCollectionRequestConstructor(empresaId);
  try {
    const empresaFromServer = await empresaSubCollectionRequest('server');
    const response = empresaFromServer;
    return response;
  } catch (e: any) {
    try {
      const empresaFromCache = await empresaSubCollectionRequest('cache');
      const response = empresaFromCache;
      return response;
    } catch (e: any) {
      console.log(e);
      throw new Error(`Error sub colecciones (server y cache): ${e}`);
    }
  }
};
