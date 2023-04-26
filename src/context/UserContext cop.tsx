import React, { createContext, useEffect, useState } from 'react';
import { Usuario } from '../interfaces/usuario';
import { userInfoFirestoreListener } from '../functions/firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

type UserContextType = {
  user: Usuario | null;
  updateUserData: (user: FirebaseFirestoreTypes.DocumentData | null) => void;
  updateUserAuth: (user: Usuario | null) => void;
};

const initialState = {
  user: null,
  updateUserData: () => {},
  updateUserAuth: () => {},
};

// Context
export const UserContext = createContext<UserContextType>(initialState);

// Provider
export const UserContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<Usuario | null>(null);
  //   const [listener, setListener] = useState<any>(null); // TODO: Check type eventually

  useEffect(() => {
    return () => {
      listener();
    };
  }, []);

  //   const updateUser = async (newUser: Usuario | null) => {
  //     if (newUser) {
  //       const userData = await fetchUserData(newUser.uid);
  //       newUser.nombre = userData?.nombre;
  //       newUser.empresa_id = userData?.empresa_id;
  //       newUser.rut = userData?.rut;
  //     }
  //     setUser(newUser);
  //   };

  const updateUserData = (
    newUserData: FirebaseFirestoreTypes.DocumentData | null
  ) => {
    user ? (user.nombre = newUserData?.nombre) : null;
    user ? (user.empresa_id = newUserData?.empresa_id) : null;
    user ? (user.rut = newUserData?.rut) : null;
    setUser(user);
  };

  const updateUserAuth = (newUser: Usuario | null) => {
    // if (newUser) {
    //   setListener(
    //     userInfoFirestoreListener(newUser.uid, updateUserData, previousSnapshot)
    //   );
    // }
    setUser(newUser);
  };

  const contextValue: UserContextType = {
    user,
    updateUserData,
    updateUserAuth,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
