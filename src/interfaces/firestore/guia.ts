import { Predio } from '@/interfaces/sii/detalles';
import { Proveedor, Producto } from '@/interfaces/esenciales';
import {
  Emisor,
  Identificacion,
  Receptor,
  Transporte,
} from '@/interfaces/sii/guia';
import { ClaseDiametrica } from '../screens/emision/productos';
import { Servicios } from '../contratos/contratoCompra';

// Desglose de precios tiene que ser mas sofisticado, especialmente para cubrir servicios, transporte, etc.
export interface TransporteGuia extends Omit<Transporte, 'empresa'> {
  // Fix interfaces matching in both
  empresa: {
    rut: string;
    razon_social: string;
    precio_unitario_transporte: number;
  };
}

// export interface TransporteGuia {
//   empresa: TransporteContratoCompra;
//   direccion_destino: string;
//   chofer: Chofer;
//   camion: string;
//   proforma_compra_id?: string;
// }

export interface ProductoGuia extends Producto {
  precio_unitario_compra_mr?: number;
  precio_unitario_venta_mr?: number;
  clases_diametricas?: ClaseDiametrica[];
}

export interface GuiaDespachoFirestore {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  predio: Predio;
  transporte: TransporteGuia;
  proveedor: Proveedor;
  producto: ProductoGuia;
  volumen_total_emitido: number;
  precio_unitario_guia: number;
  monto_total_guia: number;
  contrato_venta_id: string;
  contrato_compra_id: string;
  estado: string;
  folio_guia_proveedor?: number;
  servicios?: Servicios;
  // We are not including valores de contrato here because they are not necessary for the guia
  // precio_unitario_venta: number;
  // monto_total_venta: number;
  // valores_contrato_compra: {
  //   precio_unitario_compra?: number;
  //   monto_total_compra?: number;
  //   precio_unitario_cosecha?: number;
  //   monto_total_cosecha?: number;
  //   precio_unitario_transporte?: number;
  //   monto_total_transporte?: number;
  //   precio_unitario_carguio?: number;
  //   monto_total_carguio?: number;
  // };
}
