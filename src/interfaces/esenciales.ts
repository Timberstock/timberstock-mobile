export interface GeoPoint {
  // We fake it because I could not import GeoPoint from firestore
  latitude: number;
  longitude: number;
}

export interface Faena {
  rol: string;
  nombre: string;
  comuna: string;
  georreferencia: GeoPoint;
  certificado: string;
  plan_de_manejo: string;
  // planes_de_manejo: string[];
  productos: Producto[];
}

export interface Producto {
  codigo: string;
  tipo: 'Aserrable' | 'Pulpable' | '';
  especie: string;
  calidad: string;
  largo: number;
  unidad: 'MR' | 'M3' | '';
}

export interface Cliente {
  razon_social: string;
  rut: string;
  comuna: string;
  direccion: string;
  destinos: string[];
  giro: string;
}

export interface Proveedor {
  razon_social: string;
  rut: string;
}
