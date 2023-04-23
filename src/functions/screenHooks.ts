import { useState } from 'react';
import { Proveedor, Predio } from '../interfaces/detalles';
import {
  Identificacion,
  Receptor,
  Transporte,
  Chofer,
} from '../interfaces/guias';
import { IOptions } from '../interfaces/screens';
import { tipoDespachoOptions, tipoTrasladoOptions } from '../resources/options';

export const createGuiaScreenHooks = () => {
  const [options, setOptions] = useState({
    tipoDespacho: tipoDespachoOptions,
    tipoTraslado: tipoTrasladoOptions,
    folios: [] as IOptions[],
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
    options,
    setOptions,
    identificacion,
    setIdentificacion,
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
