import Timestamp from '@react-native-firebase/firestore';
import { Cliente, Faena, Producto } from '../esenciales';
import { ClaseDiametrica } from '../screens/emision/productos';

export interface ContratoVenta {
  firestore_id: string;
  cliente: ClienteContratoVenta;
  fecha_firma: typeof Timestamp | Date;
  fecha_caducidad: typeof Timestamp | Date;
  vigente: boolean;
  id_contrato_anterior?: string;
}

export interface ClienteContratoVenta extends Cliente {
  destinos_contrato: DestinoContratoVenta[];
}

export interface DestinoContratoVenta {
  nombre: string;
  faenas: FaenaContratoVenta[];
}

export interface FaenaContratoVenta extends Faena {
  productos_destino_contrato: ProductoContratoVenta[];
}

export interface ProductoContratoVenta extends Producto {
  precio_unitario_venta_mr?: number;
  clases_diametricas?: ClaseDiametrica[];
}