import { Producto } from '../detalles';
import { FaenaFirestore } from '../firestore';

// Contrato
export interface Cliente {
  comuna: string;
  destinos: string[];
  direccion: string;
  razon_social: string;
  rut: string;
  giro?: string | '';
}

interface ProductoContrato extends Producto {}

export interface ContratoVenta {
  id: string;
  faenas: FaenaFirestore[];
  productos: ProductoContrato[];
  cliente: Cliente | null;
  fecha_firma: Date | null;
  // vigente: boolean; should be always true, filtered in the query to firestore
}
