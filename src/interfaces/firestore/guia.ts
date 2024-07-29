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
export interface TransporteGuia extends Transporte {
  precio_unitario_transporte?: number;
}

interface ProductoGuia extends Producto {
  precio_unitario_compra?: number;
  precio_unitario_venta?: number;
}

export interface GuiaDespachoFirestore {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  predio: Predio;
  transporte: TransporteGuia;
  proveedor: Proveedor;
  producto: ProductoGuia;
  volumen_total: number;
  precio_unitario_guia: number;
  monto_total_guia: number;
  contrato_venta_id: string;
  contrato_compra_id: string;
  estado: string;
  folio_guia_proveedor?: number;
  clases_diametricas?: ClaseDiametrica[];
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
