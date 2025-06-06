import * as xml2js from 'react-native-xml2js';
// This next library is very small from https://github.com/michaelrothkopf/react-native-rsa-expo
// this library is not maintained anymore, but it works... however it raises a high severity vulnerability with no fix available for node-forge
import { DD } from '@/context/app/types/sii/timbre';
import { Crypt } from 'hybrid-crypto-js';
import { GuiaDespachoIncomplete } from './creation';

export class TimbreService {
  static parseCAF_File(cafString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(cafString, (err: any, result: any) => {
        if (err) {
          console.error('Error parsing XML:', err);
          reject(err);
          return;
        }

        try {
          // Extract the desired elements, being careful to handle any unexpected structure
          const AUTORIZACION = result.AUTORIZACION || {};
          const CAF = AUTORIZACION.CAF ? AUTORIZACION.CAF[0] : null;
          const RSASK = AUTORIZACION.RSASK ? AUTORIZACION.RSASK[0] : null;
          const RSAPUBK = AUTORIZACION.RSAPUBK ? AUTORIZACION.RSAPUBK[0] : null;

          if (!CAF) {
            reject(new Error('CAF element not found'));
            return;
          }

          resolve({ CAF, RSASK, RSAPUBK });
        } catch (ex: any) {
          reject(new Error('Unexpected XML structure: ' + ex.message));
        }
      });
    });
  }

  static async getTED(cafString: string, guia: GuiaDespachoIncomplete) {
    function formatDateToYYYYMMDD(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Get correctly formatted date
    const today = new Date();
    const todayString = formatDateToYYYYMMDD(today);
    // Date as string with time YYYY-MM-DDTHH:MM:SS
    const todayStringWithTime =
      todayString +
      'T' +
      String(today.getHours()).padStart(2, '0') +
      ':' +
      String(today.getMinutes()).padStart(2, '0') +
      ':' +
      String(today.getSeconds()).padStart(2, '0');

    // Get correctly formatted CAF String
    const CAF_File = await TimbreService.parseCAF_File(cafString);
    const CAF = CAF_File.CAF;
    const RSASK = CAF_File.RSASK;

    const XMLtoStringBuilder = new xml2js.Builder({
      rootName: 'CAF',
      headless: true,
    });
    let CAF_XML_String = XMLtoStringBuilder.buildObject(CAF);
    // TODO: CHECK backslashes that are being added in the XML string for the double quotes
    CAF_XML_String = CAF_XML_String.replace(/>[\s]+</g, '><');

    // Set the guia data
    const DD: DD = {
      RE: guia.emisor.rut,
      TD: 52,
      F: guia.identificacion.folio,
      FE: todayString,
      RR: guia.receptor.rut,
      RSR: guia.receptor.razon_social,
      MNT: Math.floor(guia.monto_total_guia * 1.19),
      IT1: `Total: ${guia.monto_total_guia}`,
      CAF: CAF_XML_String,
      TSTED: todayStringWithTime,
    };
    const DD_XML_String = `<RE>${DD.RE}</RE><TD>${DD.TD}</TD><F>${DD.F}</F><FE>${DD.FE}</FE><RR>${DD.RR}</RR><RSR>${DD.RSR}</RSR><MNT>${DD.MNT}</MNT><IT1>${DD.IT1}</IT1>${DD.CAF}<TSTED>${DD.TSTED}</TSTED>`;

    // Sign the DD_XML_String with the RSASK, Both public keys given by the CAF are the same?
    const crypt = new Crypt({ md: 'sha1' });
    const FRMT = JSON.parse(crypt.signature(RSASK, DD_XML_String));

    const TED = `<TED version="1.0"><DD>${DD_XML_String}</DD><FRMT algoritmo="SHA1withRSA">${FRMT.signature}</FRMT></TED>`;
    return TED;
  }
}
