import { TransporteContratoCompra } from '../contratos/contratoCompra';

// 2nd Level Interfaces
export interface Chofer {
  nombre: string;
  rut: string;
}

export interface DetalleDTE {
  indicador_exento: number;
  nombre: string;
  cantidad: number;
  precio: number;
  descuento: number;
  recargo: number;
  monto_item: number;
}

export interface ReferenciaDTE {
  folio_referencia: string;
  fecha_documento_referencia: Date;
  razon_referencia: string;
  tipo_documento: string;
}

// 3rd Level Interfaces
export interface Identificacion {
  folio: number;
  tipo_traslado: string;
  tipo_despacho: string;
  fecha?: Date; // Optional because its set in the function at the moment of creation
}

export interface Emisor {
  actividad_economica: number[];
  comuna: string;
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
}

export interface Receptor {
  razon_social: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
}

export interface Transporte {
  chofer: Chofer;
  camion: string;
  empresa: {
    rut: string;
    razon_social: string;
  };
  direccion_destino: string;
  comuna_destino?: string;
  ciudad_destino?: string;
}

export interface Totales {
  monto_total: number;
  monto_neto: number;
}

// For reference
interface GuiaDespachoSII {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  transporte: Transporte;
  totales: Totales;
  detalles: DetalleDTE[];
  referencias: ReferenciaDTE[];
}
