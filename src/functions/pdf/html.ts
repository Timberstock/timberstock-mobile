import { DetallePDF } from "@/interfaces/sii/detalles";
import { GuiaDespachoFirestore } from "@/interfaces/firestore/guia";
import { Empresa } from "@/interfaces/context/app";

export const createPDFHTMLString = async (
  empresa: Empresa,
  guia: GuiaDespachoFirestore,
  guiaDate: string,
  barcode: { uri: string; width: number; height: number },
) => {
  const htmlHead = `
  <head>
    <meta charset="UTF-8" />
    <title>Guía de Despacho ${guia.identificacion.folio} ${guia.emisor.razon_social}</title>
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
    .centered {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-direction: column;
      margin-top: 20px;
      padding-right: 20px;
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
      <p class="emisor">${guia.emisor.razon_social}</p>
      <p class="emisor">${guia.emisor.giro}</p>
      <p class="emisor">${guia.emisor.direccion}</p>
      <p class="emisor">${guia.emisor.comuna}</p>
    </td>
    <td style=" width: calc(650px / 3); text-align: center; vertical-align: middle;">
      <div style=" display: inline-block; border: 2px solid red; padding: 10px; text-align: center;">
        <p class="emisor">RUT ${guia.emisor.rut}</p>
        <p class="emisor">GUIA DE DESPACHO ELECTRÓNICA</p>
        <p class="emisor">N° ${guia.identificacion.folio}</p>
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
        <p class="s2">${guia.receptor.razon_social}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">RUT</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.receptor.rut}</p>
      </td>
    </tr>
    <tr>
      <td class="cellwithborders">
        <p class="s1">Giro</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.receptor.giro}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">Fecha Emisión</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guiaDate.split("T")[0]}</p>
      </td>
    </tr>
    <tr>
      <td class="cellwithborders">
        <p class="s1">Dirección</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.receptor.direccion}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">Comuna</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.receptor.comuna}</p>
      </td>
    </tr>
    <tr>
      <td class="cellwithborders">
        <p class="s1">Tipo de Despacho</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.identificacion.tipo_despacho}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">Tipo de Traslado</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.identificacion.tipo_traslado}</p>
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
        <p class="s2">${guia.transporte.chofer.nombre}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">RUT Chofer</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.transporte.chofer.rut}</p>
      </td>
    </tr>
    <tr>
      <td class="cellwithborders">
        <p class="s1">Patente</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.transporte.camion.patente}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">RUT Transportista</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.transporte.empresa.rut}</p>
      </td>
    </tr>
  </table>
  <p><br /></p>
  <table style="border-collapse: collapse; width: 650px" cellspacing="0">
    <tr>
      <td class="cellwithborders" colspan="4">
        <p class="s1" style="text-align: center">DATOS DEL DESTINO</p>
      </td>
    </tr>
    <tr>
      <td class="cellwithborders">
        <p class="s1">Nombre Destino</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.destino.nombre}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">Rol</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.destino.rol}</p>
      </td>
    </tr>
    <tr>
      <td class="cellwithborders">
        <p class="s1">Comuna</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">${guia.destino.comuna}</p>
      </td>
      <td class="cellwithborders">
        <p class="s1">Georreferencia</p>
      </td>
      <td class="cellwithborders">
        <p class="s2">(${guia.destino.georreferencia.latitude},${guia.destino.georreferencia.longitude})</p>
      </td>
    </tr>
    <tr>
  </table>
  <p><br /></p>
`;

  const productoAsDetalle: DetallePDF = {
    nombre: `${guia.producto.tipo} ${guia.producto.especie} ${guia.producto.calidad} ${guia.producto.largo}`,
    cantidad: guia.volumen_total_emitido,
    precio: guia.precio_unitario_guia,
    montoItem: guia.monto_total_guia,
  };

  const codigoFSCAsDetalle: DetallePDF = {
    nombre: guia.codigo_fsc ? `Codigo FSC: ${guia.codigo_fsc}` : "",
  };

  const carroAsDetalle: DetallePDF = {
    nombre: `${guia.transporte.carro}`,
  };

  const predioAsDetalles: DetallePDF[] = [
    {
      nombre: `Rol: ${guia.predio_origen.rol}`,
    },
    { nombre: `Nombre: ${guia.predio_origen.nombre}` },
    { nombre: `Comuna: ${guia.predio_origen.comuna}` },
    {
      nombre: `(${guia.predio_origen.georreferencia.latitude},${guia.predio_origen.georreferencia.longitude})`,
    },
    {
      nombre: `Plan de Manejo o Uso Suelo: ${guia.predio_origen.plan_de_manejo}`,
    },
  ];

  const codigoContratoExternoAsDetalle: DetallePDF = {
    nombre: guia.codigo_contrato_externo
      ? `Codigo: ${guia.codigo_contrato_externo}`
      : "",
  };

  const observacionesAsDetalles: DetallePDF[] = [];
  if (guia.observaciones) {
    for (const observacion of guia.observaciones) {
      observacionesAsDetalles.push({
        nombre: observacion,
      });
    }
  }

  const clasesDiametricasAsDetalles: DetallePDF[] = [];
  if (guia.producto.tipo === "Aserrable" && guia.producto.clases_diametricas) {
    for (const claseDiametrica of guia.producto.clases_diametricas) {
      if (
        claseDiametrica.cantidad_emitida &&
        claseDiametrica.cantidad_emitida > 0
      ) {
        clasesDiametricasAsDetalles.push({
          nombre: `${claseDiametrica.clase}: ${claseDiametrica.cantidad_emitida} = ${parseFloat((claseDiametrica.volumen_emitido || 0).toFixed(4) || "0").toLocaleString("es-CL")}`,
          cantidad: claseDiametrica.volumen_emitido,
          // precio: guia.precio_unitario_guia,
          // montoItem: Math.floor(
          //   claseDiametrica.volumen * guia.precio_unitario_guia
          // ),
        });
      }
    }
  }

  const detallesTable = `
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
            <p class="s2"> ${/* Producto */ productoAsDetalle.nombre}</p>
            <p class="s2"><br></p>
            <p class="s2">${codigoFSCAsDetalle.nombre}</p>
            <p class="s2">Patente carro: ${/* Carro */ carroAsDetalle.nombre}</p>
            <p class="s2">${
              /* [Predio] 1st part */ predioAsDetalles[0].nombre
            }</p>
            <p class="s2">${
              /* [Predio] 2st part */ predioAsDetalles[1].nombre
            }</p>
            <p class="s2">${
              /* [Predio] 3rd part */ predioAsDetalles[2].nombre
            }</p>
            <p class="s2">${
              /* [Predio] 4th part */ predioAsDetalles[3].nombre
            }</p>
            <p class="s2">${
              /* [Predio] 5th part */ predioAsDetalles[4].nombre
            }</p>
            <p class="s2">${codigoContratoExternoAsDetalle.nombre}</p>
            ${observacionesAsDetalles
              .map((observacion) => `<p class="s2">${observacion.nombre}</p>`)
              .join("")}
            ${
              guia.producto.tipo === "Aserrable"
                ? '<p class="s2">Detalle trozos por clase:</p>'
                : ""
            }
            ${
              guia.producto.tipo === "Aserrable"
                ? clasesDiametricasAsDetalles
                    .map((clase) => `<p class="s2">${clase.nombre}</p>`)
                    .join("")
                : ""
            }
          </td>
          <td class="cellwithborders">
            <p class="s2">${/* representative */ parseFloat(productoAsDetalle.cantidad?.toFixed(4) || "0").toLocaleString("es-CL")}</p>
            ${/* Skip Predio parts + 2*/ '<p class="s2"><br></p>'.repeat(10)}
            ${
              /* Skip observaciones space*/
              observacionesAsDetalles
                .map(() => `<p class="s2"><br></p>`)
                .join("")
            }
            ${
              /* In case of Aserrable */
              clasesDiametricasAsDetalles
                .map(
                  // (clase) => `<p class="s2">${clase.cantidad}</p>`
                  () => `<p class="s2"><br></p>`,
                )
                .join("")
            }
          </td>
          <td class="cellwithborders">
            <p class="s2">${/* representative */ guia.producto.unidad}
            </p>
            ${/* Skip Predio parts + 2*/ '<p class="s2"><br></p>'.repeat(10)}
            ${
              /* Skip observaciones space*/
              observacionesAsDetalles
                .map(() => `<p class="s2"><br></p>`)
                .join("")
            }
            ${
              /* In case of Aserrable */
              clasesDiametricasAsDetalles
                .map(
                  // () => `<p class="s2">${guia.producto.unidad}</p>`
                  () => `<p class="s2"><br></p>`,
                )
                .join("")
            }
            </td>
            <td class="cellwithborders">
            <p class="s2">${/* representative */ productoAsDetalle.precio?.toLocaleString("es-CL")}</p>
            ${/* Skip Predio parts + 2*/ '<p class="s2"><br></p>'.repeat(10)}
            ${
              /* Skip observaciones space*/
              observacionesAsDetalles
                .map(() => `<p class="s2"><br></p>`)
                .join("")
            }
            ${
              /* In case of Aserrable */
              clasesDiametricasAsDetalles
                .map(
                  // () => `<p class="s2">${guia.precio_unitario_guia}</p>`
                  () => `<p class="s2"><br></p>`,
                )
                .join("")
            }
          </td>
          <td class="cellwithborders">
            <p class="s2">
              ${guia.producto.tipo === "Aserrable" ? "AF" : "P"}
            </p>
          </td>
          <td class="cellwithborders">
            <p class="s2">${/* representative */ productoAsDetalle.montoItem?.toLocaleString(
              "es-CL",
            )}</p>
            ${/* Skip Predio parts + 2*/ '<p class="s2"><br></p>'.repeat(10)}
            ${
              /* Skip observaciones space*/
              observacionesAsDetalles
                .map(() => `<p class="s2"><br></p>`)
                .join("")
            }
            ${
              /* In case of Aserrable */
              clasesDiametricasAsDetalles
                .map(
                  // (clase) => `<p class="s2">${clase.montoItem}</p>`
                  () => `<p class="s2"><br></p>`,
                )
                .join("")
            }
          </td>
        </tr>
      </table>
      `;

  const Totales = {
    MontoNeto: guia.monto_total_guia,
    IVA: Math.floor(0.19 * guia.monto_total_guia),
    Total:
      parseInt(guia.monto_total_guia.toString()) +
      parseInt(Math.floor(0.19 * guia.monto_total_guia).toString()),
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
      <div style="display: flex; flex-direction: column; align-items: center;">
        ${empresaInfo}
        ${identificacionAndDespacho}
        ${detallesTable}
        <div style="width: 100%; display: flex; justify-content: flex-end;">
          ${totales}
        </div>
        <p><br /></p>
        <div style="width: 100%; display: flex; justify-content: flex-end;">
          <div style="text-align: center; width: 275px;">
            <img src="${barcode.uri}" style="width: 275px; height: 132px" />
            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px;">Timbre Electrónico SII</p>
            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px;">
              Res. ${empresa.numero_resolucion_sii} de ${new Date(empresa.fecha_resolucion_sii.seconds * 1000).getFullYear()} - Verifique documento: www.sii.cl
            </p>
            <p style="margin: 0; font-family: Arial, sans-serif; font-weight: bold; font-size: 12px;">CEDIBLE CON SU FACTURA</p>
          </div>
        </div>
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
