import React, { createContext, useEffect, useRef, useState } from 'react';
import { Usuario, UsuarioFirestoreData } from '../interfaces/usuario';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {
  createUserDocSnapListener,
  getCurrentAuthUser,
  getUserDocRef,
} from '../functions/firebase/auth';

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

  const updateUserAuth = (newUser: FirebaseAuthTypes.User | null) => {
    // Signing Out
    if (!newUser) {
      setUser(null);
      return;
    }
    // Logging in
    // For simplicity, we assign a reference to Firebase Authentication's User to our user state
    const userAuth = {
      firebaseAuth: newUser,
      nombre: '',
      rut: '',
      empresa_id: '',
      email: '',
    };
    setUser(userAuth);
  };

  // Following blocks are just for reducing the number of reads to firestore.
  // Ref the function that uses this for more details
  const previousSnapshotRef =
    useRef<FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(
      null
    );
  const listenerRef = useRef<(() => void) | null>(null);
  // Called just by the callback function of the snapshot listener, thus not provided as part of the context
  const updateUserFirestore = (newUser: UsuarioFirestoreData) => {
    newUser.firebaseAuth = getCurrentAuthUser();
    setUser(newUser as Usuario);
  };

  useEffect(() => {
    // After logging in with Firebase Authentication, read from Firestore
    console.log(user);
    if (user && user.firebaseAuth) {
      const userDocRef = getUserDocRef(user.firebaseAuth.uid);
      listenerRef.current = createUserDocSnapListener(
        userDocRef,
        previousSnapshotRef,
        updateUserFirestore
      );
    } else {
      // After logging out, unsubscribe from Firestore
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    }

    return () => {
      // When unmounting the component, unsubscribe from Firestore
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [user]);

  const contextValue: UserContextType = {
    user,
    updateUserAuth,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
