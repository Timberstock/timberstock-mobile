export interface Camion {
  marca: string;
  patente: string;
}

export interface Chofer {
  nombre: string;
  rut: string;
}

export interface Transporte {
  razon_social: string;
  rut: string;
  camiones: Camion[];
  choferes: Chofer[];
  carros: string[] | { patente: string }[];
}

export interface Cosecha {
  razon_social: string;
  rut: string;
}

export interface Carguio {
  razon_social: string;
  rut: string;
}

export interface Gestor {
  nombre: string;
  rut: string;
}

export interface Otro {
  nombre: string;
}
