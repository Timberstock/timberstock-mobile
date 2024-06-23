import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { PreGuia, ProductoDetalle } from '../interfaces/firestore';
import { DetallesPDF } from '../interfaces/detalles';
import { BancosPulpable, clasesDiametricas } from '../interfaces/productos';

const buildAserrableProductsArray = (
  actualProduct: ProductoDetalle,
  clasesDiametricas: clasesDiametricas
): ProductoDetalle[] => {
  // For each claseDiametrica that has a value, create a new product with the same values as the original product and add it to the array with the claseDiametrica as a property
  const aserrableProducts = [];
  const diametros = Object.keys(clasesDiametricas);
  for (const diametro of diametros) {
    if (clasesDiametricas[diametro] === 0) continue;
    const cantidad = clasesDiametricas[diametro];
    const aserrableProduct = {
      ...actualProduct,
      unidad: 'm3',
      claseDiametrica: diametro,
      cantidad: cantidad,
      volumen:
        cantidad *
        actualProduct.largo *
        Math.PI *
        (parseFloat(diametro) / (2 * 100)) ** 2, // pasamos diametro de centimetros a metros,
    };
    aserrableProducts.push(aserrableProduct);
  }
  return aserrableProducts;
};

const buildPulpableProductArray = (
  actualProduct: ProductoDetalle,
  bancosPulpable: BancosPulpable
): ProductoDetalle[] => {
  const bancos = Object.entries(bancosPulpable);

  // calculate total volumen
  let volumenTotal = 0;
  for (const [key, banco] of bancos) {
    const { altura1, altura2, ancho } = banco;
    const volumen = ((altura1 * 0.01 + altura2 * 0.01) * ancho * 0.01) / 2; // pasamos de centimetros a metros
    volumenTotal += volumen;
  }
  // TODO: largo is not considered here?
  return [
    {
      ...actualProduct,
      unidad: 'mr',
      // TODO: dividir por 2.44 [estandarizar por largo]
      volumen: volumenTotal * actualProduct.largo,
    },
  ];
};

const fromFirebaseDateToJSDate = (firebaseDate: any) => {
  const date = new Date(
    firebaseDate.seconds * 1000 + firebaseDate.nanoseconds / 1000000
  );
  return date;
};

const daysSinceFirestoreTimestamp = (
  timestamp: FirebaseFirestoreTypes.Timestamp
): number => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const timestampDate = timestamp.toDate();
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - timestampDate.getTime();
  const daysDiff = Math.round(timeDiff / millisecondsPerDay);
  return daysDiff;
};

const formatDate = (date: Date) => {
  // From Date to string
  function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }
  return `${[
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/')} ${[
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':')}`;
};

