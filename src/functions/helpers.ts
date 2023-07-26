import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { GuiaDespachoSummaryProps } from '../interfaces/guias';
import { PreGuia } from '../interfaces/firestore';
import { DetallesPDF } from '../interfaces/detalles';

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

const getFoliosDisp = (guias: GuiaDespachoSummaryProps[], caf_n: number) => {
  const folios: number[] = [];
  const foliosNoDisp: number[] = [];

  // Primero agregamos todos los folios que ya estan bloqueados
  // a la lista de folios no disponibles
  try {
    guias.map((guia) => {
      if (
        guia.estado === 'aceptada' ||
        guia.estado === 'emitida' ||
        guia.estado === 'pendiente' ||
        guia.estado === 'sin conexion'
      )
        foliosNoDisp.push(guia.folio);
    });
    // Luego agregamos todos los folios que esten disponibles desde el 1
    // hasta el maximo folio posible, segun el numero de CAFs solicitados
    // en la empresa.
    // TODO: probablemente sea un numero mayor a 5, actualizar cuando se decida.
    const max_folio_posible = caf_n * 5;
    for (let i = 1; i <= max_folio_posible; i++) {
      if (!foliosNoDisp.includes(i)) folios.push(i);
    }
    return folios;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const createPDFHTMLString = (DTE: PreGuia, guiaDate: string) => {
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

    const productosAsPTags = _productosToTags(detallesList.slice(8));

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
          <p class="s2">${/* representative */ detallesList[0].cantidad}</p>
          ${`<p class="s2">.</p>`.repeat(7) /* skip some spaces */}
          ${productosAsPTags.cantidades}
        </td>
        <td class="cellwithborders">
          <p class="s2">
            ${
              /* We can do it like this since each GUIA has same unit for all products */
              detallesList[8].nombre.includes('Metro Ruma') ? 'MR' : 'M3'
            }
          </p>
        </td>
        <td class="cellwithborders">
          <p class="s2">${/* representative */ detallesList[0].precio}</p>
        </td>
        <td class="cellwithborders">
          <p class="s2">
            ${detallesList[8].nombre.includes('Metro Ruma') ? 'P' : 'AF'}
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
    _stringToProducto(`[Predio] Manzana: ${DTE.predio.manzana}`),
    _stringToProducto(`[Predio] Rol: ${DTE.predio.rol}`),
    _stringToProducto(`[Predio] Nombre: ${DTE.predio.nombre}`),
    _stringToProducto(`[Predio] Comuna: ${DTE.predio.comuna}`),
    _stringToProducto(
      `[Predio] GEO: (${DTE.predio.georreferencia.latitude},${DTE.predio.georreferencia.longitude})`
    ),
    _stringToProducto(`[Predio] Plan de Manejo: ${DTE.predio.plan_de_manejo}`),
    _stringToProducto(
      DTE.predio.certificado
        ? `[Predio] Certificado: ${DTE.predio.certificado}`
        : ' '
    ),
  ];
  const productosDetalles = [];
  let volumenTotal = 0;
  for (const producto of DTE.productos) {
    const nombreProducto = `${producto.especie}-${producto.tipo}-${producto.calidad}-${producto.largo}-${producto.claseDiametrica}`;
    volumenTotal += producto.volumen ? producto.volumen : 0;
    productosDetalles.push(_stringToProducto(nombreProducto, producto.volumen));
  }

  // TODO: NOT SURE ABOUT THIS APPROACH, MUST BE FIXED ASAP
  const productoTotalDetalle = {
    nombre: `Productos Total (ref): ${DTE.total}`,
    cantidad: volumenTotal,
    precio: DTE.precio_ref,
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
    IVA: 0.19 * Math.floor(DTE.total),
    Total: DTE.total + 0.19 * Math.floor(DTE.total),
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

  const htmlBody = `
    <body>
      ${empresaInfo}
      ${identificacionAndDespacho}
      ${detalles}
      ${totales}
      <p><br /></p>
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
  fromFirebaseDateToJSDate,
  daysSinceFirestoreTimestamp,
  formatDate,
  getFoliosDisp,
  createPDFHTMLString,
};

export default customHelpers;
