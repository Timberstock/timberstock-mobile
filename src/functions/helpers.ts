import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

export const formatDate = (date: Date) => {
  return `${[
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/')} ${[
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':')}`;
};

// This function is used to retrieve data form Firestore and then
// push it to an array that is passed. It is used in the fetchData function.
export const getIndividualData = async (
  empresaId: string,
  docId: string,
  collection1Name: string,
  collection2Name: string,
  arrayToPush: FirebaseFirestoreTypes.DocumentData[]
) => {
  const collection = await firestore()
    .collection('empresas')
    .doc(empresaId)
    .collection(collection1Name)
    .doc(docId)
    .collection(collection2Name)
    .get();
  collection.docs.map((document) => {
    arrayToPush.push(document.data());
  });
  return arrayToPush;
};
