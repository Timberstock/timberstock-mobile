import { Camion } from "../servicios";

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
  rut: string;
  razon_social: string;
  direccion: string;
  comuna: string;
  giro: string;
  actividad_economica: number[];
}

export interface Receptor {
  rut: string;
  razon_social: string;
  comuna: string;
  direccion: string;
  giro: string;
}

export interface Transporte {
  empresa: {
    rut: string;
    razon_social: string;
  };
  chofer: Chofer;
  camion: Camion;
  carro: string;
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
