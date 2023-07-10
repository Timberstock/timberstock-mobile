import { Proveedor, Predio, Producto } from './detalles';
import { Emisor, Identificacion, Receptor, Transporte } from './guias';

export interface Trozo extends Producto {
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

export interface EmpresaSubCollectionsData {
  clientes: Cliente[];
  predios: Predio[];
  productos: Producto[];
  proveedores: Proveedor[];
}

export interface PreGuia {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  transporte: Transporte;
  productos: Trozo[];
  predio: Predio;
  precio_ref: number;
  total: number;
}

export interface GuiaDespachoFirebase extends PreGuia {
  estado: string;
}
