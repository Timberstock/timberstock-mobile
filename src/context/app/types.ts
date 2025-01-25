import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { ContratoCompra } from './types/contratoCompra';
import { ContratoVenta } from './types/contratoVenta';
import { Cliente, Faena, Producto, Proveedor } from './types/esenciales';
import { GuiaDespachoFirestore } from './types/guia';
import { Receptor } from './types/sii/guia';

export interface GuiaDespachoSummary extends Partial<GuiaDespachoFirestore> {
  id: string;
  folio: number;
  estado: string;
  monto_total_guia: number;
  receptor: Receptor;
  volumen_total_emitido: number;
  fecha: string;
  pdf_url: string;
  pdf_local_uri?: string;
}

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

// State type
export interface AppState {
  guiasSummary: GuiaDespachoSummary[];
  empresa: Empresa;
  contratosCompra: ContratoCompra[];
  contratosVenta: ContratoVenta[];
  localFiles: LocalFile[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Action types
export type AppAction =
  | { type: 'SET_GUIAS_SUMMARY'; payload: GuiaDespachoSummary[] }
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
  | { type: 'SET_ERROR'; payload: string };

// Context type
export interface AppContextType {
  state: AppState;
  fetchAllEmpresaData: () => Promise<void>;
  handleUpdateAvailable: () => Promise<void>;
  shareGuiaPDF: (guia: GuiaDespachoSummary) => Promise<void>;
}
