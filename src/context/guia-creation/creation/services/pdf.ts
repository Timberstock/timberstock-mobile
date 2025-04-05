import { Empresa } from '@/context/app/types';
import { LocalFilesService } from '@/services/LocalFilesService';
import { toDataURL } from '@bwip-js/react-native';
import * as Print from 'expo-print';
import { Alert } from 'react-native';
import { GuiaDespachoIncomplete } from './creation';
import { TimbreService } from './timbre';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000; // 5 seconds timeout

export class PDFService {
  private static async printToFileWithTimeout(html: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('PDF generation timed out'));
      }, TIMEOUT_MS);

      Print.printToFileAsync({ html })
        .then(({ uri }) => {
          clearTimeout(timeoutId);
          resolve(uri);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private static async retryPrintToFile(
    html: string,
    onStatusChange?: (message: string) => void
  ): Promise<string> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          onStatusChange?.(`Intento ${attempt}/${MAX_RETRIES} de generar PDF...`);
        }
        const uri = await this.printToFileWithTimeout(html);
        return uri;
      } catch (error: any) {
        if (attempt === MAX_RETRIES) {
          throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
        }
        // Wait for a short time before retrying (increasing delay with each attempt)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
    throw new Error('Unexpected error in retry logic');
  }

  static async generatePDF(
    guiaDate: Date,
    guia: GuiaDespachoIncomplete,
    CAF: string,
    empresa: Empresa,
    onStatusChange?: (message: string) => void
  ) {
    try {
      onStatusChange?.('Cargando logo de empresa...');
      const logoBase64 = await LocalFilesService.getLogoFileBase64(empresa.id);

      onStatusChange?.('Generando timbre electrónico...');
      const TED = await TimbreService.getTED(CAF, guia);

      onStatusChange?.('Generando código de barras...');
      const barcode = await toDataURL({
        bcid: 'pdf417',
        text: TED,
      });

      onStatusChange?.('Preparando documento PDF...');
      const html = await PDFService.createPDFHTMLString(
        empresa,
        guia,
        guiaDate.toISOString(),
        barcode,
        logoBase64 || undefined
      );

      onStatusChange?.('Guardando PDF temporal...');
      const tempURI = await this.retryPrintToFile(html, onStatusChange);

      onStatusChange?.('PDF generado exitosamente');
      return tempURI;
    } catch (error) {
      Alert.alert('Error al crear PDF', (error as Error).message);
      throw error;
    }
  }

  static async generatePreviewPDF(
    empresa: Empresa,
    guia: GuiaDespachoIncomplete,
    date: string,
    onStatusChange?: (message: string) => void
  ): Promise<string> {
    try {
      onStatusChange?.('Cargando logo de empresa...');
      const logoBase64 = await LocalFilesService.getLogoFileBase64(empresa.id);

      onStatusChange?.('Preparando documento PDF...');
      const html = await this.createPDFHTMLString(
        empresa,
        guia,
        date,
        { uri: '', width: 0, height: 0 }, // Empty barcode for preview
        logoBase64 ?? undefined
      );

      onStatusChange?.('Guardando PDF temporal...');
      const tempURI = await this.retryPrintToFile(html, onStatusChange);

      onStatusChange?.('PDF generado exitosamente');
      return tempURI;
    } catch (error) {
      console.error('Error generating preview PDF:', error);
      throw error;
    }
  }

  static async createPDFHTMLString(
    empresa: Empresa,
    guia: GuiaDespachoIncomplete,
    guiaDate: string,
    barcode: { uri: string; width: number; height: number },
    logoBase64?: string
  ) {
    const htmlHead = `
  <head>
    <meta charset="UTF-8" />
    <title>Guía de Despacho ${guia.identificacion.folio} ${guia.emisor.razon_social}</title>
    <style type="text/css">
      * {
        margin: 0;
        padding: 0;
        text-indent: 0;
        -webkit-print-color-adjust: exact !important; /* Chrome, Safari */
        color-adjust: exact !important; /* Firefox */
        print-color-adjust: exact !important; /* Future standard */
      }
      .global-div {
        width: 740px;
        margin: 0 auto;
      }
      .table-logo-emisor-sii {
        height: 100px;
        border-collapse: collapse;
        border-style: hidden;
        table-layout: fixed;
      }
      .td-logo-emisor-sii {
        text-align: center;
        vertical-align: middle;
        border-style: hidden;
      }
      .div-sii {
        display: inline-block;
        border: 2px solid red;
        padding: 10px;
        text-align: center;
      }
      .p-emisor {
        font-family: "Arial Arabic", sans-serif;
        font-weight: bold;
        font-size: 11px;
      }
      table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
      }
      td {
        border: solid 1px #b3b3b3;
        border-style: none solid solid none;
      }
      .td1 {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        padding: 1pt 1pt;
        font-weight: 600;
        font-style: normal;
        text-decoration: none;
        color: black;
        text-indent: 0pt;
        line-height: 9pt;
        text-align: left;
        background-color: #d3ccd3 !important; /* Force background color */
        -webkit-print-color-adjust: exact !important; /* iOS specific */
      }
      .td1.table-header {
        text-align: center;
      }
      .td2 {
        font-family: "Courier New", monospace;
        font-size: 9pt;
        padding: 1pt 1pt;
        font-weight: 500;
        font-style: normal;
        text-decoration: none;
        color: black;
        text-indent: 0pt;
        line-height: 9pt;
        text-align: left;
      }
      .td2.numeric {
        text-align: right;
      }
      .td2.no-border {
        border-bottom-style: hidden;
      }
      .td2.no-border.center {
        text-align: center;
      }
      .td2.no-border.right {
        text-align: right;
      }
      tr:first-child td:first-child {
        border-top-left-radius: 8px;
      }
      tr:first-child td:last-child {
        border-top-right-radius: 8px;
      }
      tr:last-child td:first-child {
        border-bottom-left-radius: 8px;
      }
      tr:last-child td:last-child {
        border-bottom-right-radius: 8px;
      }
      tr:first-child td {
        border-top-style: solid;
      }
      tr td:first-child {
        border-left-style: solid;
      }
      .table-totales {
        width: 250px;
        margin-left: auto;
      }
      .timbre-placement-div {
        text-align: right;
      }
      .timbre-div {
        display: inline-block;
        width: 275px;
        text-align: center;
      }
      .p-timbre {
        margin: 0;
        font-family: Arial, sans-serif;
        font-size: 12px;
      }
      .p-timbre.cedible {
        font-weight: bold;
        text-align: right;
        margin-top: 1px;
      }
    </style>
  </head>
`;

    const empresaInfo = `
      <table class="table-logo-emisor-sii" colspan="3">
        <tr>
          <td class="td-logo-emisor-sii">
            ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="logo" style="max-width: 150px; max-height: 100px;" />` : ''}
          </td>
          <td class="td-logo-emisor-sii">
            <p class="p-emisor">${guia.emisor.razon_social}</p>
            <p class="p-emisor">${guia.emisor.giro}</p>
            <p class="p-emisor">${guia.emisor.direccion}</p>
            <p class="p-emisor">${guia.emisor.comuna}</p>
          </td>
          <td class="td-logo-emisor-sii">
            <div class="div-sii">
              <p class="p-emisor">RUT ${guia.emisor.rut}</p>
              <p class="p-emisor">GUIA DE DESPACHO ELECTRÓNICA</p>
              <p class="p-emisor">N° ${guia.identificacion.folio}</p>
            </div>
          </td>
        </tr>
      </table>
