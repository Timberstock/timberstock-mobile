import { GuiaDespachoFirestore } from '@/context/app/types/guia';

// Form data structure
export interface ProductoFormData {
  tipo: string | null;
  label: string | null;
  info: Omit<
    GuiaDespachoFirestore['producto'],
    | 'tipo'
    | 'clases_diametricas'
    | 'bancos'
    | 'precio_unitario_compra_mr'
    | 'precio_unitario_venta_mr'
  > | null; // In this field, omit tipo, bancos and clases_diametricas
  clases_diametricas_guia:
    | GuiaDespachoFirestore['producto']['clases_diametricas']
    | null;
  bancos: GuiaDespachoFirestore['producto']['bancos'] | null;
  precio_unitario_venta_mr: number | null;
  precio_unitario_compra_mr: number | null;
  volumen_total_emitido: number;
}

// Available options for selectors
export interface ProductoFormOptions {
  tipos: {
    label: string;
    object: string;
  }[];
  productos: ProductoFormData[];
}

// Main state interface
export interface ProductoFormState {
  productoForm: ProductoFormData;
  options: ProductoFormOptions;
}

// Action types
export type ProductoFormAction =
  | {
      type: 'UPDATE_TIPO';
      payload: {
        newTipo: string | null;
        newOptions: Partial<ProductoFormOptions>;
      };
    }
  | {
      type: 'UPDATE_PRODUCTO_INFO';
      payload: ProductoFormData | null;
    }
  | {
      type: 'UPDATE_CLASES_DIAMETRICAS'; // Triggers change in volumen_total_emitido
      payload: {
        item: {
          clase?: string;
          cantidad?: number;
          volumen_emitido?: number;
        };
        index?: number;
      };
    }
  | {
      type: 'UPDATE_BANCOS'; // Triggers change in volumen_total_emitido
      payload: {
        item: NonNullable<ProductoFormData['bancos']>[number];
        index: number;
      };
    }
  | {
      type: 'RESET_VIEW';
      payload: {
        newData: ProductoFormData;
        newOptions: ProductoFormOptions;
      };
    };

// Context type
export interface ProductoFormContextType {
  state: ProductoFormState;
  updateTipo: (tipo: string | null) => void;
  updateProductoInfo: (producto: ProductoFormData | null) => void;
  updateClasesDiametricas: (clase?: string, cantidad?: number) => void;
  updateBancos: (
    index: number,
    dimension: keyof NonNullable<ProductoFormData['bancos']>[number],
    value: number
  ) => void;
  isFormValid: () => boolean;
  resetForm: () => void;
}
