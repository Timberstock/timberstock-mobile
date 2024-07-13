import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
// import { pdf417 } from 'bwip-js';
import 'react-zlib-js'; // side effects only
import BwipJs from 'bwip-js';

import getTED from '@/functions/pdf/timbre';
import { GuiaDespachoFirestore } from '@/interfaces/firestore/guia';
import { GuiaDespacho as GuiaDespachoCreateScreen } from '@/interfaces/screens/emision/create';
import { IOption } from '@/interfaces/screens/screens';
import { ContratoCompra } from '@/interfaces/contratos/contratoCompra';
import { ContratoVenta } from '@/interfaces/contratos/contratoVenta';
import { initialStatesProducto } from '@/resources/initialStates';
import { Producto } from '@/interfaces/esenciales';
import {
  Banco,
  ClaseDiametrica,
  IOptionProducto,
} from '@/interfaces/screens/emision/productos';
import { Usuario } from '@/interfaces/context/user';
import { Empresa } from '@/interfaces/context/app';
import { Alert } from 'react-native';
import { createGuiaDoc } from '@/functions/firebase/firestore/guias';
import { createPDFHTMLString } from '@/functions/pdf/html';

export const handleSelectTipoLogic = (
  option: IOption | null,
  productosData: Producto[]
) => {
  // Get tipo from option
  const selectedTipo = (option?.value as 'Aserrable' | 'Pulpable') || '';

  // Reset producto to initial state and update its tipo
  const newProducto: Producto = {
    ...initialStatesProducto.producto,
    tipo: selectedTipo || initialStatesProducto.producto.tipo,
  };

  const newOptions = {
    ...initialStatesProducto.options,
  };

  if (selectedTipo) {
    // Reconstruct options with only the productos that match the selected tipo
    const filteredProductos = productosData
      .filter((producto) => producto.tipo === option?.value)
      .map((producto) => ({
        value: `${producto.codigo}`,
        label: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo}`,
        productoObject: producto,
      }));
    newOptions.productos = filteredProductos;
  }

  return {
    newProducto,
    newOptions,
  };
};

export const handleSelectProductoLogic = (
  option: IOptionProducto | null,
  prevProducto: Producto
) => {
  console.log(option?.productoObject);
  console.log(prevProducto);
  const newProducto = option?.productoObject || initialStatesProducto.producto;
  newProducto.tipo = prevProducto.tipo;
  return newProducto;
};

export const handleUpdateClaseDiametricaValueLogic = (
  producto: Producto,
  prevClasesDiametricas: ClaseDiametrica[],
  clase: string,
  cantidad: number
) => {
  const newClasesDiametricas = [...prevClasesDiametricas];
  for (const claseDiametrica of newClasesDiametricas) {
    if (claseDiametrica.clase === clase) {
      claseDiametrica.cantidad = cantidad;
      claseDiametrica.volumen = parseFloat(
        (
          cantidad *
          producto.largo *
          Math.PI *
          (parseFloat(clase) / (2 * 100)) ** 2
        ).toFixed(4)
      ); // pasamos diametro de centimetros a metros,
      break;
    }
  }

  return newClasesDiametricas;
};

export const handleIncreaseNumberOfClasesDiametricasLogic = (
  prevClasesDiametricas: ClaseDiametrica[]
) => {
  const diametroNewClaseDiametrica = 14 + 2 * prevClasesDiametricas.length;
  return [
    ...prevClasesDiametricas,
    {
      clase: diametroNewClaseDiametrica.toString(),
      cantidad: 0,
      volumen: 0,
    },
  ];
};

export const handleUpdateBancoPulpableValueLogic = (
  prevBancosPulpable: Banco[],
  bancoIndex: number,
  dimension: keyof Banco,
  value: number
) => {
  const newBancosPulpable = [...prevBancosPulpable];
  newBancosPulpable[bancoIndex][dimension] = value;
  return newBancosPulpable;
};

export const checkProductosValues = (
  producto: Producto,
  clasesDiametricas: ClaseDiametrica[],
  bancosPulpable: Banco[]
) => {
  let allow = false;
  // Check if the user has entered any value in the products actual values
  if (producto.tipo === 'Aserrable') {
    for (const claseDiametrica of clasesDiametricas) {
      if (claseDiametrica.cantidad !== 0) {
        // If any aserrable product has any valid clase diametrica, allow
        allow = true;
        break;
      }
    }
  } else if (producto.tipo === 'Pulpable') {
    for (const value of bancosPulpable) {
      if (value.altura1 !== 0 && value.altura2 !== 0 && value.ancho !== 0) {
        // If any pulpable product has any valid banco, allow
        allow = true;
        break;
      }
    }
  }
  if (!allow)
    Alert.alert(
      'Error',
      'No se puede crear una guía con todos los valores en 0'
    );

  return allow;
};

export const handleCreateGuiaLogic = async (
  navigation: any,
  precioUnitarioGuia: number,
  user: Usuario | null,
  guia: GuiaDespachoCreateScreen,
  empresa: Empresa,
  producto: Producto,
  contratosVenta: ContratoVenta[],
  clasesDiametricas: ClaseDiametrica[],
  bancosPulpable: Banco[],
  setCreateGuiaLoading: (loading: boolean) => void,
  setModalVisible: (visible: boolean) => void,
  updateUserReservedFolios: (
    newReservedFolios: number[],
    newCafs?: string[]
  ) => Promise<void>
) => {
  // We build the guia object to be uploaded to Firestore
  try {
    // TODO: Agregar que si no hay contrato de venta con el producto-destino-cliente, no se pueda crear la guía
    setCreateGuiaLoading(true);
    if (user && user.firebaseAuth && user.empresa_id) {
      const newGuia: GuiaDespachoFirestore = {
        identificacion: guia.identificacion,
        emisor: {
          razon_social: empresa.razon_social,
          rut: empresa.rut,
          giro: empresa.giro,
          direccion: empresa.direccion,
          comuna: empresa.comuna,
          actividad_economica: empresa.actividad_economica,
        },
        receptor: {
          razon_social: guia.cliente.razon_social,
          rut: guia.cliente.rut,
          giro: guia.cliente.giro || '',
          direccion: guia.cliente.direccion,
          comuna: guia.cliente.comuna,
        },
        predio: {
          rol: guia.faena.rol,
          nombre: guia.faena.nombre,
          comuna: guia.faena.comuna,
          georreferencia: guia.faena.georreferencia,
          plan_de_manejo: guia.faena.plan_de_manejo,
          certificado: guia.faena.certificado,
        },
        transporte: {
          rut_transportista: guia.transporte.rut,
          direccion_destino: guia.destino_contrato.nombre,
          chofer: {
            nombre: guia.chofer.nombre,
            rut: guia.chofer.rut,
          },
          camion: guia.camion,
        },
        producto: producto,
        proveedor: guia.proveedor,
        contrato_compra_id: guia.contrato_compra_id,
        volumen_total: 0,
      } as GuiaDespachoFirestore;

      // Filter contratoVenta
      newGuia.contrato_venta_id =
        contratosVenta.find(
          (contrato) =>
            contrato.cliente.rut === guia.cliente.rut &&
            contrato.cliente.destinos_contrato.some((destino) =>
              destino.productos.some(
                (producto) => producto.codigo === newGuia.producto.codigo
              )
            )
        )?.firestore_id || '';

      if (!newGuia.contrato_venta_id) {
        Alert.alert(
          'Error',
          'No se encontró contrato de venta vigente para este producto'
        );
        setCreateGuiaLoading(false);
        return;
      }

      if (producto.tipo === 'Aserrable') {
        // Only save the clases diametricas that have a valid cantidad
        newGuia.clases_diametricas = clasesDiametricas.filter(
          (claseDiametrica) => claseDiametrica.cantidad !== 0
        );
        for (const claseDiametrica of clasesDiametricas) {
          console.log(newGuia.volumen_total);
          newGuia.volumen_total += claseDiametrica.volumen;
        }
      } else if (producto.tipo === 'Pulpable') {
        newGuia.volumen_total = calculateBancosPulpableVolumen(
          producto,
          bancosPulpable
        );
      }

      newGuia.precio_unitario_guia = precioUnitarioGuia;
      newGuia.monto_total_guia = Math.trunc(
        precioUnitarioGuia * newGuia.volumen_total
      );

      console.log(newGuia);

      const guiaDate = await createGuiaDoc(user.empresa_id, newGuia); // Not sure if this is actually waiting for the function to finish

      const CAF = user.cafs[Math.floor((guia.identificacion.folio - 1) / 5)];

      // We have to add the 'as string' because in case of error createGuiaDoc returns nothing
      await generatePDF(newGuia, guiaDate as string, CAF);

      // Remove the folio from the list of folios_reserved
      // const newFoliosReserved = user.folios_reservados.filter(
      //   (folio) => folio !== guia.identificacion.folio
      // );
      // Update the user's folios locally popping the one just used
      // await updateUserReservedFolios(newFoliosReserved);
    }
    setCreateGuiaLoading(false);
    // setModalVisible(false);
    // navigation.push('Home');
  } catch (e) {
    console.log(e);
    setCreateGuiaLoading(false);
    Alert.alert('Error', 'No se pudo crear la guia de despacho');
  }
};

export const generatePDF = async (
  guia: GuiaDespachoFirestore,
  guiaDate: string,
  CAF: string
) => {
  try {
    // get TED
    const TED = await getTED(CAF, guia);
    console.log('TED GENERADO');

    // Generate the barcode
    const barcode = await BwipJs.toDataURL({
      bcid: 'pdf417',
      text: TED,
    });

    console.log('barcode GENERADO');

    // Prepare the HTML content for the PDF with the barcode
    const html = await createPDFHTMLString(guia, guiaDate, barcode);

    console.log('html GENERADO');

    // Generate the PDF using Expo's print module
    const { uri } = await Print.printToFileAsync({ html: html });

    // // Move the PDF file to a permanent location using Expo's file system module
    const permanentUri = `${FileSystem.documentDirectory}GuiaFolio${guia.identificacion.folio}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: permanentUri });
    await shareAsync(permanentUri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
    });
    console.log(permanentUri);

    console.log('PDF file generated:', permanentUri);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const calculateBancosPulpableVolumen = (
  producto: Producto,
  bancosPulpable: Banco[]
): number => {
  // calculate volumen_total_guia
  let volumenTotal = 0;
  for (const banco of bancosPulpable) {
    const { altura1, altura2, ancho } = banco;
    if (!(altura1 !== 0 && altura2 !== 0 && ancho !== 0)) {
      // If any dimension is 0, skip this banco
      continue;
    }
    const volumen = parseFloat(
      (((altura1 * 0.01 + altura2 * 0.01) * ancho * 0.01) / 2).toFixed(4)
    ); // pasamos de centimetros a metros
    volumenTotal += volumen;
  }
  // TODO: largo is not considered here?
  // TODO: dividir por 2.44 [estandarizar por largo]
  return volumenTotal * producto.largo;
};
