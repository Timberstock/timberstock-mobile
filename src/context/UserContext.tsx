import React, { createContext, useState, useEffect, useMemo } from 'react';
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

// Crear el contexto
export const UserContext = createContext<UserContextType>(initialState);

// Crear un proveedor de contexto
export const UserContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const updateUserInfoFromFirestore = async (user: Usuario) => {
      const userData = await fetchUserData(user.uid);
      user.nombre = userData?.nombre;
      user.empresa_id = userData?.empresa_id;
      user.rut = userData?.rut;
      setUser(user);
    };

    // No correr el fetch si el user ya tiene una empresa_id (ya se corrio una vez)
    if (user?.empresa_id) return;

    // Actualizamos la información del user con la de Firebase
    if (user) updateUserInfoFromFirestore(user);
  }, [user]);

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
