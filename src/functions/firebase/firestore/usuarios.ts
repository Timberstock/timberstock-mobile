import firestore from '@react-native-firebase/firestore';
import { UsuarioFirestoreData } from '../../../interfaces/usuario';
import customHelpers from '../../helpers';

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
  // Mixed way of getting the user info, first from cache and then from server
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
