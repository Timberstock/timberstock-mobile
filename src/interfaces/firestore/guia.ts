import { Destino, Producto, Proveedor } from '@/interfaces/esenciales';
import { Predio } from '@/interfaces/sii/detalles';
import { Emisor, Identificacion, Receptor, Transporte } from '@/interfaces/sii/guia';
import {
  CarguioContratoCompra,
  CosechaContratoCompra,
  OtroContratoCompra,
} from '../contratos/contratoCompra';
import { ClaseDiametricaContratos } from '../screens/emision/productos';
export interface DestinoGuia extends Omit<Destino, 'productos' | 'transportes'> {}

export interface TransporteGuia extends Transporte {
  precio_unitario_transporte: number;
}

export interface ServiciosGuia {
  cosecha?: CosechaContratoCompra;
  carguio?: CarguioContratoCompra;
  otros?: OtroContratoCompra;
}

export interface ClaseDiametricaGuia extends ClaseDiametricaContratos {
  cantidad_emitida: number;
  volumen_emitido: number;
  // cantidad_recepcionada?: number; // Unknown in the App
  // volumen_recepcionado?: number; // Unknown in the App
}

export interface ProductoGuia extends Producto {
  precio_unitario_compra_mr?: number;
  precio_unitario_venta_mr?: number;
  clases_diametricas?: ClaseDiametricaGuia[];
}

interface MetaDataUsuario {
  usuario_id: string;
  usuario_email: string;
  version_app: string;
  len_folios_reservados: number;
  len_cafs: number;
}

export interface GuiaDespachoFirestore {
  emisor: Emisor;
  identificacion: Identificacion;
  proveedor: Proveedor;
  folio_guia_proveedor?: number;
  receptor: Receptor;
  predio_origen: Predio;
  destino: DestinoGuia;
  transporte: TransporteGuia;
  producto: ProductoGuia;
  codigo_fsc?: string;
  codigo_contrato_externo?: string;
  servicios?: ServiciosGuia;
  observaciones?: string[];
  contrato_compra_id: string;
  contrato_venta_id: string;
  volumen_total_emitido: number;
  precio_unitario_guia: number;
  monto_total_guia: number;
  estado: string;
  _caf_id?: string;
  usuario_metadata: MetaDataUsuario;
}
