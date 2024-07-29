import { IOption } from '@/interfaces/screens/screens';
import {
  CarguioContratoCompra,
  ClienteContratoCompra,
  CosechaContratoCompra,
  DestinoContratoCompra,
  TransporteContratoCompra,
} from '@/interfaces/contratos/contratoCompra';
import { Chofer, Cosecha } from '@/interfaces/servicios';
import { Identificacion } from '@/interfaces/sii/guia';
import { Faena, Proveedor } from '@/interfaces/esenciales';

export interface IOptionCarguio extends IOption {
  carguioObject: CarguioContratoCompra;
}

export interface IOptionCosecha extends IOption {
  cosechaObject: CosechaContratoCompra;
}

export interface IOptionTransporte extends IOption {
  transporteObject: TransporteContratoCompra;
}

export interface IOptionChofer extends IOption {
  choferObject: Chofer;
}

export interface IOptionDestinoContrato extends IOption {
  destinoContratoObject: DestinoContratoCompra;
}

export interface IOptionClienteContratoCompra extends IOption {
  clienteObject: ClienteContratoCompra;
}

export interface GuiaDespachoOptions {
  tipoDespacho: IOption[];
  tipoTraslado: IOption[];
  clientes: IOptionClienteContratoCompra[];
  destinos_contrato: IOptionDestinoContrato[];
  faenas: IOption[];
  planesDeManejo: IOption[];
  proveedores: IOption[];
  empresas_transporte: IOptionTransporte[];
  empresas_carguio: IOptionCarguio[];
  empresas_cosecha: IOptionCosecha[];
  choferes: IOptionChofer[];
  camiones: IOption[];
}

export interface GuiaDespacho {
  identificacion: Identificacion;
  proveedor: Proveedor;
  faena: Faena;
  cliente: ClienteContratoCompra;
  destino_contrato: DestinoContratoCompra;
  transporte: TransporteContratoCompra;
  chofer: Chofer;
  camion: string; // patente
  contrato_compra_id: string;
  folio_guia_proveedor?: number;
  servicios?: {
    cosecha?: CosechaContratoCompra;
    carguio?: CarguioContratoCompra;
  };
  // predio: Predio;
  // receptor: Receptor;
  // despacho: Transporte;
}
