import Timestamp from '@react-native-firebase/firestore';
import { Cliente, Producto } from '../esenciales';

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
  productos: ProductoContratoVenta[];
}

export interface ProductoContratoVenta extends Producto {
  precio_unitario_venta: number;
  precio_unitario_venta_ref?: number;
}
