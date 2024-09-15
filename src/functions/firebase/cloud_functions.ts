import axios from "axios";
import { requestReservarFoliosResponse } from "@/interfaces/firestore/cloud_functions";
// @ts-ignore
// import { FIREBASE_CLOUD_FUNCTIONS_URL } from "@/../";

// PROD
export const FIREBASE_CLOUD_FUNCTIONS_URL =
  "https://us-central1-timberstock-firebase.cloudfunctions.net";
// DEV
// export const FIREBASE_CLOUD_FUNCTIONS_URL =
//   "http://127.0.0.1:5001/timberstock-firebase/us-central1";

export async function requestReservarFolios(
  uid: string,
  n_folios: number,
): Promise<requestReservarFoliosResponse> {
  try {
    console.log("Solicitando folios...");
    console.log(`uid: ${uid}`);
    console.log(`n_folios: ${n_folios}`);
    const response = await axios.post(
      `${FIREBASE_CLOUD_FUNCTIONS_URL}/reservarFolios`,
      {
        data: {
          uid: uid,
          n_folios: n_folios,
        },
      },
    );
    console.log(`Folios recibidos: ${n_folios}`);
    return response.data;
  } catch (error) {
    console.error(`Error: ${error}`);
    alert("Error reservando folios");
    throw error;
  }
}
