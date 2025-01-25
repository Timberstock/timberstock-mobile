import { Proveedor, Producto, GeoPoint } from "@/interfaces/esenciales";

// 2nd Level
export interface Predio {
  rol: string;
  nombre: string;
  comuna: string;
  georreferencia: GeoPoint;
  plan_de_manejo: string;
  certificado: string;
}

// 3rd Level
interface Detalles {
  productos: Producto[];
  predio: Predio;
  proveedor: Proveedor;
}

// Only for PDF
export interface DetallePDF {
  nombre: string;
  cantidad?: number;
  precio?: number;
  montoItem?: number;
}
