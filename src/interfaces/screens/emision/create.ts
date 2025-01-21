import {
  CarguioContratoCompra,
  ClienteContratoCompra,
  CosechaContratoCompra,
  DestinoContratoCompra,
  TransporteContratoCompra,
} from '@/interfaces/contratos/contratoCompra';
import { IOption } from '@/interfaces/screens/screens';
import { Camion, Chofer } from '@/interfaces/servicios';

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
export interface IOptionCamion extends IOption {
  camionObject: Camion;
}

export interface IOptionDestinoContrato extends IOption {
  destinoContratoObject: DestinoContratoCompra;
}

export interface IOptionClienteContratoCompra extends IOption {
  clienteObject: ClienteContratoCompra;
}

export interface GuiaDespachoOptions {
  tipo_despacho: IOption[];
  tipo_traslado: IOption[];
  clientes: IOptionClienteContratoCompra[];
  destinos_contrato: IOptionDestinoContrato[];
  faenas: IOption[];
  planes_de_manejo: IOption[];
  proveedores: IOption[];
  empresas_transporte: IOptionTransporte[];
  empresas_carguio: IOptionCarguio[];
  empresas_cosecha: IOptionCosecha[];
  choferes: IOptionChofer[];
  camiones: IOptionCamion[];
  carros: IOption[];
}
