import React, { createContext, useState, useEffect } from 'react';
import { Usuario } from '../interfaces/usuario';

type UserContextType = {
  user: Usuario | null;
  updateUser: (user: Usuario | null) => void;
};

const initialState = {
  user: null,
  updateUser: () => {},
};

// Crear el contexto
export const UserContext = createContext<UserContextType>(initialState);

// Crear un proveedor de contexto
export const UserContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // Aquí puedes añadir tu lógica para escuchar cambios en Firebase y actualizar el estado
  }, []);

  const updateUser = (newUser: Usuario | null) => {
    setUser(newUser);
  };

  const contextValue: UserContextType = {
    user,
    updateUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
