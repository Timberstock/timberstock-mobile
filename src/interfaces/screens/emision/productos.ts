import { Producto } from '@/interfaces/esenciales';
import { IOption } from '@/interfaces/screens/screens';

export interface IOptionTipoProducto {
  value: 'Aserrable' | 'Pulpable' | '';
  label: 'Aserrable' | 'Pulpable' | '';
}

export interface IOptionProducto extends IOption {
  productoObject: Producto;
}

export interface ProductoOptions {
  tipo: IOptionTipoProducto[];
  productos: IOptionProducto[];
}

export interface ClaseDiametrica {
  clase: string;
  cantidad: number;
  volumen: number; // not calculated until creating the guia
}

export interface Banco {
  altura1: number;
  altura2: number;
  ancho: number;
}