`;

    const identificacionTable = `
      <table>
        <tr>
          <td class="td1">Señor(es)</td>
          <td class="td2">${guia.receptor.razon_social}</td>
          <td class="td1">RUT</td>
          <td class="td2">${guia.receptor.rut}</td>
        </tr>
        <tr>
          <td class="td1">Giro</td>
          <td class="td2">${guia.receptor.giro}</td>
          <td class="td1">Fecha Emisión</td>
          <td class="td2">${guiaDate.split('T')[0]}</td>
        </tr>
        <tr>
          <td class="td1">Dirección</td>
          <td class="td2">${guia.receptor.direccion}</td>
          <td class="td1">Comuna</td>
          <td class="td2">${guia.receptor.comuna}</td>
        </tr>
        <tr>
          <td class="td1">Tipo de Despacho</td>
          <td class="td2">${guia.identificacion.tipo_despacho}</td>
          <td class="td1">Tipo de Traslado</td>
          <td class="td2">${guia.identificacion.tipo_traslado}</td>
        </tr>
      </table>
`;
    const despachoTable = `
      <table>
        <tr>
          <td class="td1 table-header" colspan="4">DATOS DE DESPACHO</td>
        </tr>
        <tr>
          <td class="td1">Chofer</td>
          <td class="td2">${guia.transporte.chofer.nombre}</td>
          <td class="td1">RUT Chofer</td>
          <td class="td2">${guia.transporte.chofer.rut}</td>
        </tr>
        <tr>
          <td class="td1">Patente</td>
          <td class="td2">${guia.transporte.camion.patente}</td>
          <td class="td1">RUT Transportista</td>
          <td class="td2">${guia.transporte.empresa.rut}</td>
        </tr>
      </table>
