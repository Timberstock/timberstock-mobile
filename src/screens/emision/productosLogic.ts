import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
// import { shareAsync } from "expo-sharing";
// import "react-zlib-js"; // side effects only
import { toDataURL } from "@bwip-js/react-native";
// import bwipjs from "@bwip-js/react-native";

import getTED from "@/functions/pdf/timbre";
import {
  ClaseDiametricaGuia,
  GuiaDespachoFirestore,
  ProductoGuia,
} from "@/interfaces/firestore/guia";
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
import { CAF, Usuario } from "@/interfaces/context/user";
import { Alert, Platform } from "react-native";
import {
  createGuiaDoc,
  updateGuiaDocWithErrorMsg,
} from "@/functions/firebase/firestore/guias";
import { createPDFHTMLString } from "@/functions/pdf/html";
import {
  ContratoCompra,
  ProductoContratoCompra,
} from "@/interfaces/contratos/contratoCompra";

import * as Updates from "expo-updates";
import { Empresa } from "@/interfaces/context/app";
import { utils } from "@react-native-firebase/app";

const LOG_PREFIX = "ProductosLogic";
const log = {
  info: (functionName: string, message: string, ...args: any[]) =>
    console.log(`[${LOG_PREFIX}-${functionName}] ${message}`, ...args),
  error: (functionName: string, message: string, error?: any) =>
    console.error(`[${LOG_PREFIX}-${functionName}] ${message}`, error || ""),
  debug: (functionName: string, message: string, ...args: any[]) =>
    console.debug(`[${LOG_PREFIX}-${functionName}] ${message}`, ...args),
};

