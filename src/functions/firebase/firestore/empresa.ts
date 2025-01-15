import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Alert } from "react-native";

// TODO: Optimize all this file along with ChatGPT after wrapping up the app.
export const fetchEmpresaDoc = async (empresaId: string) => {
  const empresaDocRequest = async (source: "cache" | "server") => {
    return firestore()
      .collection("empresas")
      .doc(empresaId)
      .get({ source: source });
  };
  const uponRequestResolution = (
    request: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => {
    const empresaData = request.data();
    const empresa = {
      rut: empresaData?.rut,
      razon_social: empresaData?.razon_social,
      giro: empresaData?.giro,
      direccion: empresaData?.direccion,
      comuna: empresaData?.comuna,
      actividad_economica: empresaData?.activ_econom,
      fecha_resolucion_sii: empresaData?.fecha_resolucion_sii,
      numero_resolucion_sii: empresaData?.numero_resolucion_sii,
    };
    console.log(`Empresa ${empresaData?.razon_social} fetched`);
    return empresa;
  };
  // first we try with server always, to make sure the app is up to date and works well
  try {
    const empresaFromServer = await empresaDocRequest("server");
    const response = uponRequestResolution(empresaFromServer);
    return response;
  } catch (e: any) {
    console.log(e);
    try {
      const empresaFromCache = await empresaDocRequest("cache");
      const response = uponRequestResolution(empresaFromCache);
      return response;
    } catch (e: any) {
      Alert.alert("Error al leer empresa (server y cache)", e);
      throw new Error("Error al leer empresa (servidor y cache)");
    }
  }
};
