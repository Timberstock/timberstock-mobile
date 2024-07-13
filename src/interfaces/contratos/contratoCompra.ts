import Timestamp from '@react-native-firebase/firestore';
import { Cliente, Proveedor, Producto, Faena } from '../esenciales';
import { Carguio, Cosecha, Otro, Transporte } from '../servicios';

export interface ContratoCompra {
  firestore_id: string;
  clientes: ClienteContratoCompra[]; // All of the "potential" clientes
  proveedor: Proveedor;
  faena: Faena;
  fecha_firma: typeof Timestamp | Date;
  fecha_caducidad: typeof Timestamp | Date;
  servicios: Servicios;
  vigente: boolean;
  id_contrato_anterior?: string;
}
export interface ClienteContratoCompra extends Cliente {
  destinos_contrato: DestinoContratoCompra[];
}

export interface DestinoContratoCompra {
  nombre: string;
  transportes: TransporteContratoCompra[];
  productos: ProductoContratoCompra[];
}

export interface ProductoContratoCompra extends Producto {
  precio_unitario_compra: number;
  precio_unitario_compra_ref?: number; // Ref price in case of same price for all destinos
}

export interface TransporteContratoCompra extends Transporte {
  precio_unitario_transporte?: number; // Optional in case of Retail, where Transporte is not paid as a Servicio
}

export interface CosechaContratoCompra {
  empresa: Cosecha | null;
  precio_m3?: number;
  precio_mr?: number;
}

export interface CarguioContratoCompra {
  empresa: Carguio | null;
  precio_m3?: number;
  precio_mr?: number;
}

export interface OtroContratoCompra extends Otro {
  precio: number;
}

export interface Servicios {
  cosecha: CosechaContratoCompra[];
  carguio: CarguioContratoCompra[];
  otros: OtroContratoCompra[];
}
