import { IOption } from "@/interfaces/screens/screens";
import {
  IOptionCamion,
  IOptionCarguio,
  IOptionChofer,
  IOptionClienteContratoCompra,
  IOptionCosecha,
  IOptionDestinoContrato,
  IOptionTransporte,
} from "@/interfaces/screens/emision/create";
import {
  IOptionProducto,
  IOptionTipoProducto,
} from "@/interfaces/screens/emision/productos";
import { Producto } from "@/interfaces/esenciales";
import { Servicios } from "@/interfaces/contratos/contratoCompra";
import { ServiciosGuia } from "@/interfaces/firestore/guia";

const tipoTrasladoOptions = [
  { value: "Constituye venta", label: "Venta" },
  // { value: 'Venta por efectuar', label: 'Venta por Efectuar' },
  // { value: 'Consignación', label: 'Consignación' },
  // { value: 'Entrega gratuita', label: 'Gratuito' },
  { value: "Traslados internos", label: "Interno" },
  { value: "Otros traslados no venta", label: "Otros" },
];

const tipoDespachoOptions = [
  { value: "Por cuenta del receptor", label: "Cuenta Receptor" },
  {
    value: "Por cuenta del emisor a instalaciones cliente",
    label: "Cuenta Emisor a Instalaciones Cliente",
  },
  {
    value: "Por cuenta del emisor a otras instalaciones",
    label: "Cuenta Emisor Otras Instalaciones",
  },
];

const tipoProductoOptions = [
  { value: "Aserrable", label: "Aserrable" },
  { value: "Pulpable", label: "Pulpable" },
];

export const initialStateGuia = {
  emisor: {
    rut: "",
    razon_social: "",
    direccion: "",
    comuna: "",
    giro: "",
    actividad_economica: [],
  },
  identificacion: {
    folio: 0,
    tipo_despacho: "Por cuenta del emisor a instalaciones cliente",
    tipo_traslado: "Constituye venta",
  },
  proveedor: {
    razon_social: "",
    rut: "",
  },
  folio_guia_proveedor: 0,
  receptor: {
    rut: "",
    razon_social: "",
    comuna: "",
    direccion: "",
    giro: "",
  },
  predio_origen: {
    rol: "",
    nombre: "",
    comuna: "",
    georreferencia: {
      latitude: 0,
      longitude: 0,
    },
    plan_de_manejo: "",
    certificado: "",
  },
  destino: {
    nombre: "",
    rol: "",
    comuna: "",
    georreferencia: {
      latitude: 0,
      longitude: 0,
    },
  },
  transporte: {
    empresa: {
      rut: "",
      razon_social: "",
    },
    precio_unitario_transporte: 0,
    chofer: {
      nombre: "",
      rut: "",
    },
    camion: {
      marca: "",
      patente: "",
    },
    carro: "",
  },
  producto: {
    codigo: "",
    tipo: "" as "Aserrable" | "Pulpable" | "",
    especie: "",
    calidad: "",
    largo: 0,
    unidad: "" as "M3" | "MR" | "",
  },
  servicios: {},
  observaciones: [],
  contrato_compra_id: "",
  contrato_venta_id: "",
  volumen_total_emitido: 0,
  precio_unitario_guia: 0,
  monto_total_guia: 0,
  estado: "",
};

export const initialStatesOptionsCreate = {
  tipoDespacho: tipoDespachoOptions,
  tipoTraslado: tipoTrasladoOptions,
  folios: [] as IOption[],
  proveedores: [] as IOption[],
  faenas: [] as IOption[],
  clientes: [] as IOptionClienteContratoCompra[],
  destinos_contrato: [] as IOptionDestinoContrato[],
  empresas_transporte: [] as IOptionTransporte[],
  empresas_carguio: [] as IOptionCarguio[],
  empresas_cosecha: [] as IOptionCosecha[],
  choferes: [] as IOptionChofer[],
  camiones: [] as IOptionCamion[],
  carros: [] as IOption[],
  planesDeManejo: [] as IOption[],
};

export const initialStatesProducto = {
  options: {
    tipo: tipoProductoOptions as IOptionTipoProducto[],
    productos: [] as IOptionProducto[],
  },
  producto: {
    codigo: "",
    tipo: "",
    especie: "",
    calidad: "",
    largo: 0,
    unidad: "",
  } as Producto,
  clases_diametricas: [
    {
      clase: "14",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "16",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "18",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "20",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "22",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "24",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "26",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "28",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "30",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "32",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "34",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "36",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "38",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "40",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "42",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "44",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "46",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "48",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
    },
    {
      clase: "50",
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase: 0,
      precio_unitario_venta_clase: 0,
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
