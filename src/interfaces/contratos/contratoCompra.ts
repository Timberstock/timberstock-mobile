import {
  Cliente,
  Proveedor,
  Producto,
  Faena,
  Destino,
} from "@/interfaces/esenciales";
import { Carguio, Cosecha, Otro, Transporte } from "@/interfaces/servicios";
import { ClaseDiametrica } from "../screens/emision/productos";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

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
export interface ClienteContratoCompra extends Cliente {
  destinos_contrato: DestinoContratoCompra[];
}

export interface DestinoContratoCompra extends Destino {
  transportes: TransporteContratoCompra[];
  productos: ProductoContratoCompra[];
}

export interface TransporteContratoCompra extends Transporte {
  // Might have problems with this Transporte and the one in web app
  precio_unitario_transporte?: number; // Optional in case of Retail, where Transporte is not paid as a Servicio
}

export interface ClaseDiametricaContratoCompra extends ClaseDiametrica {
  precio_unitario_compra_clase: number;
}

export interface ProductoContratoCompra extends Producto {
  precio_unitario_compra_mr?: number;
  clases_diametricas?: ClaseDiametricaContratoCompra[];
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

export interface Servicios {
  cosecha?: CosechaContratoCompra[];
  carguio?: CarguioContratoCompra[];
  otros?: OtroContratoCompra[];
}
