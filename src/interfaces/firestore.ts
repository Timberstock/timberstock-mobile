import { Proveedor, Predio, Producto, Georreferencia } from './detalles';
import { Emisor, Identificacion, Receptor, Transporte } from './guias';
import GeoPoint from '@react-native-firebase/firestore';

export interface ProductoDetalle extends Producto {
  cantidad: number;
  volumen?: number;
  claseDiametrica?: string;
  total?: number;
}

export interface FaenaFirestore {
  rol: string;
  nombre: string;
  comuna: string;
  georreferencia: Georreferencia;
  certificado: string;
  plan_de_manejo: string;
  productos: string[];
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
  productos: ProductoDetalle[];
  predio: Predio;
  volumen_total: number;
  precio_ref: number;
  total_ref: number;
  precio: number;
  total: number;
}

export interface GuiaDespachoFirebase extends PreGuia {
  estado: string;
}
