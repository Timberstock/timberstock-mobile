import React, { createContext, useState } from "react";
import { CAF, Usuario } from "@/interfaces/context/user";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { retrieveUserSafe } from "@/functions/firebase/firestore/usuarios";
import { updateUserFirestore } from "@/functions/firebase/firestore/usuarios";

type UserContextType = {
  user: Usuario | null;
  updateUserAuth: (user: FirebaseAuthTypes.User | null) => Promise<void>;
  updateUserReservedFolios: (
    newReservedFolios: number[],
    newCafs?: CAF[],
  ) => Promise<void>;
  devolverFolios: () => Promise<void>;
};

const initialState = {
  user: null,
  updateUserAuth: () => Promise.resolve(),
  updateUserReservedFolios: () => Promise.resolve(),
  devolverFolios: () => Promise.resolve(),
};

// Context
export const UserContext = createContext<UserContextType>(initialState);

// Provider
export const UserContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const updateUserAuth = async (
    newAuthUser: FirebaseAuthTypes.User | null,
  ): Promise<void> => {
    // Logging Out
    if (!newAuthUser) {
      setUser(null);
      return;
    }

    // Logging in
    // For simplicity, we assign a reference to Firebase Authentication's User to our user state
    console.log("Retrieving user information...\n\n");
    // We see if there is a folder in the document directory with the user's empresa_id name

    // const newUserFirestoreData = await retrieveUserFirestoreInformation(
    // For now we will try to retrieve the user's information as safe as possible
    const newUserFirestoreData = (await retrieveUserSafe(
      newAuthUser.uid,
    )) as Usuario;

    const newUser = {
      firebaseAuth: newAuthUser,
      empresa_id: newUserFirestoreData?.empresa_id,
      rut: newUserFirestoreData?.rut,
      nombre: newUserFirestoreData?.nombre,
      email: newUserFirestoreData?.email,
      folios_reservados: newUserFirestoreData?.folios_reservados,
      cafs: newUserFirestoreData?.cafs,
    };
    setUser(newUser as Usuario);
  };

  const updateUserReservedFolios = async (
    newReservedFolios: number[],
    newCafs?: CAF[],
  ) => {
    if (!user || !user.firebaseAuth) return;
    try {
      // This is exactly the same change that the Cloud Function does in production
      // but this is to ensure that the user's folios are updated in case we can't read from the server.
      let newUser: Usuario;
      if (newCafs) {
        // case we are updating the user's cafs
        await updateUserFirestore(
          user.firebaseAuth.uid,
          newReservedFolios,
          newCafs,
        );

        console.log("Attempting to update user's CAFs locally");

        // We update the user's folios locally without reading from the database
        newUser = {
          ...user,
          folios_reservados: [
            ...new Set([...user.folios_reservados, ...newReservedFolios]),
          ],
          cafs: [...user.cafs, ...newCafs],
        };
      } else {
        // case we are not updating the user's cafs
        await updateUserFirestore(
          user.firebaseAuth.uid,
          newReservedFolios,
          user.cafs,
        );
        newUser = {
          ...user,
          // we are just updating the folios reserved by popping the just used folio
          folios_reservados: newReservedFolios,
        };
      }
      setUser(newUser);
      console.log("User reserved folios updated successfully");
    } catch (error) {
      alert("Error al cargar folios");
      console.error(error);
    }
  };

  const devolverFolios = async () => {
    if (!user || !user.firebaseAuth) return;
    try {
      // This is exactly the same change that the Cloud Function does in production
      // but this is to ensure that the user's folios are updated in case we can't read from the server.
      let newUser: Usuario;
      await updateUserFirestore(user.firebaseAuth.uid, [], []);
      newUser = {
        ...user,
        folios_reservados: [],
        cafs: [],
      };
      setUser(newUser);
      console.log("User reserved folios updated successfully");
    } catch (error) {
      alert("Error al devolver folios");
      console.log(error);
    }
  };

  const contextValue: UserContextType = {
    user,
    updateUserAuth,
    updateUserReservedFolios,
    devolverFolios,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
