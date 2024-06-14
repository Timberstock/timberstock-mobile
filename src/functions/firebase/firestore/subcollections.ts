import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Cliente } from '../../../interfaces/firestore';
import { Predio, Producto, Proveedor } from '../../../interfaces/detalles';
import { Alert } from 'react-native';
import { ContratoCompra } from '../../../interfaces/contratos/contratoCompra';
import { ContratoVenta } from '../../../interfaces/contratos/contratoVenta';

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
  // TODO: Make sure when we get the contratos that we only get contratos vigentes
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

export const fetchContratosCompra = async (
  empresaId: string
): Promise<ContratoCompra[]> => {
  const contratosCompraCollectionReq = firestore()
    .collection('empresas')
    .doc(empresaId)
    .collection('contratos_compra')
    .where('vigente', '==', true);

  try {
    const contratosCompraCollectionFromServer =
      await contratosCompraCollectionReq.get({ source: 'server' });
    const response = contratosCompraCollectionFromServer;
    // TODO: parse the data from the docs?
    const contratosCompra = [];
    for (const doc of response.docs) {
      const contratoCompra = doc.data();
      contratoCompra.id = doc.id;
      contratosCompra.push(contratoCompra as ContratoCompra);
    }
    return contratosCompra;
  } catch (e: any) {
    try {
      const contratosCompraCollectionFromCache =
        await contratosCompraCollectionReq.get({ source: 'cache' });
      const response = contratosCompraCollectionFromCache;
      const contratosCompra = [];
      for (const doc of response.docs) {
        const contratoCompra = doc.data();
        contratoCompra.id = doc.id;
        contratosCompra.push(contratoCompra as ContratoCompra);
      }
      return contratosCompra;
    } catch (e: any) {
      console.log(e);
      throw new Error(`Error sub colecciones (server y cache): ${e}`);
    }
  }
};
export const fetchContratosVenta = async (
  empresaId: string
): Promise<ContratoVenta[]> => {
  const contratosVentaCollectionReq = firestore()
    .collection('empresas')
    .doc(empresaId)
    .collection('contratos_venta')
    .where('vigente', '==', true);

  try {
    const contratosVentaCollectionFromServer =
      await contratosVentaCollectionReq.get({ source: 'server' });
    const response = contratosVentaCollectionFromServer;
    // TODO: parse the data from the docs?
    const contratosVenta = [];
    for (const doc of response.docs) {
      const contratoVenta = doc.data();
      contratoVenta.id = doc.id;
      contratosVenta.push(contratoVenta as ContratoVenta);
    }
    return contratosVenta;
  } catch (e: any) {
    try {
      const contratosVentaCollectionFromServer =
        await contratosVentaCollectionReq.get({ source: 'cache' });
      const response = contratosVentaCollectionFromServer;
      // TODO: parse the data from the docs?
      const contratosVenta = [];
      for (const doc of response.docs) {
        const contratoVenta = doc.data();
        contratoVenta.id = doc.id;
        contratosVenta.push(contratoVenta as ContratoVenta);
      }
      return contratosVenta;
    } catch (e: any) {
      console.log(e);
      throw new Error(`Error sub colecciones (server y cache): ${e}`);
    }
  }
};
