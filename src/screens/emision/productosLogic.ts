import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
// import { pdf417 } from 'bwip-js';
import "react-zlib-js"; // side effects only
import BwipJs from "bwip-js";

import getTED from "@/functions/pdf/timbre";
import {
  ClaseDiametricaGuia,
  GuiaDespachoFirestore,
  ProductoGuia,
} from "@/interfaces/firestore/guia";
// import { GuiaDespacho as GuiaDespachoCreateScreen } from "@/interfaces/screens/emision/create";
import {
  ClaseDiametricaContratoVenta,
  ContratoVenta,
  ProductoContratoVenta,
} from "@/interfaces/contratos/contratoVenta";
import { initialStatesProducto } from "@/resources/initialStates";
import { Producto } from "@/interfaces/esenciales";
import {
  Banco,
  ClaseDiametricaContratos,
  IOptionProducto,
  IOptionTipoProducto,
  ProductoOptionObject,
} from "@/interfaces/screens/emision/productos";
import { Usuario } from "@/interfaces/context/user";
import { Alert } from "react-native";
import { createGuiaDoc } from "@/functions/firebase/firestore/guias";
import { createPDFHTMLString } from "@/functions/pdf/html";
import {
  ContratoCompra,
  ProductoContratoCompra,
} from "@/interfaces/contratos/contratoCompra";

