import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Cliente, Destino, Faena, Producto, Proveedor } from './esenciales';
import { Carguio, Cosecha, Otro, Transporte } from './servicios';

export interface ContratoCompra {
  clientes: ClienteContratoCompra[]; // All of the "potential" clientes
  proveedor: Proveedor;
  faena: Faena;
  fecha_firma: FirebaseFirestoreTypes.Timestamp | Date;
  fecha_caducidad: FirebaseFirestoreTypes.Timestamp | Date;
  servicios: Servicios;
  vigente: boolean;
  firestoreID: string;
  id_contrato_anterior?: string;
}

export interface CosechaContratoCompra {
  empresa: Cosecha;
  precio_m3?: number;
  precio_mr?: number;
}

export interface CarguioContratoCompra {
  empresa: Carguio;
  precio_m3?: number;
  precio_mr?: number;
}

export interface OtroContratoCompra extends Otro {
  precio: number;
}

export interface ProductoContratoCompra extends Producto {
  precio_unitario_compra_mr: number | null;
  clases_diametricas: ClaseDiametricaContratoCompra[] | null;
}

export interface ClaseDiametricaContratoCompra {
  clase: string;
  precio_unitario_compra_clase: number;
}

interface ClienteContratoCompra extends Cliente {
  destinos_contrato: DestinoContratoCompra[];
}

interface DestinoContratoCompra extends Destino {
  transportes: TransporteContratoCompra[];
  productos: ProductoContratoCompra[];
}

interface TransporteContratoCompra extends Transporte {
  // Might have problems with this Transporte and the one in web app
  precio_unitario_transporte?: number; // Optional in case of Retail, where Transporte is not paid as a Servicio
}

interface Servicios {
  cosecha?: CosechaContratoCompra[];
  carguio?: CarguioContratoCompra[];
  otros?: OtroContratoCompra[];
}
