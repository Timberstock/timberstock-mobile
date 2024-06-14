import { Producto, Proveedor } from '../detalles';
import { FaenaFirestore } from '../firestore';

// Transporte

export interface Camion {
  marca: string;
  patente: string;
  patente_carro?: string;
}

export interface Chofer {
  nombre: string;
  rut: string;
}

export interface TransporteDestinoContratoCompra {
  razon_social: string;
  rut: string;
  camiones: Camion[];
  choferes: Chofer[];
  precio_unidad?: number;
}

// Contrato
export interface Cliente {
  comuna: string;
  destinos: string[];
  direccion: string;
  razon_social: string;
  rut: string;
}

export interface DestinoContratoCompra {
  nombre: string;
  transportes?: TransporteDestinoContratoCompra[] | [];
}

export interface ClienteContratoCompra extends Cliente {
  // We have to add price according to the Transport and the distance to the destino
  destinos_contrato: DestinoContratoCompra[];
}

interface ProductoContrato extends Producto {}

export interface ContratoCompra {
  id: string;
  clientes: ClienteContratoCompra[]; // All of the "potential" clientes
  proveedor: Proveedor;
  faena: FaenaFirestore;
  productos: ProductoContrato[];
  giro: string;
  fecha_firma: Date;
  // vigente: boolean; should be always true, filtered in the query to firestore

  // Not relevant for Guia but left for reference
  // servicios: Servicios;
}
