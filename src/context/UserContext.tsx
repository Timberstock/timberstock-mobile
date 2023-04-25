import React, { createContext, useState } from 'react';
import { Usuario } from '../interfaces/usuario';
import { fetchUserData } from '../functions/firebase/auth';

type UserContextType = {
  user: Usuario | null;
  updateUser: (user: Usuario | null) => void;
};

const initialState = {
  user: null,
  updateUser: () => {},
};

// Context
export const UserContext = createContext<UserContextType>(initialState);

// Provider
export const UserContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const updateUser = async (newUser: Usuario | null) => {
    if (newUser) {
      const userData = await fetchUserData(newUser.uid);
      newUser.nombre = userData?.nombre;
      newUser.empresa_id = userData?.empresa_id;
      newUser.rut = userData?.rut;
    }
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
