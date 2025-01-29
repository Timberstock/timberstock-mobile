import {
  CarguioContratoCompra,
  CosechaContratoCompra,
  OtroContratoCompra,
} from './contratoCompra';
import { Destino, Producto, Proveedor } from './esenciales';
import { Predio } from './sii/detalles';
import { Emisor, Identificacion, Receptor, Transporte } from './sii/guia';

interface DestinoGuia extends Omit<Destino, 'productos' | 'transportes'> {}

interface TransporteGuia extends Transporte {
  precio_unitario_transporte: number;
}

interface ServiciosGuia {
  cosecha: CosechaContratoCompra | null;
  carguio: CarguioContratoCompra | null;
  otros: OtroContratoCompra | null;
}

interface ClaseDiametricaGuia {
  clase: string;
  precio_unitario_compra_clase: number; // From Contrato Compra
  precio_unitario_venta_clase: number; // From Contrato Venta
  cantidad_emitida: number; // From producto-form
  volumen_emitido: number; // From producto-form
  // cantidad_recepcionada?: number; // Unknown in the App
  // volumen_recepcionado?: number; // Unknown in the App
}

interface ProductoGuia extends Producto {
  precio_unitario_compra_mr: number | null; // From Contrato Compra
  precio_unitario_venta_mr: number | null; // From Contrato Venta
  clases_diametricas: ClaseDiametricaGuia[] | null;
  bancos:
    | {
        altura1: number;
        altura2: number;
        ancho: number;
        volumen_banco: number;
      }[]
    | null;
}

export interface MetaDataUsuario {
  usuario_id: string;
  usuario_email: string;
  version_app: string;
  len_folios_reservados: number;
  len_cafs: number;
  pdf_local_uri: string;
}

export interface GuiaDespachoFirestore {
  id: string;
  emisor: Emisor;
  identificacion: Identificacion;
  proveedor: Proveedor;
  folio_guia_proveedor: number | null;
  receptor: Receptor;
  predio_origen: Predio;
  destino: DestinoGuia;
  transporte: TransporteGuia;
  producto: ProductoGuia;
  codigo_fsc: string | null;
  codigo_contrato_externo: string | null;
  servicios: ServiciosGuia;
  observaciones: string[] | null;
  contrato_compra_id: string;
  contrato_venta_id: string;
  volumen_total_emitido: number;
  precio_unitario_guia: number;
  monto_total_guia: number;
  estado: string;
  _caf_id: string;
  usuario_metadata: MetaDataUsuario;
  pdf_url: string;
}