const createPDFHTMLString = async (
  DTE: PreGuia,
  guiaDate: string,
  barcode: { uri: string; width: number; height: number }
) => {
  const _detallesToDescripcionTable = (detallesList: DetallesPDF[]) => {
    const _productosToTags = (productosList: DetallesPDF[]) => {
      // returns object of strings composed of concatenated <p> tags with the product names, quantities and prices
      const HTMLStringsObject = {
        nombres: '',
        cantidades: '',
        precios: '',
      };
      productosList.forEach((producto) => {
        HTMLStringsObject.nombres += `
          <p class="s2">${producto.nombre}</p>
        `;
        HTMLStringsObject.cantidades += `
          <p class="s2">${producto.cantidad.toFixed(4)}</p>
        `;
        // Price is not used since it does not appear in the examples provided to us
        HTMLStringsObject.precios += `
          <p class="s2">${producto.precio}</p>
        `;
      });
      return HTMLStringsObject;
    };

    const productosAsPTags = _productosToTags(detallesList.slice(7));

    let detallesListTableContentString = `
    <table style="border-collapse: collapse; width: 650px" cellspacing="0">
      <tr>
        <td class="cellwithborders" colspan="6">
          <p class="s1" style="text-align: center">DETALLES</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1" style="text-align: center">Descripción</p>
        </td>
        <td class="cellwithborders">
          <p class="s1" style="text-align: center">Cantidad</p>
        </td>
        <td class="cellwithborders">
          <p class="s1" style="text-align: center">Unid</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">Precio Unitario</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">Ind</p>
        </td>
        <td class="cellwithborders">
          <p class="s1" style="text-align: center">Total</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s2"> ${/* Repr */ detallesList[0].nombre}</p>
          <p class="s2">.</p>
          <p class="s2">${/* [Predio] 1st part */ detallesList[1].nombre}</p>
          <p class="s2">${/* [Predio] 2nd part */ detallesList[2].nombre}</p>
          <p class="s2">${/* [Predio] 3rd part */ detallesList[3].nombre}</p>
          <p class="s2">${/* [Predio] 4th part */ detallesList[4].nombre}</p>
          <p class="s2">${/* [Predio] 5th part */ detallesList[5].nombre}</p>
          <p class="s2">${/* [Predio] 6th part */ detallesList[6].nombre}</p>
          ${productosAsPTags.nombres}
        </td>
        <td class="cellwithborders">
          <p class="s2">${
            /* representative */ detallesList[0].cantidad.toFixed(4)
          }</p>
          ${`<p class="s2">.</p>`.repeat(7) /* Skip Predio parts */} 
          ${productosAsPTags.cantidades}
        </td>
        <td class="cellwithborders">
          <p class="s2">
            ${
              /* We can do it like this since each GUIA has same unit for all products */
              detallesList[7].nombre.includes('Metro Ruma') ? 'MR' : 'M3'
            }
          </p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${/* representative */ detallesList[0].precio}</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">
            ${detallesList[7].nombre.includes('Metro Ruma') ? 'P' : 'AF'}
          </p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${/* representative */ detallesList[0].montoItem}</p>
        </td>
      </tr>
    </table>
    `;
    return detallesListTableContentString;
  };

  // Get products details that correspond to the detailsList after the [Predio] info
  const _stringToProducto = (repr: string, cantidad: number = 0) => {
    const producto = {
      nombre: repr,
      cantidad: cantidad,
    };
    return producto;
  };

  const htmlHead = `
    <head>
      <meta charset="UTF-8" />
      <title>Guía de Despacho ${DTE.identificacion.folio} ${DTE.emisor.razon_social}</title>
      <style type="text/css">
      * {
        margin: 0;
        padding: 0;
        text-indent: 0;
      }
      .s1 {
        font-family: Arial, sans-serif;
        font-style: normal;
        font-weight: bold;
        text-decoration: none;
        font-size: 8pt;
        color: black;
        padding-top: 1pt;
        padding-left: 1pt;
        text-indent: 0pt;
        line-height: 9pt;
        text-align: left;
        background-color: #d3ccd3;
      }
      .s2 {
        font-family: 'Courier New', monospace;
        font-style: normal;
        font-weight: normal;
        text-decoration: none;
        font-size: 8pt;
        color: black;
        padding-top: 1pt;
        padding-left: 1pt;
        text-indent: 0pt;
        line-height: 9pt;
        text-align: left;
      }
      table,
      tbody {
        vertical-align: top;
        overflow: visible;
      }
      .cellwithborders {
        border-top-style: solid;
        border-top-width: 1pt;
        border-top-color: #b3b3b3;
        border-right-style: solid;
        border-right-width: 1pt;
        border-right-color: #b3b3b3;
        border-bottom-style: solid;
        border-bottom-width: 1pt;
        border-bottom-color: #b3b3b3;
        border-left-style: solid;
        border-left-width: 1pt;
        border-left-color: #b3b3b3;
      }
      .emisor {
        font-family: 'Arial Arabic', sans-serif;
        font-weight: bold;
        font-size: 11px;
      }
      </style>
    </head>
  `;

  const empresaInfo = `
  <table style="width: 650px; height: 100px; border-collapse: collapse">
    <tr>
      <td style=" width: calc(650px / 3); text-align: center; vertical-align: middle;">
        <img src="placeholder.png" alt="logo" />
      </td>
      <td style="width: calc(650px / 3);text-align: center;vertical-align: middle;">
        <p class="emisor">${DTE.emisor.razon_social}</p>
        <p class="emisor">${DTE.emisor.giro}</p>
        <p class="emisor">${DTE.emisor.direccion}</p>
        <p class="emisor">${DTE.emisor.comuna}</p>
      </td>
      <td style=" width: calc(650px / 3); text-align: center; vertical-align: middle;">
        <div style=" display: inline-block; border: 2px solid red; padding: 10px; text-align: center;">
          <p class="emisor">RUT ${DTE.emisor.rut}</p>
          <p class="emisor">GUIA DE DESPACHO ELECTRÓNICA</p>
          <p class="emisor">N° ${DTE.identificacion.folio}</p>
        </div>
      </td>
    </tr>
  </table>
  <p><br /></p>
  `;

  const identificacionAndDespacho = `
    <table style="border-collapse: collapse; width: 650px" cellspacing="0">
      <tr>
        <td class="cellwithborders">
          <p class="s1">Señor(es)</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.receptor.razon_social}</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">RUT</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.receptor.rut}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Giro</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.receptor.giro}</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">Fecha Emisión</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${guiaDate.split('T')[0]}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Dirección</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.receptor.direccion}</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">Comuna</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.receptor.comuna}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Tipo de Despacho</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.identificacion.tipo_despacho}</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">Tipo de Traslado</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.identificacion.tipo_traslado}</p>
        </td>
      </tr>
    </table>
    <p><br /></p>
    <table style="border-collapse: collapse; width: 650px" cellspacing="0">
      <tr>
        <td class="cellwithborders" colspan="4">
          <p class="s1" style="text-align: center">DATOS DE DESPACHO</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Chofer</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.transporte.chofer.nombre}</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">RUT Chofer</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.transporte.chofer.rut}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Patente</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.transporte.patente}</p>
        </td>
        <td class="cellwithborders">
          <p class="s1">RUT Transportista</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${DTE.transporte.rut_transportista}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Dirección</p>
        </td>
        <td class="cellwithborders" colspan="3">
          <p class="s2">${DTE.transporte.direccion_destino}</p>
        </td>
      </tr>
    </table>
    <p><br /></p>
  `;

  const predioDetalles = [
    _stringToProducto(`Rol: ${DTE.predio.rol}`),
    _stringToProducto(`Nombre: ${DTE.predio.nombre}`),
    _stringToProducto(`Comuna: ${DTE.predio.comuna}`),
    _stringToProducto(
      `(${DTE.predio.georreferencia.latitude},${DTE.predio.georreferencia.longitude})`
    ),
    _stringToProducto(
      `Plan de Manejo o Uso Suelo: ${DTE.predio.plan_de_manejo}`
    ),
    _stringToProducto(`${DTE.predio.certificado}`),
  ];
  const productosDetalles = [];
  let volumenTotal = 0;
  for (const producto of DTE.productos) {
    const nombreProducto =
      producto.tipo === 'Aserrable'
        ? `${producto.especie}-${producto.tipo}-${producto.calidad}-${producto.largo}-${producto.claseDiametrica}: ${producto.cantidad}`
        : `${producto.especie}-${producto.tipo}-${producto.calidad}-${producto.largo}`;
    volumenTotal += producto.volumen ? producto.volumen : 0;
    productosDetalles.push(_stringToProducto(nombreProducto, producto.volumen));
  }

  // TODO: NOT SURE ABOUT THIS APPROACH, MUST BE FIXED ASAP
  const productoTotalDetalle = {
    nombre: `Total: ${DTE.total}`,
    cantidad: DTE.volumen_total,
    precio: DTE.precio,
    montoItem: DTE.total,
  };

  const detallesList = [
    productoTotalDetalle,
    ...predioDetalles,
    ...productosDetalles,
  ];

  const detalles = _detallesToDescripcionTable(detallesList);

  const Totales = {
    MontoNeto: DTE.total,
    IVA: Math.floor(0.19 * DTE.total),
    Total:
      parseInt(DTE.total.toString()) +
      parseInt(Math.floor(0.19 * DTE.total).toString()),
  };

  const totales = `
    <p><br /></p>
    <table style="width: 250px; border-collapse: collapse">
      <tr>
        <td class="cellwithborders" colspan="2">
          <p class="s1" style="text-align: center">TOTALES</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Monto Neto</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${Totales.MontoNeto}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">19% IVA</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${Totales.IVA}</p>
        </td>
      </tr>
      <tr>
        <td class="cellwithborders">
          <p class="s1">Total</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${Totales.Total}</p>
        </td>
      </tr>
    </table>
  `;

  // change pdf417 for its recommended size if it can't be read easily from device '<img src="${barcode.uri}" style="width: ${barcode.width}px; height: ${barcode.height}px" />'
  const htmlBody = `
    <body>
      ${empresaInfo}
      ${identificacionAndDespacho}
      ${detalles}
      ${totales}
      <p><br /></p>
      <div style="text-align: center; style="position: absolute; left: 187.5px">
      '<img src="${barcode.uri}" style="width: 275px; height: 132px" />'
      </div>
    </body>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      ${htmlHead}
      ${htmlBody}
    </html>
  `;
  return html;
};

const customHelpers = {
  buildAserrableProductsArray,
  buildPulpableProductArray,
  fromFirebaseDateToJSDate,
  daysSinceFirestoreTimestamp,
  formatDate,
  createPDFHTMLString,
};

export default customHelpers;
