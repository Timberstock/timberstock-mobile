import axios from "axios";
import { requestReservarFoliosResponse } from "@/interfaces/firestore/cloud_functions";
import { FIREBASE_CLOUD_FUNCTIONS_URL } from "@/../App";

export async function requestReservarFolios(
  uid: string,
  n_folios: number,
): Promise<requestReservarFoliosResponse> {
  try {
    console.log("Solicitando folios...");
    console.log(`uid: ${uid}`);
    console.log(`n_folios: ${n_folios}`);
    const response = await axios.post(
      //dev
      // `http://127.0.0.1:5001/timberstock-firebase/us-central1/reservarFolios`,
      //prod
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
    throw error;
  }
}
