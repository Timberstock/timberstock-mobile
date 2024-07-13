import { IOption } from '@/interfaces/screens/screens';
import {
  IOptionChofer,
  IOptionClienteContratoCompra,
  IOptionDestinoContrato,
  IOptionTransporte,
} from '@/interfaces/screens/emision/create';
import { IOptionProducto } from '@/interfaces/screens/emision/productos';

const tipoTrasladoOptions = [
  { value: 'Constituye venta', label: 'Venta' },
  { value: 'Venta por efectuar', label: 'Venta x Efectuar' },
  { value: 'Consignación', label: 'Consignación' },
  { value: 'Entrega gratuita', label: 'Gratuito' },
  { value: 'Traslados internos', label: 'Interno' },
  { value: 'Otros traslados no venta', label: 'Otros' },
];

const tipoDespachoOptions = [
  { value: 'Por cuenta del receptor', label: 'Cuenta Receptor' },
  {
    value: 'Por cuenta del emisor a instalaciones cliente',
    label: 'Cuenta Emisor a Instalaciones Cliente',
  },
  {
    value: 'Por cuenta del emisor a otras instalaciones',
    label: 'Cuenta Emisor Otras Instalaciones',
  },
];

const tipoProductoOptions = [
  { value: 'Aserrable', label: 'Aserrable' },
  { value: 'Pulpable', label: 'Pulpable' },
];

export const initialStatesCreate = {
  options: {
    tipoDespacho: tipoDespachoOptions,
    tipoTraslado: tipoTrasladoOptions,
    folios: [] as IOption[],
    proveedores: [] as IOption[],
    faenas: [] as IOption[],
    clientes: [] as IOptionClienteContratoCompra[],
    destinos_contrato: [] as IOptionDestinoContrato[],
    empresas_transporte: [] as IOptionTransporte[],
    choferes: [] as IOptionChofer[],
    camiones: [] as IOption[],
    planesDeManejo: [] as IOption[],
  },
  guia: {
    identificacion: {
      folio: -1,
      tipo_despacho: '',
      tipo_traslado: '',
    },
    proveedor: {
      razon_social: '',
      rut: '',
    },
    faena: {
      rol: '',
      nombre: '',
      comuna: '',
      georreferencia: {
        latitude: 0,
        longitude: 0,
      },
      plan_de_manejo: '',
      certificado: '',
      productos: [],
    },
    cliente: {
      razon_social: '',
      rut: '',
      comuna: '',
      direccion: '',
      giro: '',
      destinos: [],
      destinos_contrato: [],
    },
    destino_contrato: {
      nombre: '',
      productos: [],
      transportes: [],
    },
    transporte: {
      rut: '',
      razon_social: '',
      camiones: [],
      choferes: [],
    },
    chofer: {
      nombre: '',
      rut: '',
    },
    camion: '', // patente
    contrato_compra_id: '',
  },
};

export const initialStatesProducto = {
  options: {
    tipo: tipoProductoOptions,
    productos: [] as IOptionProducto[],
  },
  producto: {
    codigo: '',
    tipo: '' as '',
    especie: '',
    calidad: '',
    largo: 0,
    unidad: '' as '',
  },
  clases_diametricas: [
    {
      clase: '14',
      cantidad: 0,
      volumen: 0,
    },
    {
      clase: '16',
      cantidad: 0,
      volumen: 0,
    },
    {
      clase: '18',
      cantidad: 0,
      volumen: 0,
    },
    {
      clase: '20',
      cantidad: 0,
      volumen: 0,
    },
  ],
  bancos_pulpable: [
    { altura1: 0, altura2: 0, ancho: 0 },
    { altura1: 0, altura2: 0, ancho: 0 },
    { altura1: 0, altura2: 0, ancho: 0 },
    { altura1: 0, altura2: 0, ancho: 0 },
    { altura1: 0, altura2: 0, ancho: 0 },
    { altura1: 0, altura2: 0, ancho: 0 },
  ],
};
// const emitirGuiaInitialStates = {
//   guia: {
//     identificacion: {
//       folio: -1,
//       tipo_despacho: '',
//       tipo_traslado: '',
//     },
//     receptor: {
//       razon_social: '',
//       rut: '',
//       giro: '',
//       direccion: '',
//       comuna: '',
//     },
//     despacho: {
//       chofer: {
//         nombre: '',
//         rut: '',
//       },
//       patente_camion: '',
//       rut_transportista: '',
//       direccion_destino: '',
//     },
//     predio: {
//       certificado: '',
//       comuna: '',
//       georreferencia: {
//         latitude: 0,
//         longitude: 0,
//       },
//       nombre: '',
//       plan_de_manejo: '',
//       rol: '',
//     },
//     proveedor: {
//       razon_social: '',
//       rut: '',
//     },
//   },
// };
