import axios from 'axios';
import { requestReservarFoliosResponse } from '../../interfaces/cloud_functions';

export async function requestReservarFolios(
  uid: string,
  n_folios: number
): Promise<requestReservarFoliosResponse> {
  try {
    console.log('Solicitando folios...');
    const response = await axios.post(
      //dev
      // `http://127.0.0.1:5001/timberstock-firebase/us-central1/reservarFolios`,
      //prod
      `https://us-central1-timberstock-firebase.cloudfunctions.net/reservarFolios`,
      {
        data: {
          uid: uid,
          n_folios: n_folios,
        },
      }
    );
    console.log(`Folios recibidos: ${n_folios}`);
    return response.data;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
}
