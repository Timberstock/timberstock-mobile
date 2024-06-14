import React, { createContext, useState } from 'react';

// Define type of exposed parts of context

type AserrableContextType = {
  clasesDiametricas: {
    14: number;
    16: number;
    18: number;
    20: number;
  };
  updateClaseDiametricaValue: (label: string, value: number) => void;
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
export const AserrableContext =
  createContext<AserrableContextType>(initialState);

export function AserrableContextProvider({ children }: any) {
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
    <AserrableContext.Provider
      value={{ clasesDiametricas, updateClaseDiametricaValue }}
    >
      {children}
    </AserrableContext.Provider>
  );
}
