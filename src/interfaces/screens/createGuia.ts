import {
  tipoDespachoOptions,
  tipoTrasladoOptions,
} from '../../resources/options';
import { IOption } from '../screens';
import {
  Chofer,
  ContratoCompra,
  TransporteDestinoContratoCompra,
} from '../contratos/contratoCompra';
import { Identificacion, Receptor, Transporte } from '../guias';
import { Predio, Proveedor } from '../detalles';
import { ContratoVenta } from '../contratos/contratoVenta';

export interface IOptionTransportes extends IOption {
  transporteObject: TransporteDestinoContratoCompra;
}

export interface IOptionChoferes extends IOption {
  choferObject: Chofer;
}

export interface CreateGuiaOptions {
  tipoDespacho: typeof tipoDespachoOptions;
  tipoTraslado: typeof tipoTrasladoOptions;
  folios: IOption[];
  clientes: IOption[];
  destinos: IOption[];
  predios: IOption[];
  planesDeManejo: IOption[];
  proveedores: IOption[];
  empresasTransporte: IOptionTransportes[];
  choferes: IOptionChoferes[];
  camiones: IOption[];
}

export interface GuiaInCreateGuiaScreen {
  identificacion: Identificacion;
  receptor: Receptor;
  despacho: Transporte;
  predio: Predio;
  proveedor: Proveedor;
}

export interface ContratosFiltered {
  compra: ContratoCompra[];
  venta: ContratoVenta[];
}
