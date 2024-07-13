import { Predio } from '@/interfaces/sii/detalles';
import { Proveedor, Producto } from '@/interfaces/esenciales';
import {
  Emisor,
  Identificacion,
  Receptor,
  Transporte,
} from '@/interfaces/sii/guia';
import { ClaseDiametrica } from '../screens/emision/productos';

// Desglose de precios tiene que ser mas sofisticado, especialmente para cubrir servicios, transporte, etc.
export interface GuiaDespachoFirestore {
  identificacion: Identificacion;
  emisor: Emisor;
  receptor: Receptor;
  predio: Predio;
  transporte: Transporte;
  proveedor: Proveedor;
  producto: Producto;
  clases_diametricas?: ClaseDiametrica[];
  volumen_total: number;
  precio_unitario_guia: number;
  monto_total_guia: number;
  contrato_venta_id: string;
  contrato_compra_id: string;
  estado: string;
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
