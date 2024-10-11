import Timestamp from "@react-native-firebase/firestore";
import { Cliente, Destino, Faena, Producto } from "../esenciales";
import { ClaseDiametrica } from "../screens/emision/productos";

export interface ContratoVenta {
  firestoreID: string;
  cliente: ClienteContratoVenta;
  fecha_firma: typeof Timestamp | Date;
  fecha_caducidad: typeof Timestamp | Date;
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
