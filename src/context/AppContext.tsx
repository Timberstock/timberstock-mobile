import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { UserContext } from './UserContext';
import {
  fetchContratosCompra,
  fetchContratosVenta,
  fetchSubCollections,
} from '@/functions/firebase/firestore/subcollections';
import { fetchEmpresaDoc } from '@/functions/firebase/firestore/empresa';
import { fetchGuiasDocs } from '@/functions/firebase/firestore/guias';
import { ContratoVenta } from '@/interfaces/contratos/contratoVenta';
import { ContratoCompra } from '@/interfaces/contratos/contratoCompra';
import { GuiaDespachoSummaryProps } from '@/interfaces/screens/home';
import { Empresa, EmpresaSubCollectionsData } from '@/interfaces/context/app';

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
};

const initialState = {
  guiasSummary: [],
  updateGuiasSummary: () => {},
  empresa: {
    razon_social: '',
    rut: '',
    giro: '',
    direccion: '',
    comuna: '',
    actividad_economica: [],
    caf_n: -1,
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
};

export const AppContext = createContext<AppContextType>(initialState);

const AppProvider = ({ children }: any) => {
  const { user } = useContext(UserContext);

  const [guiasSummary, setGuiasSummary] = useState<GuiaDespachoSummaryProps[]>(
    initialState.guiasSummary
  );
  const [subCollectionsData, setSubCollectionsData] = useState<any>(
    initialState.subCollectionsData
  );
  const [empresa, setEmpresa] = useState<Empresa>(initialState.empresa);

  const [contratosCompra, setContratosCompra] = useState<ContratoCompra[]>(
    initialState.contratosCompra
  );
  const [contratosVenta, setContratosVenta] = useState<ContratoVenta[]>(
    initialState.contratosVenta
  );

  const updateEmpresa = (empresa: Empresa) => {
    setEmpresa(empresa);
  };

  const updateGuiasSummary = (newState: GuiaDespachoSummaryProps[]) => {
    setGuiasSummary(newState);
  };

  const updateSubCollectionsData = (
    newEmpresaData: EmpresaSubCollectionsData
  ) => {
    setSubCollectionsData(newEmpresaData);
  };

  // TODO: useMemo could be interesting here

  useEffect(() => {
    const listener = firestore()
      .collection(`empresas/${user?.empresa_id}/guias`)
      .orderBy('identificacion.fecha', 'desc')
      .onSnapshot((querySnapshot) => {
        const newGuias: GuiaDespachoSummaryProps[] = [];
        querySnapshot.forEach(
          (doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
            if (doc.exists) {
              const data = doc.data();
              const guiaData = {
                folio: data?.identificacion.folio,
                estado: data?.estado,
                total_guia: data?.total_guia,
                receptor: data?.receptor,
                // parse firestore timestamp to string
                fecha: data?.identificacion.fecha.toDate().toISOString(),
                url: data?.url,
              };
              return newGuias.push(guiaData);
            }
          }
        );
        updateGuiasSummary(newGuias);
      });
    if (user?.empresa_id) {
      const poblateData = async () => {
        // Should be onSnap instead as well? Test again this approach while disconnected...
        try {
          const contratosCompraFetched = await fetchContratosCompra(
            user.empresa_id
          );
          const contratosVentaFetched = await fetchContratosVenta(
            user.empresa_id
          );

          const subCollectionsFetched = await fetchSubCollections(
            user.empresa_id
          );
          const empresaFetched = await fetchEmpresaDoc(user.empresa_id);
          const guiasSummaryFetched = await fetchGuiasDocs(user.empresa_id);
          updateEmpresa(empresaFetched);
          setContratosCompra(contratosCompraFetched);
          setContratosVenta(contratosVentaFetched);
          updateSubCollectionsData(
            subCollectionsFetched as EmpresaSubCollectionsData
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
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
