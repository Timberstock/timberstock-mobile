import { SelectRef } from '@mobile-reality/react-native-select-pro';
import { MutableRefObject } from 'react';
import { Predio, Producto, Proveedor } from '../interfaces/detalles';
import { Cliente, ProductoAdded } from '../interfaces/firestore';
import { Receptor, Transporte } from '../interfaces/guias';
import { IOptions } from '../interfaces/screens';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

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

// const savePDF = async () => {
//   const html = `
//               <html>
//                 <head>
//                   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
//                 </head>
//                 <body style="text-align: center;">
//                   <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
//                     Hello Expo!
//                   </h1>
//                   <img
//                     src="https://d30j33t1r58ioz.cloudfront.net/static/guides/sdk.png"
//                     style="width: 90vw;" />
//                 </body>
//               </html>
//               `;
//   // On iOS/android prints the given html. On web prints the HTML from the current page.
//   const { uri } = await Print.printToFileAsync({ html });
//   console.log('File has been saved to:', uri);
//   await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
// };

export const generatePDF = async () => {
  try {
    // Prepare the HTML content for the PDF
    const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
      </head>
      <body style="text-align: center;">
        <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
          Hello Expo!
        </h1>
        <img
          src="https://d30j33t1r58ioz.cloudfront.net/static/guides/sdk.png"
          style="width: 90vw;" />
      </body>
    </html>
    `;

    // Generate the PDF using Expo's print module
    const { uri } = await Print.printToFileAsync({ html: html });

    // // Move the PDF file to a permanent location using Expo's file system module
    const permanentUri = `${FileSystem.documentDirectory}example.pdf`;
    await FileSystem.moveAsync({ from: uri, to: permanentUri });
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    console.log('PDF file generated:', permanentUri);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
