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
  fecha?: Date; // Optional because it's set in the function at the moment of creation
  folio: number;
  tipo_traslado: string;
  tipo_despacho: string;
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
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
}

export interface Transporte {
  chofer: Chofer;
  patente: string;
  rut_transportista: string;
  direccion_destino: string;
  comuna_destino?: string;
  ciudad_destino?: string;
}

export interface Totales {
  monto_total: number;
  monto_neto: number;
}

export interface GuiaDespachoProps {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  transporte: Transporte;
  detalles: DetalleDTE[];
  totales: Totales;
}

export interface GuiaDespachoSummaryProps {
  folio: number;
  estado: string;
  total: number;
  receptor: Receptor;
  fecha: Date;
  url: string;
}
