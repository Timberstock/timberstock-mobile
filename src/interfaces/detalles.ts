// Deepest Interfaces
export interface Georreferencia {
  latitude: number;
  longitude: number;
}
// 2nd Level
export interface Predio {
  rol: string;
  nombre: string;
  comuna: string;
  georreferencia: Georreferencia;
  certificado: string;
  plan_de_manejo: string;
}

export interface Producto {
  calidad: string;
  cantidad: number;
  especie: string;
  largo: number;
  precio_ref: number;
  tipo: string;
  unidad: string;
}

export interface Proveedor {
  razon_social: string;
  rut: string;
}

// 3rd Level
interface Detalles {
  productos: Producto[];
  predio: Predio;
  proveedor: Proveedor;
}

// Only for PDF
export interface DetallesPDF {
  nombre: string;
  cantidad: number;
  precio?: number;
  montoItem?: number;
}
