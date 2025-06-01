import firestore from '@react-native-firebase/firestore';
import { AppState } from './types';

export const initialState: AppState = {
  guias: [],
  empresa: {
    id: '',
    razon_social: '',
    rut: '',
    giro: '',
    direccion: '',
    comuna: '',
    actividad_economica: [],
    fecha_resolucion_sii: firestore.Timestamp.now(),
    numero_resolucion_sii: '',
  },
  contratosCompra: [],
  contratosVenta: [],
  loading: true,
  error: null,
  lastSync: null,
  hasMoreGuias: true,
  isLoadingMore: false,
};