let currentSharePromise: Promise<void> | null = null;

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
  empresa: Empresa,
  guia: GuiaDespachoFirestore,
  bancosPulpable: Banco[],
  setCreateGuiaLoading: (loading: boolean) => void,
  setModalVisible: (visible: boolean) => void,
  updateUserReservedFolios: (
    newReservedFolios: number[],
    newCafs?: CAF[],
  ) => Promise<void>,
) => {
  try {
    log.info("handleCreateGuiaLogic", "Starting guia creation process");
    setCreateGuiaLoading(true);

    if (!user || !user.firebaseAuth || !user.empresa_id) {
      throw new Error("Usuario no autenticado");
    }

    if (
      guia.producto.tipo === "Aserrable" &&
      guia.producto.clases_diametricas
    ) {
      guia.volumen_total_emitido = guia.producto.clases_diametricas?.reduce(
        (acc, claseDiametrica) => acc + (claseDiametrica.volumen_emitido || 0),
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

    // Look for the CAF in the user's CAFs
    const CAF = user.cafs.find(
      (caf) =>
        caf.D <= guia.identificacion.folio &&
        caf.H >= guia.identificacion.folio,
    );

    if (!CAF) {
      log.error(
        "handleCreateGuiaLogic",
        "CAF not found for folio:",
        guia.identificacion.folio,
      );
      Alert.alert("Error", "No se pudo encontrar el CAF");
      return;
    }

    log.debug(
      "handleCreateGuiaLogic",
      "Found matching CAF, proceeding with guia creation",
    );

    guia._caf_id = CAF.id;

    guia.usuario_metadata = {
      usuario_id: user.firebaseAuth?.uid || "usuario_id_no_encontrado",
      usuario_email: user.email || "usuario_email_no_encontrado",
      version_app: Updates.createdAt
        ? `${Updates.createdAt?.getUTCDate()}/${Updates.createdAt?.getUTCMonth() + 1}/${Updates.createdAt?.getUTCFullYear()}`
        : "07/01/2025",
      len_folios_reservados: user.folios_reservados.length || 0,
      len_cafs: user.cafs.length || 0,
    };

    // Create the guia doc in firebase
    const guiaDate = await createGuiaDoc(user.empresa_id, guia);
    log.debug("handleCreateGuiaLogic", "Guia document created in Firebase");

    // We have to add the 'as string' because in case of error createGuiaDoc returns nothing
    await generatePDF(
      guia,
      guiaDate as string,
      CAF?.text as string,
      empresa,
      user,
    );
    log.debug("handleCreateGuiaLogic", "PDF generated and shared");

    // Remove the folio from the list of folios_reserved
    const newFoliosReserved = user.folios_reservados.filter(
      (folio) => folio !== guia.identificacion.folio,
    );

    // Update the user's folios locally popping the one just used
    await updateUserReservedFolios(newFoliosReserved);
    log.debug("handleCreateGuiaLogic", "User folios updated");

    setModalVisible(false);
    setCreateGuiaLoading(false);
    log.info(
      "handleCreateGuiaLogic",
      `Guia creation completed successfully. Folio: ${guia.identificacion.folio}`,
    );
    navigation.push("Home");
  } catch (error) {
    log.error("handleCreateGuiaLogic", "Failed to create guia:", error);
    log.debug("handleCreateGuiaLogic", "Guia data at failure:", guia);
    await updateGuiaDocWithErrorMsg(
      user?.empresa_id || "",
      guia.identificacion.folio,
      (error as Error).message || "error.message no encontrado",
      "_error_createGuia",
    );
    setCreateGuiaLoading(false);
    Alert.alert("Error", "No se pudo crear la guia de despacho");
  }
};

export const generatePDF = async (
  guia: GuiaDespachoFirestore,
  guiaDate: string,
  CAF: string,
  empresa: Empresa,
  user: Usuario | null,
) => {
  try {
    log.info(
      "generatePDF",
      `Starting PDF generation for folio ${guia.identificacion.folio}`,
    );
    // await waitForPreviousShare();

    const TED = await getTED(CAF, guia);
    log.debug("generatePDF", "TED generated");

    const barcode = await toDataURL({
      bcid: "pdf417",
      text: TED,
    });
    log.debug("generatePDF", "Barcode generated");

    const html = await createPDFHTMLString(empresa, guia, guiaDate, barcode);
    log.debug("generatePDF", "HTML string to print on PDF generated");

    const tempURI = (await Print.printToFileAsync({ html: html })).uri;

    log.debug("generatePDF", "Temporary PDF created at:", tempURI);

    // If we are on android, we need don't need to add / to the documentDirectory
    const documentDirectory =
      Platform.OS === "android"
        ? FileSystem.documentDirectory
        : `${FileSystem.documentDirectory}/`;
    const permanentUri = `${documentDirectory}${user?.empresa_id}/GD_${guia.identificacion.folio}.pdf`;
    await FileSystem.moveAsync({ from: tempURI, to: permanentUri });
    log.debug(
      "generatePDF",
      "PDF moved to permanent (app only) location:",
      permanentUri,
    );

    // PDF creado correctamente
    Alert.alert(
      `PDF creado correctamente para Guía con folio: ${guia.identificacion.folio}`,
      `Para compartirla o guardarla en Documentos, presione el botón de PDF de la guía respectiva en la pantalla de guías.`,
    );

    // log.info("generatePDF", "Initiating PDF share...");
    // currentSharePromise = shareAsync(permanentUri, {
    //   UTI: ".pdf",
    //   mimeType: "application/pdf",
    // }).finally(() => {
    //   log.debug("generatePDF", "Share operation completed");
    //   currentSharePromise = null;
    // });

    // await currentSharePromise;
    // log.info("generatePDF", "PDF shared successfully");
    // currentSharePromise = null;
    // Usar https://docs.expo.dev/versions/v49.0.0/sdk/document-picker/ para poder visualizar y compartir el PDF
  } catch (error) {
    log.error("generatePDF", "PDF generation failed:", error);
    await updateGuiaDocWithErrorMsg(
      guia.emisor.rut.replace(/-/g, ""),
      guia.identificacion.folio,
      (error as Error).message || "error.message no encontrado",
      "_error_generatePDF",
    );
    Alert.alert("Error", "Error al crear PDF");
  }
};

// const waitForPreviousShare = async () => {
//   if (!currentSharePromise) return;

//   try {
//     log.debug(
//       "waitForPreviousShare",
//       "Previous share operation detected, waiting...",
//     );
//     await Promise.race([
//       currentSharePromise,
//       new Promise((_, reject) =>
//         setTimeout(() => reject(new Error("Share timeout")), 5000),
//       ),
//     ]);
//     log.debug("waitForPreviousShare", "Previous share operation completed");
//   } catch (e) {
//     log.error(
//       "waitForPreviousShare",
//       "Previous share operation failed or timed out:",
//       e,
//     );
//   }
//   currentSharePromise = null;
// };

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

  if (!productosContratoCompra || !productosContratoVenta) {
    return {
      contratoVenta: undefined,
      productosOptions: [],
    };
  }

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
