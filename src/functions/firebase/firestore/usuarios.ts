import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Cafs, UsuarioFirestoreData } from "@/interfaces/context/user";
import { Alert } from "react-native";

const daysSinceFirestoreTimestamp = (
  timestamp: FirebaseFirestoreTypes.Timestamp,
): number => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const timestampDate = timestamp.toDate();
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - timestampDate.getTime();
  const daysDiff = Math.round(timeDiff / millisecondsPerDay);
  return daysDiff;
};

const fetchUserInfoFromCache = async (
  userUid: string,
): Promise<UsuarioFirestoreData> => {
  const userDocRef = firestore().collection("usuarios").doc(userUid);
  const userDoc = await userDocRef.get({ source: "cache" });
  if (userDoc.exists) {
    const userData = userDoc.data() as UsuarioFirestoreData;
    console.log("Data read from cache");
    return userData;
  } else {
    throw new Error("Could not find user in cache");
  }
};

const fetchUserInfoFromServer = async (
  userUid: string,
): Promise<UsuarioFirestoreData> => {
  const userDocRef = firestore().collection("usuarios").doc(userUid);
  const userDoc = await userDocRef.get({ source: "server" });
  if (userDoc.exists) {
    firestore().collection("usuarios").doc(userUid).update({
      last_login: new Date(),
    });
    const userData = userDoc.data() as UsuarioFirestoreData;
    console.log("Data read from server");
    return userData;
  } else {
    throw new Error("Could not find user in server");
  }
};

export const retrieveUserFirestoreInformation = async (
  userUid: string,
): Promise<UsuarioFirestoreData | null> => {
  // This will be the final version, but for now we will just return the user data from the server
  try {
    // First try to get the user info from the cache
    const userDataFromCache = await fetchUserInfoFromCache(userUid);
    const daysSinceLastLogin = daysSinceFirestoreTimestamp(
      userDataFromCache.last_login,
    );
    if (daysSinceLastLogin > 3) {
      try {
        // If the last login was more than 3 days ago, get the user info from the server
        const userDataFromServer = await fetchUserInfoFromServer(userUid);
        return userDataFromServer;
      } catch (e) {
        return userDataFromCache;
      }
    }
    return userDataFromCache;
  } catch (e) {
    // Case no data from cache
    const userDataFromServer = await fetchUserInfoFromServer(userUid);
    return userDataFromServer;
  }
};

export const retrieveUserSafe = async (userUid: string) => {
  // Just for now
  try {
    const userDataFromServer = await fetchUserInfoFromServer(userUid);
    return userDataFromServer;
  } catch (e) {
    try {
      const userDataFromCache = await fetchUserInfoFromCache(userUid);
      return userDataFromCache;
    } catch (e) {
      Alert.alert(
        "Error usuario (server y cache)",
        "No se pudo obtener la información del usuario",
      );
      return null;
    }
  }
};

export const updateUserFirestore = async (
  userUid: string,
  newFoliosReservados: number[],
  newCafs?: Cafs,
) => {
  function snapshotPromise(
    ref: FirebaseFirestoreTypes.DocumentReference,
  ): Promise<FirebaseFirestoreTypes.DocumentSnapshot> {
    // From https://github.com/firebase/firebase-js-sdk/issues/1497
    // Workaround for the issue of createGuiaDoc not resolving when creating a new guia offline.
    // The issue is that the set() function returns a promise that resolves only when the data is written to the server.
    // So with this workaround, we are listening to the snapshot of the document, and resolving the promise when the snapshot is received.
    return new Promise((resolve, reject) => {
      var unsubscribe = ref.onSnapshot(
        (doc) => {
          resolve(doc);
          unsubscribe();
        },
        (error) => {
          reject(error);
        },
      );
    });
  }

  try {
    if (!newCafs) {
      console.log({
        folios_reservados: newFoliosReservados,
      });
      const userDocRef = firestore().collection("usuarios").doc(userUid);
      userDocRef.update({
        folios_reservados: newFoliosReservados,
      });

      const userDoc = await snapshotPromise(userDocRef);

      // if (userDoc.metadata.hasPendingWrites) {}
    } else {
      console.log({
        folios_reservados: newFoliosReservados,
        cafs: newCafs,
      });
      const userDocRef = firestore().collection("usuarios").doc(userUid);
      userDocRef.update({
        folios_reservados: newFoliosReservados,
        cafs: newCafs,
      });
      const userDoc = await snapshotPromise(userDocRef);
      // if (userDoc.metadata.hasPendingWrites) {}
    }
    return 200;
  } catch (e) {
    console.error(e);
    throw new Error("Error al actualizar usuario");
  }
};

// Devolver folios
export const devolverFolios = async (userUid: string) => {
  try {
    const userDocRef = firestore().collection("usuarios").doc(userUid);
    userDocRef.update({
      folios_reservados: [],
      cafs: {},
    });
    return 200;
  } catch (e) {
    console.error(e);
    throw new Error("Error al devolver folios");
  }
};
