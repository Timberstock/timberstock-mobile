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

export interface LocalFile {
  name: string;
  path: string;
  type: 'image' | 'pdf' | 'other';
}

export interface GuiaDespachoState extends GuiaDespachoFirestore {
  pdf_local_checked_uri: string;
}

// State type
export interface AppState {
  guias: GuiaDespachoState[];
  empresa: Empresa;
  contratosCompra: ContratoCompra[];
  contratosVenta: ContratoVenta[];
  localFiles: LocalFile[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  hasMoreGuias: boolean;
  isLoadingMore: boolean;
}

// Action types
export type AppAction =
  | { type: 'SET_GUIAS'; payload: GuiaDespachoState[] }
  | {
      type: 'SET_EMPRESA_DATA';
      payload: {
        empresa: Empresa;
        contratosCompra: ContratoCompra[];
        contratosVenta: ContratoVenta[];
      };
    }
  | { type: 'SET_LOCAL_FILES'; payload: LocalFile[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'APPEND_GUIAS'; payload: GuiaDespachoState[] }
  | { type: 'SET_LAST_SYNC'; payload: Date };

// Context type
export interface AppContextType {
  state: AppState;
  fetchAllEmpresaData: () => Promise<void>;
  handleUpdateAvailable: () => Promise<void>;
  shareGuiaPDF: (guia: GuiaDespachoState) => Promise<void>;
  loadMoreGuias: () => Promise<void>;
}
