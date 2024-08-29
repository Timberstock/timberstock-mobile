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
import { ContratoVenta, ProductoContratoVenta } from '@/interfaces/contratos/contratoVenta';
import { initialStatesProducto } from '@/resources/initialStates';
import { Producto } from '@/interfaces/esenciales';
import {
  Banco,
  ClaseDiametrica,
  IOptionProducto,
  IOptionTipoProducto,
} from '@/interfaces/screens/emision/productos';
import { Usuario } from '@/interfaces/context/user';
import { Empresa } from '@/interfaces/context/app';
import { Alert } from 'react-native';
import { createGuiaDoc } from '@/functions/firebase/firestore/guias';
import { createPDFHTMLString } from '@/functions/pdf/html';
import { ContratoCompra, ProductoContratoCompra } from '@/interfaces/contratos/contratoCompra';

export const handleSelectTipoLogic = (
  option: IOptionTipoProducto | null,
  productosData: Producto[]
) => {
  // Get tipo from option
  const selectedTipo = option ? option.value : '';

  // Reset producto to initial state and update its tipo
  const newProducto: Producto = {
    ...initialStatesProducto.producto,
    tipo: selectedTipo,
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
      claseDiametrica.cantidad_emitida = cantidad;
      claseDiametrica.volumen_emitido = parseFloat(
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
      cantidad_emitida: 0,
      volumen_emitido: 0,
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
      if (claseDiametrica.cantidad_emitida !== 0) {
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
  contratosCompra: ContratoCompra[],
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
          empresa: {
            rut: guia.transporte.rut,
            razon_social: guia.transporte.razon_social,
          },
          direccion_destino: guia.destino_contrato.nombre,
          chofer: {
            nombre: guia.chofer.nombre,
            rut: guia.chofer.rut,
          },
          camion: guia.camion,
        },
        servicios: {
          carguio: guia.servicios?.carguio || {},
          cosecha: guia.servicios?.cosecha || {},
        },
        producto: producto,
        proveedor: guia.proveedor,
        contrato_compra_id: guia.contrato_compra_id,
        folio_guia_proveedor:
          guia.folio_guia_proveedor === 0 ? '' : guia.folio_guia_proveedor,
        volumen_total_emitido: 0,
      } as GuiaDespachoFirestore;

      // Filter contratoCompra and get producto
      const contratoCompra = contratosCompra.find(
        (contrato) =>
          contrato.clientes.some((cliente) => 
            cliente.rut === guia.cliente.rut &&
            cliente.destinos_contrato.some((destino) => 
              destino.nombre === guia.destino_contrato.nombre &&
              destino.productos.some((producto) => 
                producto.codigo === newGuia.producto.codigo
              ))));
              console.log('contratoCompra', contratoCompra);
              
              // Filter contratoVenta
              const contratoVenta = contratosVenta.find(
                (contrato) =>
                  contrato.cliente.rut === guia.cliente.rut &&
                contrato.cliente.destinos_contrato.some((destino) =>
                  destino.nombre === guia.destino_contrato.nombre &&
                destino.faenas.some((faena) => 
                  faena.rol === guia.faena.rol && 
                faena.productos_destino_contrato.some(
                  (producto) => (producto.codigo === newGuia.producto.codigo)
                ))
              )
            );

            console.log('contratoVenta', contratoVenta);
            
            newGuia.contrato_venta_id = contratoVenta?.firestore_id || '';
            
            if (!newGuia.contrato_venta_id) {
              Alert.alert(
                'Error',
                'No se encontró contrato de venta vigente para esta combinación cliente-destino-origen-producto'
              );
              setCreateGuiaLoading(false);
              return;
            }
          // Get corresponding producto from contratoCompra
          const productoContratoCompra = contratoCompra?.clientes.find(
              (cliente) => cliente.rut === guia.cliente.rut
            )?.destinos_contrato.find(
              (destino) => destino.nombre === guia.destino_contrato.nombre
            )?.productos.find(
              (producto) => producto.codigo === newGuia.producto.codigo
            ) as ProductoContratoCompra;

            console.log('productoContratoCompra', productoContratoCompra);

          // Get corresponding producto from contratoVenta
          const productoContratoVenta = contratoVenta?.cliente?.destinos_contrato
            ?.find((d) => d.nombre === guia.destino_contrato.nombre)
            ?.faenas.find((f) => f.rol === guia.faena.rol)
            ?.productos_destino_contrato.find(
              (p) => p.codigo === producto.codigo,
            ) as ProductoContratoVenta;

          console.log('productoContratoVenta', productoContratoVenta);

      if (producto.tipo === 'Aserrable') {
        // newGuia.producto.clases_diametricas = clasesDiametricas;
        // for (const claseDiametrica of clasesDiametricas) {
        //   newGuia.volumen_total_emitido += claseDiametrica.volumen;
        // }
        newGuia.producto.clases_diametricas = clasesDiametricas.map(
          (claseDiametrica) => {
            newGuia.volumen_total_emitido += claseDiametrica.volumen_emitido || 0;

            // If clase is higher than 50, use the prices of clase 50
            const claseToUse = parseInt(claseDiametrica.clase) > 50 ? "50" : claseDiametrica.clase;

            const precioUnitarioCompraClase = productoContratoCompra?.clases_diametricas?.find(
              (clase) => clase.clase === claseToUse
            )?.precio_unitario_compra_clase || 0;
            const precioUnitarioVentaClase = productoContratoVenta?.clases_diametricas?.find(
              (clase) => clase.clase === claseToUse
            )?.precio_unitario_venta_clase || 0;

            // console.log('claseDiametrica', claseDiametrica);
            // console.log('precioUnitarioCompraClase', precioUnitarioCompraClase);
            // console.log('precioUnitarioVentaClase', precioUnitarioVentaClase);

            return {
              ...claseDiametrica,
              precio_unitario_compra_clase: precioUnitarioCompraClase,
              precio_unitario_venta_clase: precioUnitarioVentaClase,
            }
          }
        )
      } else if (producto.tipo === 'Pulpable') {
        newGuia.volumen_total_emitido = calculateBancosPulpableVolumen(
          producto,
          bancosPulpable
        );
        newGuia.producto.precio_unitario_compra_mr = productoContratoCompra?.precio_unitario_compra_mr || 0;
        newGuia.producto.precio_unitario_venta_mr = productoContratoVenta?.precio_unitario_venta_mr || 0;
      }

      newGuia.volumen_total_emitido = parseFloat(newGuia.volumen_total_emitido.toFixed(4));
      newGuia.precio_unitario_guia = precioUnitarioGuia;
      newGuia.monto_total_guia = Math.trunc(
        precioUnitarioGuia * newGuia.volumen_total_emitido
      );

      const guiaDate = await createGuiaDoc(user.empresa_id, newGuia); // Not sure if this is actually waiting for the function to finish

      const CAF = user.cafs[Math.floor((guia.identificacion.folio - 1) / 5)];

      // We have to add the 'as string' because in case of error createGuiaDoc returns nothing
      await generatePDF(newGuia, guiaDate as string, CAF);

      // Remove the folio from the list of folios_reserved
      const newFoliosReserved = user.folios_reservados.filter(
        (folio) => folio !== guia.identificacion.folio
      );
      // Update the user's folios locally popping the one just used
      await updateUserReservedFolios(newFoliosReserved);
    }
    setCreateGuiaLoading(false);
    setModalVisible(false);
    navigation.push('Home');
  } catch (e) {
    console.log(e);
    console.log(guia);
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
    const volumen = ((altura1 * 0.01 + altura2 * 0.01) * ancho * 0.01) / 2; // pasamos de centimetros a metros
    volumenTotal += volumen;
  }
  // TODO: largo is not considered here?
  // TODO: dividir por 2.44 [estandarizar por largo]
  const metrosRumaTotal = parseFloat(
    (volumenTotal * producto.largo).toFixed(4)
  );

  return metrosRumaTotal;
};

export const resetClasesDiametricas = () => {
  for (const claseDiametrica of initialStatesProducto.clases_diametricas) {
    claseDiametrica.cantidad_emitida = 0;
    claseDiametrica.volumen_emitido = 0;
  }
  return initialStatesProducto.clases_diametricas;
};

export const resetBancosPulpable = () => {
  for (const banco of initialStatesProducto.bancos_pulpable) {
    banco.altura1 = 0;
    banco.altura2 = 0;
    banco.ancho = 0;
  }
  return initialStatesProducto.bancos_pulpable;
};

export const filterProductosWithContratoVenta = (
  contratosVenta: ContratoVenta[],
  guia: GuiaDespachoCreateScreen,
) => {
  const productosPosibles = guia.destino_contrato.productos;
  const productosConContratoVenta = contratosVenta
    .find((contrato) => contrato.cliente.rut === guia.cliente.rut)
    ?.cliente.destinos_contrato.find(
      (destino) => destino.nombre === guia.destino_contrato.nombre
    )?.faenas.find((faena) => faena.rol === guia.faena.rol)
    ?.productos_destino_contrato.map((producto) => producto.codigo) || [];

  return productosPosibles.filter((producto) => productosConContratoVenta.includes(producto.codigo));
}