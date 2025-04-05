// import { DetalleDTE } from '@/context/app/types/sii/guia';
import { Empresa } from '@/context/app/types';
import { GuiaDespachoFirestore } from '@/context/app/types/guia';
import { User } from '@/context/user/types';
import { LocalFilesService } from '@/services/LocalFilesService';
import firestore from '@react-native-firebase/firestore';
import * as Updates from 'expo-updates';
import { GuiaFormData } from '../../guia-form/types';
import { ProductoFormData } from '../../producto-form/types';
import { StatusCallback } from '../types';
import { PDFService } from './pdf';

export interface GuiaDespachoIncomplete
  extends Omit<
    GuiaDespachoFirestore,
    | '_caf_id'
    | 'usuario_metadata'
    | 'pdf_url'
    | 'pdf_local_uri'
    | 'estado'
    | 'pdf_local_checked_uri'
  > {}

export class CreationService {
  static async createGuia(
    guiaDespachoIncomplete: GuiaDespachoIncomplete,
    empresa: Empresa,
    user: User,
    onStatusChange?: StatusCallback
  ): Promise<void> {
    try {
      onStatusChange?.('Buscando CAF correspondiente...');
      const creationDate = guiaDespachoIncomplete.identificacion.fecha as Date;
      const CAF = user.cafs.find(
        (caf) =>
          caf.D <= guiaDespachoIncomplete.identificacion.folio &&
          caf.H >= guiaDespachoIncomplete.identificacion.folio
      );

      if (!CAF) {
        throw new Error('No se encontró un CAF válido para este folio');
      }

      onStatusChange?.('Generando PDF con timbre electrónico...');
      const pdfTempUri = await PDFService.generatePDF(
        creationDate,
        guiaDespachoIncomplete,
        CAF.text,
        empresa,
        onStatusChange
      );

      onStatusChange?.('Guardando PDF en almacenamiento local...');
      const savedPdfUri = await LocalFilesService.moveFile(
        empresa.id,
        `GD_${guiaDespachoIncomplete.identificacion.folio}.pdf`,
        pdfTempUri
      );

      onStatusChange?.('Preparando metadata de la guía...');
      const guiaDespacho: GuiaDespachoFirestore = {
        ...guiaDespachoIncomplete,
        usuario_metadata: {
          usuario_id: user.id,
          usuario_email: user.email,
          version_app: Updates.createdAt
            ? `${Updates.createdAt?.getUTCDate()}/${Updates.createdAt?.getUTCMonth() + 1}/${Updates.createdAt?.getUTCFullYear()}`
            : '07/01/2025',
          len_folios_reservados: user.folios_reservados.length || 0,
          len_cafs: user.cafs.length || 0,
          pdf_local_uri: savedPdfUri,
        },
        estado: 'pendiente',
        _caf_id: CAF.id,
        pdf_url: '',
      };

      onStatusChange?.('Guardando guía en base de datos local...');
      const newGuiaDocRef = firestore()
        .collection(`empresas/${empresa.id}/guias`)
        .doc('DTE_GD_f' + guiaDespacho.identificacion.folio);

      // await newGuiaDocRef.set(guiaDespacho);
      newGuiaDocRef.set(guiaDespacho);

      // await OfflineWritingFirestoreService.setAndWaitForLocalPersistence(
      //   newGuiaDocRef,
      //   guiaDespacho
      // );

      onStatusChange?.('¡Guía creada exitosamente!');
    } catch (e) {
      console.log('💥 Error en CreationService:', {
        error: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw new Error('Error creating guia: ' + e);
    }
  }

  static formatGuiaDespacho(
    precioUnitarioGuia: number,
    guiaForm: GuiaFormData,
    productoForm: ProductoFormData,
    empresa: Empresa
  ) {
    console.log('🔄 Formateando datos de la guía...', {
      folio: guiaForm.identificacion_folio,
      precio: precioUnitarioGuia,
    });

    const creationDate = new Date();
    // Format that shit into a proper GuiaDespacho
    const guiaDespachoIncomplete: GuiaDespachoIncomplete = {
      id: 'DTE_GD_f' + guiaForm.identificacion_folio!.toString(),
      // FIRST PART RELATED TO EMISOR
      emisor: {
        rut: empresa.rut,
        razon_social: empresa.razon_social,
        direccion: empresa.direccion,
        comuna: empresa.comuna,
        giro: empresa.giro,
        actividad_economica: empresa.actividad_economica,
      },
      // SECOND PART RELATED TO GUIAFORM
      proveedor: {
        rut: guiaForm.proveedor?.rut!,
        razon_social: guiaForm.proveedor?.razon_social!,
      },
      folio_guia_proveedor: guiaForm.folio_guia_proveedor,
      identificacion: {
        folio: guiaForm.identificacion_folio!,
        tipo_traslado: guiaForm.identificacion_tipo_traslado!,
        tipo_despacho: guiaForm.identificacion_tipo_despacho!,
        fecha: creationDate,
      },
      predio_origen: {
        rol: guiaForm.faena?.rol!,
        nombre: guiaForm.faena?.nombre!,
        comuna: guiaForm.faena?.comuna!,
        georreferencia: guiaForm.faena?.georreferencia!,
        plan_de_manejo: guiaForm.faena?.plan_de_manejo!,
        certificado: guiaForm.faena?.certificado!,
      },
      receptor: {
        rut: guiaForm.cliente!.rut,
        razon_social: guiaForm.cliente!.razon_social,
        direccion: guiaForm.cliente!.direccion,
        comuna: guiaForm.cliente!.comuna,
        giro: guiaForm.cliente!.giro,
      },
      destino: {
        rol: guiaForm.destino_contrato?.rol!,
        nombre: guiaForm.destino_contrato?.nombre!,
        comuna: guiaForm.destino_contrato?.comuna!,
        georreferencia: guiaForm.destino_contrato?.georreferencia!,
      },
      servicios: {
        cosecha: guiaForm.servicios_cosecha_empresa,
        carguio: guiaForm.servicios_carguio_empresa,
        otros: null,
      },
      transporte: {
        empresa: {
          rut: guiaForm.transporte_empresa!.rut,
          razon_social: guiaForm.transporte_empresa!.razon_social,
        },
        chofer: guiaForm.transporte_empresa_chofer!,
        camion: guiaForm.transporte_empresa_camion!,
        carro: guiaForm.transporte_empresa_carro!,
        precio_unitario_transporte:
          guiaForm.transporte_empresa?.precio_unitario_transporte || 0,
      },
      codigo_fsc: guiaForm.codigo_fsc,
      codigo_contrato_externo: guiaForm.codigo_contrato_externo,
      contrato_compra_id: guiaForm.contrato_compra_id!,
      contrato_venta_id: guiaForm.contrato_venta_id!,
      observaciones: guiaForm.observaciones,
      // THIRD PART RELATED TO PRODUCTO
      producto: {
        tipo: productoForm.tipo! as 'Aserrable' | 'Pulpable' | null,
        codigo: productoForm.info!.codigo,
        especie: productoForm.info!.especie,
        calidad: productoForm.info!.calidad,
        largo: productoForm.info!.largo,
        unidad: productoForm.info!.unidad,
        precio_unitario_compra_mr: productoForm.precio_unitario_compra_mr,
        precio_unitario_venta_mr: productoForm.precio_unitario_venta_mr,
        clases_diametricas: productoForm.clases_diametricas_guia,
        bancos: productoForm.bancos,
      },
      volumen_total_emitido: productoForm.volumen_total_emitido,
      precio_unitario_guia: precioUnitarioGuia,
      monto_total_guia: Number(
        (precioUnitarioGuia * productoForm.volumen_total_emitido).toFixed(2)
      ),
    };

    if (guiaForm.guia_incluye_codigo_producto) {
      // Only add this field if it's explicit
      guiaDespachoIncomplete.guia_incluye_codigo_producto =
        guiaForm.guia_incluye_codigo_producto;
    }

    if (guiaForm.guia_incluye_fecha_faena) {
      // Only add this field if it's explicit
      guiaDespachoIncomplete.guia_incluye_fecha_faena =
        guiaForm.guia_incluye_fecha_faena;
      guiaDespachoIncomplete.predio_origen.ano_plantacion =
        guiaForm.faena?.ano_plantacion;
      guiaDespachoIncomplete.predio_origen.fecha_cosecha =
        guiaForm.faena?.fecha_cosecha;
    }

    return guiaDespachoIncomplete;
  }
}
