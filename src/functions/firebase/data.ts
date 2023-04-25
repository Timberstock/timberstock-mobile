import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Cliente } from '../../interfaces/firestore';
import { Predio, Producto, Proveedor } from '../../interfaces/detalles';
import customHelpers from '../helpers';

// TODO: Optimize all this file along with ChatGPT after wrapping up the app.
export const fetchInfoEmpresa = async (empresaId: string) => {
  try {
    const empresaInfo = await firestore()
      .collection('empresas')
      .doc(empresaId)
      .get();
    const empresaData = empresaInfo.data();
    const empresa = {
      actividad_economica: empresaData?.activ_econom, // change this to actividad_economica at sometime
      comuna: empresaData?.comuna,
      rut: empresaData?.rut,
      razon_social: empresaData?.razon_social,
      giro: empresaData?.giro,
      direccion: empresaData?.direccion,
      caf_n: empresaData?.caf_n,
    };
    console.log(`Empresa ${empresaData?.razon_social} fetched`);
    return empresa;
  } catch (e: any) {
    console.log(e);
  }
};

export const fetchData = async (
  empresaId: string
): Promise<{
  proveedores: Proveedor[];
  predios: Predio[];
  productos: Producto[];
  clientes: Cliente[];
}> => {
  try {
    const proveedores = [];
    const predios: FirebaseFirestoreTypes.DocumentData[] = [];
    const productos: FirebaseFirestoreTypes.DocumentData[] = [];
    const clientes: FirebaseFirestoreTypes.DocumentData[] = [];

    const contratosCollection = await firestore()
      .collection('empresas')
      .doc(empresaId)
      .collection('contratos')
      .get();

    const contratosVentaCollection = await firestore()
      .collection('empresas')
      .doc(empresaId)
      .collection('contratos_venta')
      .get();

    for (const doc of contratosCollection.docs) {
      const contrato = doc.data();
      proveedores.push(contrato.proveedor);

      await customHelpers.getIndividualData(
        empresaId,
        doc.id,
        'contratos',
        'predios',
        predios
      );

      await customHelpers.getIndividualData(
        empresaId,
        doc.id,
        'contratos',
        'productos',
        productos
      );
    }

    for (const doc of contratosVentaCollection.docs) {
      await customHelpers.getIndividualData(
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
  } catch (e: any) {
    console.log(e);
    return e.message;
  }
};

// TODO: REMOVE ANYs
