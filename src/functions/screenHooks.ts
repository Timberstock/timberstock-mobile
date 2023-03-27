import { useState } from 'react';
import { Proveedor, Predio, Producto } from '../interfaces/detalles';
import { Cliente } from '../interfaces/firestore';
import {
  Identificacion,
  Emisor,
  Receptor,
  Transporte,
  Chofer,
} from '../interfaces/guias';
import { IOptions } from '../interfaces/screens';
import { tipoDespachoOptions, tipoTrasladoOptions } from '../resources/options';
import { formatDate } from '../functions/helpers';

export const createGuiaScreenHooks = (foliosOpts: []) => {
  const [retrievedData, setRetrievedData] = useState({
    proveedores: [] as Proveedor[],
    predios: [] as Predio[],
    productos: [] as Producto[],
    clientes: [] as Cliente[],
  });
  const [options, setOptions] = useState({
    folios: foliosOpts,
    tipoDespacho: tipoDespachoOptions,
    tipoTraslado: tipoTrasladoOptions,

    clientes: [] as IOptions[],
    destinos: [] as IOptions[],

    predios: [] as IOptions[],
    planesDeManejo: [] as IOptions[],
    proveedores: [] as IOptions[],
  });

  const [identificacion, setIdentificacion] = useState<Identificacion>({
    folio: -1,
    tipo_despacho: '',
    tipo_traslado: '',
  });
  const [emisor, setEmisor] = useState<Emisor>({
    razon_social: '',
    rut: '',
    giro: '',
    direccion: '',
    comuna: '',
    actividad_economica: [],
  });
  const [receptor, setReceptor] = useState<Receptor>({
    razon_social: '',
    rut: '',
    giro: '',
    direccion: '',
    comuna: '',
  });
  const [despacho, setDespacho] = useState<Transporte>({
    chofer: {
      nombre: '',
      rut: '',
    } as Chofer,
    patente: '',
    rut_transportista: '',
    direccion_destino: '',
  });

  const [predio, setPredio] = useState<Predio>({
    certificado: '',
    comuna: '',
    georreferencia: {
      latitude: 0,
      longitude: 0,
    },
    manzana: '',
    nombre: '',
    plan_de_manejo: [],
    rol: '',
  });

  const [proveedor, setProveedor] = useState<Proveedor>({
    razon_social: '',
    rut: '',
  });
  return {
    retrievedData,
    setRetrievedData,
    options,
    setOptions,
    identificacion,
    setIdentificacion,
    emisor,
    setEmisor,
    receptor,
    setReceptor,
    despacho,
    setDespacho,
    predio,
    setPredio,
    proveedor,
    setProveedor,
  };
};
