import {
  tipoDespachoOptions,
  tipoTrasladoOptions,
} from '../../resources/options';
import { IOption } from '../screens';
import {
  ContratoCompra,
  TransporteDestinoContratoCompra,
} from '../contratos/contratoCompra';
import { Identificacion, Receptor, Transporte } from '../guias';
import { Predio, Proveedor } from '../detalles';
import { ContratoVenta } from '../contratos/contratoVenta';

export interface IOptionTransportes extends IOption {
  transporteObject: TransporteDestinoContratoCompra;
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
  choferes: IOption[];
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
