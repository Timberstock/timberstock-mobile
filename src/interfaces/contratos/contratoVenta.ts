import { Cliente, Destino, Faena, Producto } from "../esenciales";
import { ClaseDiametrica } from "../screens/emision/productos";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface ContratoVenta {
  firestoreID: string;
  cliente: ClienteContratoVenta;
  fecha_firma: FirebaseFirestoreTypes.Timestamp | Date;
  fecha_caducidad: FirebaseFirestoreTypes.Timestamp | Date;
  vigente: boolean;
  id_contrato_anterior?: string;
}

export interface ClienteContratoVenta extends Cliente {
  destinos_contrato: DestinoContratoVenta[];
}

export interface DestinoContratoVenta extends Destino {
  faenas: FaenaContratoVenta[];
}

export interface FaenaContratoVenta extends Faena {
  productos_destino_contrato: ProductoContratoVenta[];
  codigo_fsc?: string;
  codigo_contrato_externo?: string;
}

export interface ClaseDiametricaContratoVenta extends ClaseDiametrica {
  precio_unitario_venta_clase: number;
}

export interface ProductoContratoVenta extends Producto {
  precio_unitario_venta_mr?: number;
  clases_diametricas?: ClaseDiametricaContratoVenta[];
}
