import React, { createContext, useRef, useState } from 'react';
import { Usuario } from '../interfaces/usuario';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { retrieveUserFirestoreInformation } from '../functions/firebase/firestore/usuarios';

type UserContextType = {
  user: Usuario | null;
  updateUserAuth: (user: FirebaseAuthTypes.User | null) => void;
};

const initialState = {
  user: null,
  updateUserAuth: () => {},
};

// Context
export const UserContext = createContext<UserContextType>(initialState);

// Provider
export const UserContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const updateUserAuth = async (newAuthUser: FirebaseAuthTypes.User | null) => {
    // Logging Out
    if (!newAuthUser) {
      setUser(null);
      return;
    }

    // Logging in
    // For simplicity, we assign a reference to Firebase Authentication's User to our user state
    console.log('Retrieving user information...\n\n');
    const newUserFirestoreData = await retrieveUserFirestoreInformation(
      newAuthUser.uid
    );
    const newUser = {
      firebaseAuth: newAuthUser,
      empresa_id: newUserFirestoreData?.empresa_id,
      rut: newUserFirestoreData?.rut,
      nombre: newUserFirestoreData?.nombre,
      email: newUserFirestoreData?.email,
    };

    setUser(newUser as Usuario);
  };

  const contextValue: UserContextType = {
    user,
    updateUserAuth,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
