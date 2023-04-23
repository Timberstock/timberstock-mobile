import { Proveedor, Predio, Producto } from './detalles';
import { Emisor, Identificacion, Receptor, Transporte } from './guias';

export interface ProductoAdded extends Producto {
  cantidad: number;
  volumen?: number;
  claseDiametrica?: string;
  total?: number;
}

export interface Cliente {
  razon_social: string;
  rut: string;
  direccion: string;
  comuna: string;
  destinos: string[];
}

export interface Empresa {
  razon_social: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
  activ_economica: number[];
}

export interface Contrato {
  disponible: boolean;
  fecha_firma: string;
  precio_compra: number;
  proveedor: Proveedor;
  predios: Predio[];
  productos: Producto[];
}

export interface ContratoVenta {
  fecha_firma: string;
  precio_venta: number;
  clientes: Cliente[];
}

export interface GuiaDespachoFirebase {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  transporte: Transporte;
  productos: ProductoAdded[];
  predio: Predio;
  total: number;
  estado: string;
}

export interface EmpresaData {
  foliosDisp: number[];
  clientes: Cliente[];
  predios: Predio[];
  productos: Producto[];
  proveedores: Proveedor[];
}
