import { Timestamp } from '@react-native-firebase/firestore';

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
  ano_plantacion?: number;
  fecha_cosecha?: Timestamp;
}

export interface Producto {
  codigo: string;
  tipo: 'Aserrable' | 'Pulpable' | null;
  especie: string;
  calidad: string;
  largo: number;
  unidad: 'MR' | 'M3';
}

export interface Destino
  extends Omit<Faena, 'productos' | 'plan_de_manejo' | 'certificado'> {}

export interface Cliente {
  razon_social: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
  destinos: Destino[];
}

export interface Proveedor {
  razon_social: string;
  rut: string;
}