export const handleSelectTipoLogic = (
  option: IOptionTipoProducto | null,
  productosOptions: ProductoOptionObject[],
) => {
  // Get tipo from option
  const selectedTipo = option ? option.value : "";

  // Reset producto to initial state and update its tipo
  const newProducto: ProductoGuia = {
    ...initialStatesProducto.producto,
    tipo: selectedTipo,
  };

  const newOptions = {
    ...initialStatesProducto.options,
  };

  if (selectedTipo) {
    // Reconstruct options with only the productos that match the selected tipo
    const filteredProductos = productosOptions
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
  prevProducto: ProductoOptionObject,
) => {
  const newProducto = option?.productoObject || initialStatesProducto.producto;
  newProducto.tipo = prevProducto.tipo;
  return newProducto;
};

export const handleUpdateClaseDiametricaValueLogic = (
  producto: ProductoGuia,
  clase: string,
  cantidad: number,
) => {
  if (producto.tipo !== "Aserrable" || !producto.clases_diametricas)
    return producto.clases_diametricas;

  const newClasesDiametricas = [...producto.clases_diametricas];
  for (const claseDiametrica of newClasesDiametricas) {
    if (claseDiametrica.clase === clase) {
      claseDiametrica.cantidad_emitida = cantidad;
      claseDiametrica.volumen_emitido = parseFloat(
        (
          cantidad *
          parseFloat(clase) ** 2 *
          producto.largo *
          (1 / 10000)
        ).toFixed(4),
      );
      // (
      //   cantidad *
      //   producto.largo *
      //   Math.PI *
      //   (parseFloat(clase) / (2 * 100)) ** 2
      // ).toFixed(4),
      // ); // pasamos diametro de centimetros a metros,
      break;
    }
  }

  return newClasesDiametricas;
};

export const handleIncreaseNumberOfClasesDiametricasLogic = (
  prevClasesDiametricas: ClaseDiametricaGuia[],
) => {
  const diametroNewClaseDiametrica = 14 + 2 * prevClasesDiametricas.length;
  return [
    ...prevClasesDiametricas,
    {
      clase: diametroNewClaseDiametrica.toString(),
      cantidad_emitida: 0,
      volumen_emitido: 0,
      precio_unitario_compra_clase:
        prevClasesDiametricas[prevClasesDiametricas.length - 1]
          .precio_unitario_compra_clase,
      precio_unitario_venta_clase:
        prevClasesDiametricas[prevClasesDiametricas.length - 1]
          .precio_unitario_venta_clase,
    },
  ];
};

export const handleUpdateBancoPulpableValueLogic = (
  prevBancosPulpable: Banco[],
  bancoIndex: number,
  dimension: keyof Banco,
  value: number,
) => {
  const newBancosPulpable = [...prevBancosPulpable];
  newBancosPulpable[bancoIndex][dimension] = value;
  return newBancosPulpable;
};

export const checkProductosValues = (
  producto: ProductoGuia,
  bancosPulpable: Banco[],
) => {
  let allow = false;
  // Check if the user has entered any value in the products actual values
  if (producto.tipo === "Aserrable") {
    for (const claseDiametrica of producto.clases_diametricas || []) {
      if (claseDiametrica.cantidad_emitida !== 0) {
        // If any aserrable product has any valid clase diametrica, allow
        allow = true;
        break;
      }
    }
  } else if (producto.tipo === "Pulpable") {
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
      "Error",
      "No se puede crear una guía con todos los valores en 0",
    );

  return allow;
};

export const handleCreateGuiaLogic = async (
  navigation: any,
  precioUnitarioGuia: number,
  user: Usuario | null,
  guia: GuiaDespachoFirestore,
  bancosPulpable: Banco[],
  setCreateGuiaLoading: (loading: boolean) => void,
  setModalVisible: (visible: boolean) => void,
  updateUserReservedFolios: (
    newReservedFolios: number[],
    newCafs?: string[],
  ) => Promise<void>,
) => {
  try {
    setCreateGuiaLoading(true);
    if (user && user.firebaseAuth && user.empresa_id) {
      if (
        guia.producto.tipo === "Aserrable" &&
        guia.producto.clases_diametricas
      ) {
        guia.volumen_total_emitido = guia.producto.clases_diametricas?.reduce(
          (acc, claseDiametrica) =>
            acc + (claseDiametrica.volumen_emitido || 0),
          0,
        );
      } else {
        guia.volumen_total_emitido = calculateBancosPulpableVolumen(
          guia.producto,
          bancosPulpable,
        );
      }
      guia.volumen_total_emitido = parseFloat(
        guia.volumen_total_emitido.toFixed(4),
      );
      guia.precio_unitario_guia = precioUnitarioGuia;
      guia.monto_total_guia = Math.trunc(
        precioUnitarioGuia * guia.volumen_total_emitido,
      );

      console.log(guia);

      const guiaDate = await createGuiaDoc(user.empresa_id, guia); // Not sure if this is actually waiting for the function to finish

      const CAF_step = 50;

      const CAF =
        user.cafs[Math.floor((guia.identificacion.folio - 1) / CAF_step)];

      // We have to add the 'as string' because in case of error createGuiaDoc returns nothing
      await generatePDF(guia, guiaDate as string, CAF);

      // // // Remove the folio from the list of folios_reserved
      const newFoliosReserved = user.folios_reservados.filter(
        (folio) => folio !== guia.identificacion.folio,
      );
      // // Update the user's folios locally popping the one just used
      await updateUserReservedFolios(newFoliosReserved);
    }
    setCreateGuiaLoading(false);
    setModalVisible(false);
    navigation.push("Home");
  } catch (e) {
    console.log(e);
    console.log(guia);
    setCreateGuiaLoading(false);
    Alert.alert("Error", "No se pudo crear la guia de despacho");
  }
};

export const generatePDF = async (
  guia: GuiaDespachoFirestore,
  guiaDate: string,
  CAF: string,
) => {
  try {
    // get TED
    const TED = await getTED(CAF, guia);
    console.log("TED GENERADO");

    // Generate the barcode
    const barcode = await BwipJs.toDataURL({
      bcid: "pdf417",
      text: TED,
    });

    console.log("barcode GENERADO");

    // Prepare the HTML content for the PDF with the barcode
    const html = await createPDFHTMLString(guia, guiaDate, barcode);

    console.log("html GENERADO");

    // Generate the PDF using Expo's print module
    const { uri } = await Print.printToFileAsync({ html: html });

    // // Move the PDF file to a permanent location using Expo's file system module
    const permanentUri = `${FileSystem.documentDirectory}GuiaFolio${guia.identificacion.folio}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: permanentUri });
    await shareAsync(permanentUri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
    });
    // Usar https://docs.expo.dev/versions/v49.0.0/sdk/document-picker/ para poder visualizar y compartir el PDF
    console.log("PDF file generated:", permanentUri);
  } catch (error) {
    console.error("Error generating PDF:", error);
    Alert.alert("Error", "Error al crear PDF");
  }
};

const calculateBancosPulpableVolumen = (
  producto: Producto,
  bancosPulpable: Banco[],
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
    (volumenTotal * producto.largo).toFixed(4),
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
    banco.ancho = 250;
  }
  return initialStatesProducto.bancos_pulpable;
};

export const parseProductosFromContratos = (
  contratosCompra: ContratoCompra[],
  contratosVenta: ContratoVenta[],
  guia: GuiaDespachoFirestore,
): {
  contratoVenta: ContratoVenta | undefined;
  productosOptions: ProductoOptionObject[];
} => {
  function _parseProductosOptions(
    productosContratoCompra: ProductoContratoCompra[],
    productosContratoVenta: ProductoContratoVenta[],
  ) {
    return productosContratoCompra
      ?.map((productoContratoCompra) => {
        // Find the same product in the contratoVenta
        const productoContratoVenta = productosContratoVenta?.find(
          (p) => p.codigo === productoContratoCompra.codigo,
        );

        // If the producto is not in both contratos, do not include it
        if (!productoContratoVenta) return null;

        // If the producto is aserrable combine the prices for each clase diametrica
        if (
          productoContratoCompra.tipo === "Aserrable" &&
          productoContratoCompra.clases_diametricas &&
          productoContratoVenta.clases_diametricas
        ) {
          // Get new clases diametricas with the combined prices
          const newClasesDiametricas: ClaseDiametricaContratos[] =
            productoContratoCompra.clases_diametricas.map(
              (claseDiametricaContratoCompra) => {
                const claseDiametricaContratoVenta =
                  productoContratoVenta.clases_diametricas?.find(
                    (claseDiametricaContratoVenta) =>
                      claseDiametricaContratoVenta.clase ===
                      claseDiametricaContratoCompra.clase,
                  ) as ClaseDiametricaContratoVenta;

                const newClase: ClaseDiametricaContratos = {
                  clase: claseDiametricaContratoCompra.clase,
                  precio_unitario_compra_clase:
                    claseDiametricaContratoCompra.precio_unitario_compra_clase,
                  precio_unitario_venta_clase:
                    claseDiametricaContratoVenta.precio_unitario_venta_clase,
                };

                return newClase;
              },
            );

          const newProductoAserrable: ProductoOptionObject = {
            codigo: productoContratoCompra.codigo,
            tipo: productoContratoCompra.tipo,
            especie: productoContratoCompra.especie,
            calidad: productoContratoCompra.calidad,
            largo: productoContratoCompra.largo,
            unidad: productoContratoCompra.unidad,
            clases_diametricas: newClasesDiametricas,
          };

          return newProductoAserrable;
        } else {
          const newProductoPulpable: ProductoOptionObject = {
            codigo: productoContratoCompra.codigo,
            tipo: productoContratoCompra.tipo,
            especie: productoContratoCompra.especie,
            calidad: productoContratoCompra.calidad,
            largo: productoContratoCompra.largo,
            unidad: productoContratoCompra.unidad,
            precio_unitario_compra_mr:
              productoContratoCompra.precio_unitario_compra_mr,
            precio_unitario_venta_mr:
              productoContratoVenta.precio_unitario_venta_mr,
          };

          return newProductoPulpable;
        }
      })
      .filter((producto) => producto !== null);
  }

  const productosContratoCompra = contratosCompra
    .find((contrato) => contrato.firestoreID === guia.contrato_compra_id)
    ?.clientes.find((cliente) => cliente.rut === guia.receptor.rut)
    ?.destinos_contrato.find(
      (destino) => destino.nombre === guia.destino.nombre,
    )?.productos;

  // Find contratoVenta with the same cliente, faena and destino
  const contratoVenta = contratosVenta.find(
    (contrato) =>
      contrato.cliente.rut === guia.receptor.rut &&
      contrato.cliente.destinos_contrato.some(
        (destino) =>
          destino.nombre === guia.destino.nombre &&
          destino.faenas.some((faena) => faena.rol === guia.predio_origen.rol),
      ),
  );

  const productosContratoVenta = contratoVenta?.cliente.destinos_contrato
    .find((destino) => destino.nombre === guia.destino.nombre)
    ?.faenas.find(
      (faena) => faena.rol === guia.predio_origen.rol,
    )?.productos_destino_contrato;

  if (!productosContratoCompra || !productosContratoVenta)
    return {
      contratoVenta: undefined,
      productosOptions: [],
    };

  // Get the products that are in both contratos and combine their prices
  const productosOptions = _parseProductosOptions(
    productosContratoCompra,
    productosContratoVenta,
  );

  return {
    contratoVenta: contratoVenta,
    productosOptions: productosOptions,
  };
};
