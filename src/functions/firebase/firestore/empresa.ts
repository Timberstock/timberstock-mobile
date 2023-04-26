import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { Emisor } from '../../../interfaces/guias';

// TODO: Optimize all this file along with ChatGPT after wrapping up the app.
export const fetchEmpresaDoc = async (empresaId: string) => {
  const empresaDocRequest = async (source: 'cache' | 'server') => {
    return firestore()
      .collection('empresas')
      .doc(empresaId)
      .get({ source: source });
  };
  const uponRequestResolution = (
    request: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
  ) => {
    const empresaData = request.data();
    const emisor: Emisor = {
      rut: empresaData?.rut,
      razon_social: empresaData?.razon_social,
      giro: empresaData?.giro,
      direccion: empresaData?.direccion,
      comuna: empresaData?.comuna,
      actividad_economica: empresaData?.activ_econom,
    };
    const empresa = {
      emisor: emisor,
      caf_n: empresaData?.caf_n,
    };
    console.log(`Empresa ${empresaData?.razon_social} fetched`);
    return empresa;
  };
  // first we try with cache always, since we don't expect the data to change much
  try {
    const empresaFromCache = await empresaDocRequest('cache');
    const response = uponRequestResolution(empresaFromCache);
    return response;
  } catch (e: any) {
    console.log(e);
    const empresaFromServer = await empresaDocRequest('server');
    const response = uponRequestResolution(empresaFromServer);
    return response;
  }
};
