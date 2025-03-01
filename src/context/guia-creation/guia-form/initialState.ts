import { GuiaFormData, GuiaFormOptions } from './types';

// Direct dependencies based on contract structure
const fieldDependencies: Record<keyof GuiaFormData, (keyof GuiaFormData)[]> = {
  proveedor: ['faena'],
  faena: ['cliente', 'contrato_compra_id'],
  contrato_compra_id: ['servicios_carguio_empresa', 'servicios_cosecha_empresa'],
  cliente: ['destino_contrato', 'contrato_venta_id'],
  destino_contrato: [
    'transporte_empresa',
    'contrato_venta_id',
    'codigo_fsc',
    'codigo_contrato_externo',
  ],
  transporte_empresa: [
    'transporte_empresa_chofer',
    'transporte_empresa_camion',
    'transporte_empresa_carro',
  ],
  // Fields that don't affect others
  identificacion_folio: [],
  identificacion_tipo_despacho: [],
  identificacion_tipo_traslado: [],
  folio_guia_proveedor: [],
  transporte_empresa_chofer: [],
  transporte_empresa_camion: [],
  transporte_empresa_carro: [],
  servicios_carguio_empresa: [],
  servicios_cosecha_empresa: [],
  observaciones: [],
  contrato_venta_id: [],
  codigo_fsc: [],
  codigo_contrato_externo: [],
};

// Helper to get all dependent fields recursively
export function getAllDependentFields(
  field: keyof GuiaFormData
): (keyof GuiaFormData)[] {
  const directDependents = fieldDependencies[field] || [];
  const allDependents = [...directDependents];

  directDependents.forEach((dependent) => {
    if (dependent in fieldDependencies) {
      allDependents.push(...getAllDependentFields(dependent as keyof GuiaFormData));
    }
  });

  return [...new Set(allDependents)]; // Remove duplicates
}

export const guiaFormOptionsInitialState: GuiaFormOptions = {
  identificacion_folios: [],
  proveedores: [],
  faenas: [],
  clientes: [],
  destinos_contrato: [],
  transporte_empresas: [],
  transporte_empresa_choferes: [],
  transporte_empresa_camiones: [],
  transporte_empresa_carros: [],
  servicios_carguio_empresas: [],
  servicios_cosecha_empresas: [],
  identificacion_tipos_despacho: [
    { value: 'Por cuenta del receptor', label: 'Cuenta Receptor' },
    {
      value: 'Por cuenta del emisor a instalaciones cliente',
      label: 'Cuenta Emisor a Instalaciones Cliente',
    },
    {
      value: 'Por cuenta del emisor a otras instalaciones',
      label: 'Cuenta Emisor Otras Instalaciones',
    },
  ],
  identificacion_tipos_traslado: [
    { value: 'Constituye venta', label: 'Venta' },
    { value: 'Traslados internos', label: 'Interno' },
    { value: 'Otros traslados no venta', label: 'Otros' },
    // { value: 'Venta por efectuar', label: 'Venta por Efectuar' },
    // { value: 'Consignación', label: 'Consignación' },
    // { value: 'Entrega gratuita', label: 'Gratuito' },
  ],
};

export const guiaFormInitialState: GuiaFormData = {
  identificacion_folio: null,
  identificacion_tipo_despacho: 'Por cuenta del receptor',
  identificacion_tipo_traslado: 'Constituye venta',
  folio_guia_proveedor: null,
  proveedor: null,
  faena: null,
  cliente: null,
  destino_contrato: null,
  transporte_empresa: null,
  transporte_empresa_chofer: null,
  transporte_empresa_camion: null,
  transporte_empresa_carro: null,
  servicios_carguio_empresa: null,
  servicios_cosecha_empresa: null,
  observaciones: [],
  contrato_compra_id: null,
  contrato_venta_id: null,
  codigo_fsc: null,
  codigo_contrato_externo: null,
};
