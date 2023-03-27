import { SelectRef } from '@mobile-reality/react-native-select-pro';
import { MutableRefObject } from 'react';
import { Predio, Producto, Proveedor } from '../interfaces/detalles';
import {
  Cliente,
  GuiaDespachoFirebase,
  ProductoAdded,
} from '../interfaces/firestore';
import {
  Emisor,
  Identificacion,
  Receptor,
  Transporte,
} from '../interfaces/guias';
import { IOptions } from '../interfaces/screens';
import {
  clientesOptions,
  prediosOptions,
  proveedoresOptions,
} from '../resources/options';
import { fetchInfoEmpresa, fetchData } from './firebase/data';
import { createGuia } from './firebase/guias';

export const createGuiaDespacho = async (
  rutEmpresa: string,
  preGuia: {
    identificacion: Identificacion;
    emisor: Emisor;
    receptor: Receptor;
    transporte: Transporte;
    productos: ProductoAdded[];
    predio: Predio;
    total: number;
  }
) => {
  const guia: GuiaDespachoFirebase = { ...preGuia, estado: 'pendiente' };
  guia.identificacion.fecha = new Date();
  try {
    await createGuia(rutEmpresa, guia);
  } catch (error) {
    console.log(error);
  }
};

export const handleSelectClienteLogic = (
  option: IOptions | null,
  retrievedData: {
    clientes: Cliente[];
  },
  options: {
    destinos: IOptions[];
  },
  despachoRef: any,
  despacho: Transporte,
  setDespacho: (value: Transporte) => void,
  setReceptor: (value: Receptor) => void
) => {
  const cliente = retrievedData.clientes.find(
      (cliente) => cliente.razon_social === option?.value
    ),
    destinos = cliente?.destinos.map((destino) => ({
      label: destino,
      value: destino,
    }));
  options.destinos = destinos || [];
  setReceptor({
    razon_social: cliente?.razon_social || '',
    rut: cliente?.rut || '',
    giro: '',
    direccion: cliente?.direccion || '',
    comuna: cliente?.comuna || '',
  });
  if (option === null) {
    despachoRef?.current.clear();
    setDespacho({
      ...despacho,
      direccion_destino: '',
    });
  }
};

export const handleSelectPredioLogic = (
  option: IOptions | null,
  retrievedData: {
    predios: Predio[];
  },
  options: {
    planesDeManejo: IOptions[];
  },
  planDeManejoRef: any,
  predio: Predio,
  setPredio: (value: Predio) => void
) => {
  const predioSplit = option?.value.split('-');
  const { comuna, manzana, rol } = {
    comuna: predioSplit ? predioSplit[0] : '',
    manzana: predioSplit ? predioSplit[1] : '',
    rol: predioSplit ? predioSplit[2] : '',
  };
  const newPredio = retrievedData.predios.find(
      (newPredio) =>
        newPredio.comuna === comuna &&
        newPredio.manzana === manzana &&
        newPredio.rol === rol
    ),
    planesDeManejo =
      newPredio?.plan_de_manejo.map((plan) => ({
        label: plan,
        value: plan,
      })) || [];
  options.planesDeManejo = planesDeManejo;
  setPredio({
    certificado: newPredio?.certificado || '',
    comuna: newPredio?.comuna || '',
    georreferencia: {
      latitude: newPredio?.georreferencia.latitude || 0,
      longitude: newPredio?.georreferencia.longitude || 0,
    },
    manzana: newPredio?.manzana || '',
    rol: newPredio?.rol || '',
    nombre: newPredio?.nombre || '',
    plan_de_manejo: predio.plan_de_manejo || [],
  });
  console.log(newPredio);
  if (option === null) {
    planDeManejoRef?.current.clear();
  }
};

export const handleSelectProductoLogic = (
  option: IOptions | null,
  retrievedData: {
    productos: Producto[];
  },
  claseDiametricaRef: MutableRefObject<SelectRef>,
  actualProducto: ProductoAdded,
  setActualProducto: (value: ProductoAdded) => void
) => {
  const productoSplit = option?.value.split(' - ');
  const { especie, tipo, calidad, largo, precio_ref } = {
    especie: productoSplit ? productoSplit[0] : '',
    tipo: productoSplit ? productoSplit[1] : '',
    calidad: productoSplit ? productoSplit[2] : '',
    largo: productoSplit ? productoSplit[3] : '',
    precio_ref: productoSplit ? productoSplit[4].slice(1, -3) : '',
  };
  const newProducto = retrievedData.productos.find(
    (newProducto) =>
      newProducto.especie === especie &&
      newProducto.tipo === tipo &&
      newProducto.calidad === calidad &&
      newProducto.largo === parseFloat(largo) &&
      newProducto.precio_ref === parseFloat(precio_ref)
  );
  setActualProducto({
    especie: newProducto?.especie || '',
    tipo: newProducto?.tipo || '',
    calidad: newProducto?.calidad || '',
    largo: newProducto?.largo || 0,
    unidad: newProducto?.unidad || '',
    cantidad: newProducto?.cantidad || 0,
    precio_ref: newProducto?.precio_ref || 0,
    claseDiametrica:
      newProducto?.tipo === 'Asserrable' ? actualProducto.claseDiametrica : '',
  });
  if (option === null || newProducto?.tipo !== 'Aserrable') {
    claseDiametricaRef.current?.clear();
  }
};

export const handleSelectProveedorLogic = (
  option: IOptions | null,
  retrievedData: {
    proveedores: Proveedor[];
  },
  setProveedor: (value: Proveedor) => void
) => {
  const newProveedor = retrievedData.proveedores.find(
    (newProveedor) => newProveedor.razon_social === option?.value
  );
  setProveedor({
    razon_social: newProveedor?.razon_social || '',
    rut: newProveedor?.rut || '',
  });
};

export const handleFetchAllData = async (
  rutEmpresa: string,
  // TODO: Fix this type
  options: any,
  setEmisor: (value: Emisor) => void,
  // TODO: Fix this type
  setOptions: (value: any) => void,
  setRetrievedData: (value: {
    clientes: Cliente[];
    predios: Predio[];
    productos: Producto[];
    proveedores: Proveedor[];
  }) => void
) => {
  const empresaInfo = await fetchInfoEmpresa(rutEmpresa);
  setEmisor(empresaInfo as Emisor);
  const newRetrievedData = await fetchData(rutEmpresa);
  setOptions({
    ...options,
    clientes: clientesOptions(newRetrievedData.clientes),
    predios: prediosOptions(newRetrievedData.predios),
    proveedores: proveedoresOptions(newRetrievedData.proveedores),
  });
  setRetrievedData(newRetrievedData);
};
