import React, { createContext, useState, useEffect, useContext } from 'react';
import { GuiaDespachoSummaryProps } from '../interfaces/guias';
import { EmpresaSubCollectionsData } from '../interfaces/firestore';
import { Empresa } from '../interfaces/empresa';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { UserContext } from './UserContext';
import customHelpers from '../functions/helpers';
import { fetchSubCollections } from '../functions/firebase/firestore/subcollections';
import { fetchEmpresaDoc } from '../functions/firebase/firestore/empresa';
import { fetchGuiasDocs } from '../functions/firebase/firestore/guias';
import { Alert } from 'react-native';

type AppContextType = {
  guiasSummary: GuiaDespachoSummaryProps[];
  updateGuiasSummary: (guiasSummary: GuiaDespachoSummaryProps[]) => void;
  empresa: Empresa;
  updateEmpresa: (empresa: Empresa) => void;
  subCollectionsData: EmpresaSubCollectionsData;
  updateSubCollectionsData: (data: EmpresaSubCollectionsData) => void;
};

const initialState = {
  guiasSummary: [],
  updateGuiasSummary: () => {},
  empresa: {
    emisor: {
      razon_social: '',
      rut: '',
      giro: '',
      direccion: '',
      comuna: '',
      actividad_economica: [],
    },
    caf_n: -1,
  },
  updateEmpresa: () => {},
  subCollectionsData: {
    proveedores: [],
    predios: [],
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
                total: data?.total,
                receptor: data?.receptor,
                // we parse firestore timestamp to string
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
        try {
          const subCollectionsFetched = await fetchSubCollections(
            user.empresa_id
          );
          const empresaFetched = await fetchEmpresaDoc(user.empresa_id);
          const guiasSummaryFetched = await fetchGuiasDocs(user.empresa_id);
          updateEmpresa(empresaFetched);
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
