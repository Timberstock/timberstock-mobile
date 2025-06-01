import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Cliente, Destino, Faena, Producto } from './esenciales';

export interface ContratoVenta {
  firestoreID: string;
  cliente: ClienteContratoVenta;
  fecha_firma: FirebaseFirestoreTypes.Timestamp | Date;
  fecha_caducidad: FirebaseFirestoreTypes.Timestamp | Date;
  vigente: boolean;
  id_contrato_anterior?: string;
  guias_incluye_codigo_producto: boolean;
  guias_incluye_fecha_faena: boolean;
}

export interface ProductoContratoVenta extends Producto {
  precio_unitario_venta_mr: number | null;
  clases_diametricas: ClaseDiametricaContratoVenta[] | null;
}

export interface ClaseDiametricaContratoVenta {
  clase: string;
  precio_unitario_venta_clase: number;
}

interface ClienteContratoVenta extends Cliente {
  destinos_contrato: DestinoContratoVenta[];
}

interface DestinoContratoVenta extends Destino {
  faenas: FaenaContratoVenta[];
}

interface FaenaContratoVenta extends Faena {
  productos_destino_contrato: ProductoContratoVenta[];
  codigo_fsc?: string;
  codigo_contrato_externo?: string;
}
