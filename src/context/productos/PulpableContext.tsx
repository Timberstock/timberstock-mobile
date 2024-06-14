import React, { createContext, useState } from 'react';

// Define type of exposed parts of context

type PulpableContextType = {
  banco1: {
    altura1: number;
    altura2: number;
    ancho: number;
  };
  banco2: {
    altura1: number;
    altura2: number;
    ancho: number;
  };
  banco3: {
    altura1: number;
    altura2: number;
    ancho: number;
  };
  banco4: {
    altura1: number;
    altura2: number;
    ancho: number;
  };
  banco5: {
    altura1: number;
    altura2: number;
    ancho: number;
  };
  banco6: {
    altura1: number;
    altura2: number;
    ancho: number;
  };
  updatePulpableValue: (label: string, value: number) => void;
};

const initialState = {
  clasesDiametricas: {
    14: 0,
    16: 0,
    18: 0,
    20: 0,
  },
  updateClaseDiametricaValue: () => {},
};

// Create context to enable access to the context values
export const PulpableContext = createContext<PulpableContextType>(initialState);

export function PulpableContextProvider({ children }: any) {
  const [clasesDiametricas, setClasesDiametricas] = useState(
    initialState.clasesDiametricas
  );

  const updateClaseDiametricaValue = (label: string, value: number) => {
    // Values are to be updated one row at a time, which are identified by the label
    setClasesDiametricas((prevValue: any) => ({
      ...prevValue,
      [label]: value,
    }));
  };

  return (
    <PulpableContext.Provider
      value={{ clasesDiametricas, updateClaseDiametricaValue }}
    >
      {children}
    </PulpableContext.Provider>
  );
}
