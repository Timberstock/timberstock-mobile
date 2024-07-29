import { Emisor } from '@/interfaces/sii/guia';
import { Cliente, Faena, Producto, Proveedor } from '@/interfaces/esenciales';

export interface Empresa {
  razon_social: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
  actividad_economica: number[];
  caf_n: number;
}

export interface EmpresaSubCollectionsData {
  clientes: Cliente[];
  faenas: Faena[];
  productos: Producto[];
  proveedores: Proveedor[];
}
