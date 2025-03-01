import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { ContratoCompra } from './types/contratoCompra';
import { ContratoVenta } from './types/contratoVenta';
import { Cliente, Faena, Producto, Proveedor } from './types/esenciales';
import { GuiaDespachoFirestore } from './types/guia';

export interface Empresa {
  id: string;
  razon_social: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
  actividad_economica: number[];
  fecha_resolucion_sii: FirebaseFirestoreTypes.Timestamp;
  numero_resolucion_sii: string;
}

export interface EmpresaSubCollectionsData {
  clientes: Cliente[];
  faenas: Faena[];
  productos: Producto[];
  proveedores: Proveedor[];
}

// State type
export interface AppState {
  guias: GuiaDespachoFirestore[];
  empresa: Empresa;
  contratosCompra: ContratoCompra[];
  contratosVenta: ContratoVenta[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  hasMoreGuias: boolean;
  isLoadingMore: boolean;
}

// Action types
export type AppAction =
  | { type: 'SET_GUIAS'; payload: GuiaDespachoFirestore[] }
  | {
      type: 'SET_EMPRESA_DATA';
      payload: {
        empresa: Empresa;
        contratosCompra: ContratoCompra[];
        contratosVenta: ContratoVenta[];
      };
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'APPEND_GUIAS'; payload: GuiaDespachoFirestore[] }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'RESET_STATE' };

// Context type
export interface AppContextType {
  state: AppState;
  fetchAllEmpresaData: (withLoading?: boolean) => Promise<void>;
  loadMoreGuias: () => Promise<void>;
  resetFirestoreAndReloadApp: () => Promise<void>;
}
