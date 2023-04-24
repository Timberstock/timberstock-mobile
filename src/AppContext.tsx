import React, { createContext, useState, useEffect } from 'react';
import { Emisor, GuiaDespachoSummaryProps } from './interfaces/guias';
import { EmpresaData } from './interfaces/firestore';
import { readGuias } from './functions/firebase/guias';
import { Alert } from 'react-native';

type AppContextType = {
  guias: GuiaDespachoSummaryProps[];
  updateGuias: (guias: GuiaDespachoSummaryProps[]) => void;
  emisor: Emisor;
  updateEmisor: (emisor: Emisor) => void;
  retrievedData: EmpresaData;
  updateRetrievedData: (data: EmpresaData) => void;
};

const initialState = {
  guias: [],
  updateGuias: () => {},
  emisor: {
    razon_social: '',
    rut: '',
    giro: '',
    direccion: '',
    comuna: '',
    actividad_economica: [],
  },
  updateEmisor: () => {},
  retrievedData: {
    foliosDisp: [],
    proveedores: [],
    predios: [],
    productos: [],
    clientes: [],
  },
  updateRetrievedData: () => {},
};

export const AppContext = createContext<AppContextType>(initialState);

const AppProvider: any = ({ children }: any) => {
  const [guias, setGuias] = useState<GuiaDespachoSummaryProps[]>(
    initialState.guias
  );
  const [retrievedData, setRetrievedData] = useState<any>(
    initialState.retrievedData
  );
  const [emisor, setEmisor] = useState<Emisor>(initialState.emisor);

  const updateGuias = (guias: GuiaDespachoSummaryProps[]) => {
    setGuias(guias);
  };
  const updateEmisor = (emisor: Emisor) => {
    setEmisor(emisor);
  };

  const updateRetrievedData = (data: any) => {
    setRetrievedData(data);
  };

  const contextValue: AppContextType = {
    guias,
    updateGuias,
    emisor,
    updateEmisor,
    retrievedData,
    updateRetrievedData,
  };

  useEffect(() => {
    const fetchGuias = async () => {
      try {
        const guiasFromFirestore = await readGuias(emisor.rut);
        setGuias(guiasFromFirestore || []);
      } catch (error) {
        console.error('Error fetching guias:', error);
        Alert.alert('Error', 'No se pudieron obtener las guías');
      }
    };
    fetchGuias();
  }, [guias]);

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
