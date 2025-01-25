import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { GuiaDespachoFirestore } from '@/context/app/types/guia';
import { OptionType } from '@mobile-reality/react-native-select-pro';

export interface SelectorOption<
  OptionObject =
    | number // Identificacion Folio
    | string // Identificacion Tipo Despacho, Tipo Traslado
    | ContratoCompra['proveedor'] // Proveedor
    | ContratoCompra['faena'] // Predio Origen
    | ContratoCompra['clientes'][number] // Receptor
    | ContratoCompra['clientes'][number]['destinos_contrato'][number] // Predio Destino
    | ContratoCompra['servicios']['carguio'] // Servicio Carguio Empresa
    | ContratoCompra['servicios']['cosecha'] // Servicio Cosecha Empresa
    | ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number] // Transporte Empresa
    | ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['choferes'][number] // Transporte Empresa Chofer
    | ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['camiones'][number] // Transporte Empresa Camión
    | ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['carros'][number] // Transporte Empresa Carro
    | string[], // Observaciones
> extends OptionType {
  optionObject?: OptionObject;
}

export interface GuiaFormOptions {
  identificacion_folios: SelectorOption<number>[];
  identificacion_tipos_despacho: SelectorOption<string>[];
  identificacion_tipos_traslado: SelectorOption<string>[];
  proveedores: SelectorOption<ContratoCompra['proveedor']>[];
  // folio_guia_proveedor: ; // not a selector
  predios: SelectorOption<ContratoCompra['faena']>[];
  clientes: SelectorOption<ContratoCompra['clientes'][number]>[];
  destinos: SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]
  >[];
  transporte_empresas: SelectorOption<{
    rut: string;
    razon_social: string;
  }>[];
  transporte_empresa_choferes: SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['choferes'][number]
  >[];
  transporte_empresa_camiones: SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['camiones'][number]
  >[];
  transporte_empresa_carros: SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['carros'][number]
  >[];
  servicio_carguio_empresas: SelectorOption<ContratoCompra['servicios']['carguio']>[];
  servicio_cosecha_empresas: SelectorOption<ContratoCompra['servicios']['cosecha']>[];
}

export type GuiaFormData = {
  identificacion_folio: number | null; // Folio belongs to identificacion
  identificacion_tipo_despacho: string | null; // Tipo Despacho belongs to identificacion
  identificacion_tipo_traslado: string | null; // Tipo Traslado belongs to identificacion
  proveedor: GuiaDespachoFirestore['proveedor'] | null;
  folio_guia_proveedor: number | null;
  receptor: GuiaDespachoFirestore['receptor'] | null;
  predio_origen: GuiaDespachoFirestore['predio_origen'] | null;
  destino: GuiaDespachoFirestore['destino'] | null;
  transporte_empresa: GuiaDespachoFirestore['transporte']['empresa'] | null;
  transporte_empresa_chofer: GuiaDespachoFirestore['transporte']['chofer'] | null; // Chofer belongs to transporte
  transporte_empresa_camion: GuiaDespachoFirestore['transporte']['camion'] | null; // Camión belongs to transporte
  transporte_empresa_carro: GuiaDespachoFirestore['transporte']['carro'] | null; // Carro belongs to transporte
  servicios_carguio_empresa: GuiaDespachoFirestore['servicios']['carguio'] | null;
  servicios_cosecha_empresa: GuiaDespachoFirestore['servicios']['cosecha'] | null;
  observaciones: GuiaDespachoFirestore['observaciones'] | null;
  contrato_compra_id: GuiaDespachoFirestore['contrato_compra_id'] | null;
  contrato_venta_id: GuiaDespachoFirestore['contrato_venta_id'] | null;
  codigo_fsc: GuiaDespachoFirestore['codigo_fsc'] | null;
  codigo_contrato_externo: GuiaDespachoFirestore['codigo_contrato_externo'] | null;
};

export interface GuiaFormState {
  guia: GuiaFormData;
  options: GuiaFormOptions;
}

export type GuiaFormAction =
  | {
      type: 'UPDATE_FIELD';
      payload: {
        field: keyof GuiaFormData;
        value: SelectorOption['optionObject'] | null;
        selectionResult?: {
          newData: Partial<GuiaFormData>;
          newOptions: Partial<GuiaFormOptions>;
        };
      };
    }
  | { type: 'RESET_VIEW'; payload: GuiaFormState };

export interface GuiaFormContextType {
  state: GuiaFormState;
  updateField: (
    field: keyof GuiaFormData,
    value: SelectorOption['optionObject'] | number | null
  ) => void;
  updateObservacionField: (
    mode: 'add' | 'update' | 'remove',
    observacion_index?: number,
    observacion?: string
  ) => void;
  isFormValid: () => boolean;
  resetForm: () => void;
}
