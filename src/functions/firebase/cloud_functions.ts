import axios from 'axios';
import { requestReservarFoliosResponse } from '../../interfaces/cloud_functions';

export async function requestReservarFolios(
  uid: string,
  n_folios: number
): Promise<requestReservarFoliosResponse> {
  try {
    const response = await axios.post(
      `http://127.0.0.1:5001/timberstock-firebase/us-central1/reservarFolios`,
      {
        data: {
          uid: uid,
          n_folios: n_folios,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
}
