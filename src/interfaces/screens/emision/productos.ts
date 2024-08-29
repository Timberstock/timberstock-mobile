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
  cantidad_emitida?: number;
  volumen_emitido?: number;
  cantidad_recepcionada?: number;
  volumen_recepcionado?: number;
  precio_unitario_compra_clase?: number;
  precio_unitario_venta_clase?: number;
}

export interface Banco {
  altura1: number;
  altura2: number;
  ancho: number;
}
