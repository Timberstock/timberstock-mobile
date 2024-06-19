import { Producto } from '../../interfaces/detalles';
import { PreGuia } from '../../interfaces/firestore';
import { IOption } from '../../interfaces/screens';
import CustomHelpers from '../helpers';
import getTED from '../timbre';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

import { pdf417 } from 'bwip-js';
import 'react-zlib-js'; // side effects only
// import bwipjs from 'bwip-js';

export const handleSelectProductoLogic = (
  option: IOption | null,
  retrievedData: {
    productos: Producto[];
  }
) => {
  const productoSplit = option?.value.split(' - ');
  const { especie, tipo, calidad, largo, precio_ref } = {
    especie: productoSplit ? productoSplit[0] : '',
    tipo: productoSplit ? productoSplit[1] : '',
    calidad: productoSplit ? productoSplit[2] : '',
    largo: productoSplit ? productoSplit[3] : '',
    precio_ref: productoSplit ? productoSplit[4].slice(1, -3) : '',
  };
  const selectedTrozo = retrievedData.productos.find(
    (selectedTrozo) =>
      selectedTrozo.especie === especie &&
      selectedTrozo.tipo === tipo &&
      selectedTrozo.calidad === calidad &&
      selectedTrozo.largo === parseFloat(largo) &&
      selectedTrozo.precio_ref === parseFloat(precio_ref)
  );
  return {
    especie: selectedTrozo?.especie || '',
    tipo: selectedTrozo?.tipo || '',
    calidad: selectedTrozo?.calidad || '',
    largo: selectedTrozo?.largo || 0,
    unidad: selectedTrozo?.unidad || '',
    cantidad: selectedTrozo?.cantidad || 0,
    precio_ref: selectedTrozo?.precio_ref || 0,
  };
};

export const generatePDF = async (
  guia: PreGuia,
  guiaDate: string,
  CAF: string
) => {
  try {
    // get TED
    const TED = await getTED(CAF, guia);
    console.log('TED GENERADO');

    // Generate the barcode
    const barcode = await pdf417({
      bcid: 'pdf417',
      text: TED,
    });

    console.log('barcode GENERADO');

    // Prepare the HTML content for the PDF with the barcode
    const html = await CustomHelpers.createPDFHTMLString(
      guia,
      guiaDate,
      barcode
    );

    console.log('html GENERADO');

    // Generate the PDF using Expo's print module
    const { uri } = await Print.printToFileAsync({ html: html });

    // // Move the PDF file to a permanent location using Expo's file system module
    const permanentUri = `${FileSystem.documentDirectory}example.pdf`;
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
