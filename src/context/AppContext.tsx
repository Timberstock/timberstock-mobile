import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { UserContext } from "./UserContext";
import {
  fetchContratosCompra,
  fetchContratosVenta,
  fetchSubCollections,
} from "@/functions/firebase/firestore/subcollections";
import { fetchEmpresaDoc } from "@/functions/firebase/firestore/empresa";
import { fetchGuiasDocs } from "@/functions/firebase/firestore/guias";
import { ContratoVenta } from "@/interfaces/contratos/contratoVenta";
import { ContratoCompra } from "@/interfaces/contratos/contratoCompra";
import { GuiaDespachoSummaryProps } from "@/interfaces/screens/home";
import { Empresa, EmpresaSubCollectionsData } from "@/interfaces/context/app";
import * as Updates from "expo-updates";

type AppContextType = {
  guiasSummary: GuiaDespachoSummaryProps[];
  updateGuiasSummary: (guiasSummary: GuiaDespachoSummaryProps[]) => void;
  empresa: Empresa;
  updateEmpresa: (empresa: Empresa) => void;
  // TODO: Maybe should be one single state for both?
  contratosCompra: ContratoCompra[];
  contratosVenta: ContratoVenta[];
  subCollectionsData: EmpresaSubCollectionsData;
  updateSubCollectionsData: (data: EmpresaSubCollectionsData) => void;
  handleUpdateAvailable: () => void;
};

const initialState = {
  guiasSummary: [],
  updateGuiasSummary: () => {},
  empresa: {
    razon_social: "",
    rut: "",
    giro: "",
    direccion: "",
    comuna: "",
    actividad_economica: [],
    fecha_resolucion_sii: firestore.Timestamp.now(),
    numero_resolucion_sii: "",
  },
  updateEmpresa: () => {},
  contratosVenta: [],
  contratosCompra: [],
  subCollectionsData: {
    proveedores: [],
    faenas: [],
    productos: [],
    clientes: [],
  },
  updateSubCollectionsData: () => {},
  updateFoliosDisp: () => {},
  handleUpdateAvailable: () => {},
};

export const AppContext = createContext<AppContextType>(initialState);

const AppProvider = ({ children }: any) => {
  const { user } = useContext(UserContext);

  const [guiasSummary, setGuiasSummary] = useState<GuiaDespachoSummaryProps[]>(
    initialState.guiasSummary,
  );
  const [subCollectionsData, setSubCollectionsData] = useState<any>(
    initialState.subCollectionsData,
  );
  const [empresa, setEmpresa] = useState<Empresa>(initialState.empresa);

  const [contratosCompra, setContratosCompra] = useState<ContratoCompra[]>(
    initialState.contratosCompra,
  );
  const [contratosVenta, setContratosVenta] = useState<ContratoVenta[]>(
    initialState.contratosVenta,
  );

  const updateEmpresa = (empresa: Empresa) => {
    setEmpresa(empresa);
  };

  const updateGuiasSummary = (newState: GuiaDespachoSummaryProps[]) => {
    setGuiasSummary(newState);
  };

  const updateSubCollectionsData = (
    newEmpresaData: EmpresaSubCollectionsData,
  ) => {
    setSubCollectionsData(newEmpresaData);
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // TODO: useMemo could be interesting here

  const handleUpdateAvailable = async () => {
    try {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        "Actualización descargada",
        "La aplicación se reiniciará para instalar la actualización",
      );
      await Updates.reloadAsync();
    } catch (error) {
      Alert.alert("Error", "No se pudo instalar la última actualización");
      console.error(error);
    }
  };

  useEffect(() => {
    const listener = firestore()
      .collection(`empresas/${user?.empresa_id}/guias`)
      .orderBy("identificacion.fecha", "desc")
      .onSnapshot((querySnapshot) => {
        const newGuias: GuiaDespachoSummaryProps[] = [];
        querySnapshot.forEach(
          (doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
            // Every attribute here must match the attributes in fetchGuiasDocs function in functions/firebase/firestore/guias.ts
            if (doc.exists) {
              const data = doc.data();
              const guiaData = {
                id: doc.id,
                folio: data?.identificacion.folio,
                estado: data?.estado,
                monto_total_guia: data?.monto_total_guia,
                receptor: data?.receptor,
                // parse firestore timestamp to string
                fecha: formatDateToYYYYMMDD(
                  data?.identificacion.fecha.toDate(),
                ),
                pdf_url: data?.pdf_url,
                volumen_total_emitido: data?.volumen_total_emitido,
              };
              newGuias.push(guiaData);
              return;
            }
          },
        );
        updateGuiasSummary(newGuias);
      });
    if (user?.empresa_id) {
      const poblateData = async () => {
        // Should be onSnap instead as well? Test again this approach while disconnected...
        try {
          const contratosCompraFetched = await fetchContratosCompra(
            user.empresa_id,
          );
          const contratosVentaFetched = await fetchContratosVenta(
            user.empresa_id,
          );

          const subCollectionsFetched = await fetchSubCollections(
            user.empresa_id,
          );
          const empresaFetched = await fetchEmpresaDoc(user.empresa_id);
          // WHY ARE GUIAS SUMMARY BEING FETCHED FOR A SECOND TIME HERE?
          const guiasSummaryFetched = await fetchGuiasDocs(user.empresa_id);
          updateEmpresa(empresaFetched);
          setContratosCompra(contratosCompraFetched);
          setContratosVenta(contratosVentaFetched);
          updateSubCollectionsData(
            subCollectionsFetched as EmpresaSubCollectionsData,
          );
          updateGuiasSummary(guiasSummaryFetched);
        } catch (err: any) {
          console.log(err);
          Alert.alert(err);
        }
      };
      poblateData();
    }
    return () => listener();
  }, []);

  const contextValue: AppContextType = {
    guiasSummary,
    updateGuiasSummary,
    contratosCompra,
    contratosVenta,
    empresa,
    updateEmpresa,
    subCollectionsData,
    updateSubCollectionsData,
    handleUpdateAvailable,
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
