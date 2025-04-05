import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { GuiaDespachoFirestore } from '@/context/app/types/guia';

export type GuiaFormData = {
  identificacion_folio: number | null; // Folio belongs to identificacion
  identificacion_tipo_despacho: string | null; // Tipo Despacho belongs to identificacion
  identificacion_tipo_traslado: string | null; // Tipo Traslado belongs to identificacion
  proveedor: GuiaDespachoFirestore['proveedor'] | null;
  cliente: GuiaFormOptions['clientes'][number] | null;
  faena: GuiaFormOptions['faenas'][number] | null;
  destino_contrato: GuiaFormOptions['destinos_contrato'][number] | null;
  transporte_empresa: GuiaFormOptions['transporte_empresas'][number] | null;
  transporte_empresa_chofer:
    | GuiaFormOptions['transporte_empresa_choferes'][number]
    | null; // Chofer belongs to transporte
  transporte_empresa_camion:
    | GuiaFormOptions['transporte_empresa_camiones'][number]
    | null; // Camión belongs to transporte
  transporte_empresa_carro: { patente: string } | null; // Carro belongs to transporte
  servicios_carguio_empresa:
    | GuiaFormOptions['servicios_carguio_empresas'][number]
    | null;
  servicios_cosecha_empresa:
    | GuiaFormOptions['servicios_cosecha_empresas'][number]
    | null;
  folio_guia_proveedor: number | null; // NOT A SELECTOR
  observaciones: GuiaDespachoFirestore['observaciones']; // NOT A SELECTOR
  contrato_compra_id: GuiaDespachoFirestore['contrato_compra_id'] | null; // NOT A SELECTOR
  contrato_venta_id: GuiaDespachoFirestore['contrato_venta_id'] | null; // NOT A SELECTOR
  codigo_fsc: GuiaDespachoFirestore['codigo_fsc'] | null; // NOT A SELECTOR
  codigo_contrato_externo: GuiaDespachoFirestore['codigo_contrato_externo'] | null; // NOT A SELECTOR
  guia_incluye_codigo_producto: boolean; // NOT A SELECTOR
  guia_incluye_fecha_faena: boolean; // NOT A SELECTOR
};

// Here we map the fields that are selected from contratos with different field names
export interface GuiaFormOptions {
  // Only fields that will be selected from a Dropdown, and therefore need options
  identificacion_folios: { value: number; label: string }[];
  identificacion_tipos_despacho: { value: string; label: string }[];
  identificacion_tipos_traslado: { value: string; label: string }[];
  proveedores: ContratoCompra['proveedor'][];
  clientes: ContratoCompra['clientes']; // options for receptor, comes with name "cliente" in contratos
  faenas: ContratoCompra['faena'][]; // options for predio_origen, comes with name "faena" in contratos
  destinos_contrato: ContratoCompra['clientes'][number]['destinos_contrato'];
  transporte_empresas: ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'];
  transporte_empresa_choferes: ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['choferes'];
  transporte_empresa_camiones: ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['camiones'];
  transporte_empresa_carros: { patente: string }[];
  servicios_carguio_empresas: NonNullable<ContratoCompra['servicios']['carguio']>;
  servicios_cosecha_empresas: NonNullable<ContratoCompra['servicios']['cosecha']>;
}

export interface GuiaFormState {
  guia: GuiaFormData;
  options: GuiaFormOptions;
}

export type GuiaFormAction =
  | {
      type: 'UPDATE_FIELD';
      payload: {
        field: keyof GuiaFormData;
        value: GuiaFormData[keyof GuiaFormData];
        selectionResult?: {
          newData: Partial<GuiaFormData>;
          newOptions: Partial<GuiaFormState['options']>;
        };
      };
    }
  | { type: 'RESET_VIEW'; payload: GuiaFormState };

export interface GuiaFormContextType {
  state: GuiaFormState;
  updateField: (
    field: keyof GuiaFormData,
    value: GuiaFormData[keyof GuiaFormData]
  ) => void;
  updateObservacionField: (
    mode: 'add' | 'update' | 'remove',
    observacion_index?: number,
    observacion?: string
  ) => void;
  isFormValid: () => boolean;
  resetForm: () => void;
  repetirGuia: (guiaTemplate: GuiaDespachoFirestore) => boolean;
}
