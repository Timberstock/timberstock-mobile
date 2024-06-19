import { Chofer } from '../interfaces/guias';
import { IOption } from '../interfaces/screens';
import {
  IOptionChoferes,
  IOptionTransportes,
} from '../interfaces/screens/createGuia';
import { tipoDespachoOptions, tipoTrasladoOptions } from './options';

export const createGuiaInitialStates = {
  contratosFiltered: {
    compra: [],
    venta: [],
  },
  options: {
    tipoDespacho: tipoDespachoOptions,
    tipoTraslado: tipoTrasladoOptions,
    folios: [] as IOption[],
    clientes: [] as IOption[],
    destinos: [] as IOption[],
    empresasTransporte: [] as IOptionTransportes[],
    choferes: [] as IOptionChoferes[],
    camiones: [] as IOption[],
    predios: [] as IOption[],
    planesDeManejo: [] as IOption[],
    proveedores: [] as IOption[],
  },
  guia: {
    identificacion: {
      folio: -1,
      tipo_despacho: '',
      tipo_traslado: '',
    },
    receptor: {
      razon_social: '',
      rut: '',
      giro: '',
      direccion: '',
      comuna: '',
    },
    despacho: {
      chofer: {
        nombre: '',
        rut: '',
      } as Chofer,
      patente: '',
      rut_transportista: '',
      direccion_destino: '',
    },
    predio: {
      certificado: '',
      comuna: '',
      georreferencia: {
        latitude: 0,
        longitude: 0,
      },
      nombre: '',
      plan_de_manejo: '',
      rol: '',
      productos: [],
    },
    proveedor: {
      razon_social: '',
      rut: '',
    },
  },
};