`;
    const destinoTable = `
      <table>
        <tr>
          <td class="td1 table-header" colspan="4">DATOS DEL DESTINO</td>
        </tr>
        <tr>
          <td class="td1">Nombre Destino</td>
          <td class="td2">${guia.destino.nombre}</td>
          <td class="td1">Rol</td>
          <td class="td2">${guia.destino.rol}</td>
        </tr>
        <tr>
          <td class="td1">Comuna</td>
          <td class="td2">${guia.destino.comuna}</td>
          <td class="td1">Georreferencia</td>
          <td class="td2">
            (${guia.destino.georreferencia.latitude},${guia.destino.georreferencia.longitude})
          </td>
        </tr>
      </table>
`;
    const trDetallesTableOnlyDescripcion = (
      descripcion: string | null,
      border: boolean = false
    ) =>
      descripcion
        ? `
      <tr>
        <td class="td2${border ? '' : ' no-border'}">${descripcion}</td>
        <td class="td2${border ? '' : ' no-border'}"></td>
        <td class="td2${border ? '' : ' no-border'}"></td>
        <td class="td2${border ? '' : ' no-border'}"></td>
        <td class="td2${border ? '' : ' no-border'}"></td>
        <td class="td2${border ? '' : ' no-border'}"></td>
      </tr>
    `
        : '';
    const detallesTable = `
      <table cellspacing="0">
        <tr>
          <td class="td1 table-header" colspan="6">DETALLES</td>
        </tr>
        <tr>
          <td class="td1 table-header">Descripción</td>
          <td class="td1 table-header">Cantidad</td>
          <td class="td1 table-header">Unid</td>
          <td class="td1 table-header">Precio Unitario</td>
          <td class="td1 table-header">Ind</td>
          <td class="td1 table-header">Total</td>
        </tr>
        <tr>
          <td class="td2 no-border">${guia.producto.tipo} ${guia.producto.especie} ${guia.producto.calidad} ${guia.producto.largo}</td>
          <td class="td2 no-border numeric">${Number(guia.volumen_total_emitido.toFixed(4)).toLocaleString('es-CL')}</td>
          <td class="td2 no-border center">${guia.producto.unidad}</td>
          <td class="td2 no-border numeric">$ ${guia.precio_unitario_guia.toLocaleString('es-CL')}</td>
          <td class="td2 no-border center">${'AF' /*Confirmar que es esto*/}</td>
          <td class="td2 no-border numeric">$ ${Number(guia.monto_total_guia.toFixed()).toLocaleString('es-CL')}</td>
        </tr>
        ${trDetallesTableOnlyDescripcion('<br/>')}
        ${trDetallesTableOnlyDescripcion(`Predio: ${guia.predio_origen.nombre}`)}
        ${trDetallesTableOnlyDescripcion(`Rol: ${guia.predio_origen.rol}`)}
        ${trDetallesTableOnlyDescripcion(`Comuna: ${guia.predio_origen.comuna}`)}
        ${trDetallesTableOnlyDescripcion(guia.codigo_contrato_externo ? `Nro Pedido: ${guia.codigo_contrato_externo}` : '') /*El codigo contrato externo es el nro de pedido*/}
        ${trDetallesTableOnlyDescripcion('<br/>')}
        ${guia.guia_incluye_fecha_faena ? trDetallesTableOnlyDescripcion(`Fecha Corta: ${guia.predio_origen.fecha_cosecha?.toDate().toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' })}`) : ''}
        ${guia.guia_incluye_fecha_faena ? trDetallesTableOnlyDescripcion(`Año Plantación: ${guia.predio_origen.ano_plantacion}`) : ''}
        ${guia.guia_incluye_codigo_producto ? trDetallesTableOnlyDescripcion(`EEPP: ${guia.producto.codigo}`) : ''}
        ${trDetallesTableOnlyDescripcion(`Plan de Manejo o Uso Suelo: ${guia.predio_origen.plan_de_manejo}`)}
        ${trDetallesTableOnlyDescripcion(`Coordenadas: (${guia.predio_origen.georreferencia.latitude},${guia.predio_origen.georreferencia.longitude})`)}
        ${trDetallesTableOnlyDescripcion('<br/>')}
        ${trDetallesTableOnlyDescripcion(guia.codigo_fsc ? `Codigo FSC: ${guia.codigo_fsc}` : '')}
        ${trDetallesTableOnlyDescripcion('<br/>')}
        ${trDetallesTableOnlyDescripcion(`Patente Carro: ${guia.transporte.carro.patente}`)}
        ${trDetallesTableOnlyDescripcion(`Transporte: ${guia.transporte.empresa.razon_social}`)}
        ${trDetallesTableOnlyDescripcion(guia.servicios.carguio?.empresa ? `Carguio: ${guia.servicios.carguio.empresa.razon_social}` : '')}

        ${guia.observaciones ? guia.observaciones.reduce((acc, observacion) => acc + trDetallesTableOnlyDescripcion(observacion), '') : ''}
        ${
          // If the product is Aserrable, we need to add the clases diametricas to the table
          guia.producto.tipo === 'Aserrable'
            ? `${trDetallesTableOnlyDescripcion('<br/>')}
            ${trDetallesTableOnlyDescripcion('Detalle trozos por clase:')}
             ${guia.producto.clases_diametricas?.reduce((acc, cd) => {
               if (!cd.cantidad_emitida || cd.cantidad_emitida === 0) return acc;
               const descripcion = `${cd.clase}: ${cd.cantidad_emitida} = ${parseFloat((cd.volumen_emitido || 0).toFixed(4) || '0').toLocaleString('es-CL')}`;
               return acc + trDetallesTableOnlyDescripcion(descripcion);
             }, '')}
             ${trDetallesTableOnlyDescripcion(`TOTAL: ${guia.producto.clases_diametricas?.reduce((acc, p) => acc + (p.cantidad_emitida || 0), 0).toLocaleString('es-CL')} = ${Number(guia.volumen_total_emitido.toFixed(4)).toLocaleString('es-CL')}`)}
            `
            : ''
        }
        ${trDetallesTableOnlyDescripcion('<br/>', true)}
      </table>
      `;
    const totalesTable = `
      <table class="table-totales">
        <tr>
          <td class="td1 table-header" colspan="2">TOTALES</td>
        </tr>
        <tr>
          <td class="td1">Monto Neto</td>
          <td class="td2 numeric">$ ${Number(guia.monto_total_guia.toFixed()).toLocaleString('es-CL')}</td>
        </tr>
        <tr>
          <td class="td1">19% IVA</td>
          <td class="td2 numeric">$ ${Math.floor(0.19 * guia.monto_total_guia).toLocaleString('es-CL')}</td>
        </tr>
        <tr>
          <td class="td1">Total</td>
          <td class="td2 numeric">$ ${Number((guia.monto_total_guia + 0.19 * guia.monto_total_guia).toFixed()).toLocaleString('es-CL')}</td>
        </tr>
      </table>
  `;
    const timbre = `
        <div class="timbre-placement-div">
        <div class="timbre-div">
          <img src="${barcode.uri}" style="width: 275px; height: 132px" />
          <p class="p-timbre">Timbre Electrónico SII</p>
          <p class="p-timbre">
            Res. ${empresa.numero_resolucion_sii} de ${empresa.fecha_resolucion_sii.toDate().getFullYear()} - Verifique documento: www.sii.cl
          </p>
          <p class="p-timbre cedible">CEDIBLE CON SU FACTURA</p>
        </div>
      </div>
      `;

    // change pdf417 for its recommended size if it can't be read easily from device '<img src="${barcode.uri}" style="width: ${barcode.width}px; height: ${barcode.height}px" />'
    const htmlBody = `
    <body>
      <div class="global-div">
        ${empresaInfo}
        <br />
        ${identificacionTable}
        <br />
        ${despachoTable}
        <br />
        ${destinoTable}
        <br />
        ${detallesTable}
        <br />
        ${totalesTable}
        <br />
        ${timbre}
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
  }
}
