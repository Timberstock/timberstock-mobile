// import { DetalleDTE } from '@/context/app/types/sii/guia';
import { Empresa, GuiaDespachoState, LocalFile } from '@/context/app/types';
import { User } from '@/context/user/types';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { GuiaFormData } from '../../guia-form/types';
import { ProductoFormData } from '../../producto-form/types';
import { PDFService } from './pdf';

export interface GuiaDespachoIncomplete
  extends Omit<
    GuiaDespachoState,
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
    localFiles: LocalFile[]
  ): Promise<boolean> {
    const creationDate = guiaDespachoIncomplete.identificacion.fecha as Date;

    const CAF = user.cafs.find(
      (caf) =>
        caf.D <= guiaDespachoIncomplete.identificacion.folio &&
        caf.H >= guiaDespachoIncomplete.identificacion.folio
    );
    if (!CAF) {
      throw new Error('CAF not found');
    }

    let pdf_local_uri;
    // Find logo file
    const logoFile = localFiles.find((file) => file.name === 'logo.png');
    let logoBase64: string | undefined;

    if (logoFile) {
      // Read the file and convert to base64
      const base64 = await FileSystem.readAsStringAsync(logoFile.path, {
        encoding: FileSystem.EncodingType.Base64,
      });
      logoBase64 = `data:image/png;base64,${base64}`;
    }

    try {
      pdf_local_uri = await PDFService.generatePDF(
        creationDate,
        guiaDespachoIncomplete,
        CAF.text,
        empresa,
        logoBase64
      );
    } catch (e) {
      console.error('Error generating PDF: ', e);
      pdf_local_uri = (e as Error).message || 'error_getting_local_pdf';
    }

    const guiaDespacho: GuiaDespachoState = {
      ...guiaDespachoIncomplete,
      usuario_metadata: {
        usuario_id: user.id,
        usuario_email: user.email,
        version_app: Updates.createdAt
          ? `${Updates.createdAt?.getUTCDate()}/${Updates.createdAt?.getUTCMonth() + 1}/${Updates.createdAt?.getUTCFullYear()}`
          : '07/01/2025',
        len_folios_reservados: user.folios_reservados.length || 0,
        len_cafs: user.cafs.length || 0,
        pdf_local_uri: pdf_local_uri || 'error_getting_local_pdf',
      },
      pdf_local_checked_uri: pdf_local_uri || 'error_getting_local_pdf',
      estado: 'pendiente',
      _caf_id: CAF.id,
      pdf_url: '',
    };

    // Create the guia doc in firebase
    const guiaCreated = await CreationService.createGuiaDoc(
      user.empresa_id,
      guiaDespacho
    );

    return guiaCreated;
  }

  static async createGuiaDoc(
    rutEmpresa: string,
    guia: GuiaDespachoIncomplete
  ): Promise<boolean> {
    function snapshotPromise(
      ref: FirebaseFirestoreTypes.DocumentReference
    ): Promise<FirebaseFirestoreTypes.DocumentSnapshot> {
      // From https://github.com/firebase/firebase-js-sdk/issues/1497
      // Workaround for the issue of createGuiaDoc not resolving when creating a new guia offline.
      return new Promise((resolve, reject) => {
        var unsubscribe = ref.onSnapshot(
          (doc) => {
            resolve(doc);
            unsubscribe();
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
    if (!rutEmpresa) return false;
    try {
      const newGuiaDocRef = firestore()
        .collection(`empresas/${rutEmpresa}/guias`)
        .doc(guia.id);

      // The issue is that the set() function returns a promise that resolves only when the data is written to the server.
      // So with this workaround, we are listening to the snapshot of the document, and resolving the promise when the snapshot is received.
      newGuiaDocRef.set(guia);
      await snapshotPromise(newGuiaDocRef);
      console.log('Guía agregada a firebase: ', guia.id);

      Alert.alert(
        'Guía agregada correctamente',
        `Guía de folio: ${guia.identificacion.folio}`
      );
      return true;
    } catch (e) {
      console.error('Error adding document: ', e);
      Alert.alert('Error al agregar guía');
      throw new Error(' Error al agregar guía: ' + e);
    }
  }

  static formatGuiaDespacho(
    precioUnitarioGuia: number,
    guiaForm: GuiaFormData,
    productoForm: ProductoFormData,
    empresa: Empresa
  ) {
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
    return guiaDespachoIncomplete;
  }
}
