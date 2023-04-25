import React, { createContext, useState, useEffect } from 'react';
import { Emisor, GuiaDespachoSummaryProps } from '../interfaces/guias';
import { EmpresaData } from '../interfaces/firestore';

type AppContextType = {
  guiasSummary: GuiaDespachoSummaryProps[];
  updateGuiasSummary: (guiasSummary: GuiaDespachoSummaryProps[]) => void;
  emisor: Emisor;
  updateEmisor: (emisor: Emisor) => void;
  retrievedData: EmpresaData;
  updateRetrievedData: (data: EmpresaData) => void;
};

const initialState = {
  guiasSummary: [],
  updateGuiasSummary: () => {},
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
  const [guiasSummary, setGuiasSummary] = useState<GuiaDespachoSummaryProps[]>(
    initialState.guiasSummary
  );
  const [retrievedData, setRetrievedData] = useState<any>(
    initialState.retrievedData
  );
  const [emisor, setEmisor] = useState<Emisor>(initialState.emisor);

  const updateGuiasSummary = (guiasSummary: GuiaDespachoSummaryProps[]) => {
    setGuiasSummary(guiasSummary);
  };

  const updateEmisor = (emisor: Emisor) => {
    setEmisor(emisor);
  };

  // If we are updating more than one state "in the same time" here
  // this is the last to update.
  const updateRetrievedData = (newEmpresaData: EmpresaData) => {
    // TODO: Reordernar y actualizar los folios disponibles
    // cada vez que se lean.
    setRetrievedData(newEmpresaData);
  };

  const contextValue: AppContextType = {
    guiasSummary,
    updateGuiasSummary,
    emisor,
    updateEmisor,
    retrievedData,
    updateRetrievedData,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
