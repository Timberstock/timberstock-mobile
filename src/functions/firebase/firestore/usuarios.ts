import firestore from '@react-native-firebase/firestore';
import { UsuarioFirestoreData } from '../../../interfaces/usuario';
import customHelpers from '../../helpers';
import { Alert } from 'react-native';

const fetchUserInfoFromCache = async (
  userUid: string
): Promise<UsuarioFirestoreData> => {
  const userDocRef = firestore().collection('usuarios').doc(userUid);
  const userDoc = await userDocRef.get({ source: 'cache' });
  if (userDoc.exists) {
    const userData = userDoc.data() as UsuarioFirestoreData;
    console.log('Data read from cache');
    return userData;
  } else {
    throw new Error('Could not find user in cache');
  }
};

const fetchUserInfoFromServer = async (
  userUid: string
): Promise<UsuarioFirestoreData> => {
  const userDocRef = firestore().collection('usuarios').doc(userUid);
  const userDoc = await userDocRef.get({ source: 'server' });
  if (userDoc.exists) {
    firestore().collection('usuarios').doc(userUid).update({
      last_login: new Date(),
    });
    const userData = userDoc.data() as UsuarioFirestoreData;
    console.log('Data read from server');
    return userData;
  } else {
    throw new Error('Could not find user in server');
  }
};

export const retrieveUserFirestoreInformation = async (
  userUid: string
): Promise<UsuarioFirestoreData | null> => {
  // This will be the final version, but for now we will just return the user data from the server
  try {
    // First try to get the user info from the cache
    const userDataFromCache = await fetchUserInfoFromCache(userUid);
    const daysSinceLastLogin = customHelpers.daysSinceFirestoreTimestamp(
      userDataFromCache.last_login
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
        'Error usuario (server y cache)',
        'No se pudo obtener la información del usuario'
      );
      return null;
    }
  }
};

export const updateUserFirestore = async (
  userUid: string,
  newFoliosReservados: number[],
  newCafs?: string[]
) => {
  try {
    if (!newCafs) {
      await firestore().collection('usuarios').doc(userUid).update({
        folios_reservados: newFoliosReservados,
      });
    } else {
      await firestore().collection('usuarios').doc(userUid).update({
        folios_reservados: newFoliosReservados,
        cafs: newCafs,
      });
    }
    return 200;
  } catch (e) {
    console.error(e);
    throw new Error('Error al actualizar usuario');
  }
};
