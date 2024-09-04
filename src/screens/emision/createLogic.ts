import { IOption } from '@/interfaces/screens/screens';
import {
  GuiaDespachoOptions,
  GuiaDespacho,
  IOptionDestinoContrato,
  IOptionClienteContratoCompra,
  IOptionTransporte,
  IOptionChofer,
  IOptionCarguio,
  IOptionCosecha,
} from '@/interfaces/screens/emision/create';
import { initialStatesCreate } from '@/resources/initialStates';
import {
  ClienteContratoCompra,
  ContratoCompra,
  DestinoContratoCompra,
  TransporteContratoCompra,
} from '@/interfaces/contratos/contratoCompra';
import { Faena, Proveedor } from '@/interfaces/esenciales';

export function getInitialOptions(
  contratosCompra: ContratoCompra[]
): GuiaDespachoOptions {
  return {
    tipoDespacho: initialStatesCreate.options.tipoDespacho,
    tipoTraslado: initialStatesCreate.options.tipoTraslado,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
    faenas: [],
    planesDeManejo: [],
    clientes: [],
    destinos_contrato: [],
    empresas_carguio: [],
    empresas_cosecha: [],
    empresas_transporte: [],
    choferes: [],
    camiones: [],
  };
}

export function isGuiaValid(guia: GuiaDespacho): boolean {
  if (
    !(
      guia.identificacion.folio &&
      guia.identificacion.tipo_despacho &&
      guia.identificacion.tipo_traslado
    ) ||
    !(guia.proveedor.rut && guia.proveedor.razon_social) ||
    !(guia.faena.rol && guia.faena.nombre) ||
    !(
      guia.cliente.rut &&
      guia.cliente.direccion &&
      guia.cliente.razon_social
    ) ||
    !(guia.destino_contrato.nombre && guia.destino_contrato.productos) ||
    !(guia.transporte.rut && guia.transporte.razon_social) ||
    !(guia.chofer.nombre && guia.chofer.rut) ||
    !guia.camion
  ) {
    return false;
  }
  return true;
}

export function selectProveedorLogic(
  option: IOption | null,
  guia: GuiaDespacho,
  contratosCompra: ContratoCompra[]
) {
  // Select the proveedorOption from contratosCompra
  const selectedProveedor = contratosCompra.find(
    (contrato) => contrato.proveedor.rut === option?.value
  )?.proveedor;

  // Construct new Guia keeping upper fields
  const newGuia = {
    ...initialStatesCreate.guia,
    // previous identificacion
    identificacion: guia.identificacion,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    proveedor: selectedProveedor || initialStatesCreate.guia.proveedor,
  };

  // Reconstruct options keeping upper ones
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesCreate.options,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
  };
  if (selectedProveedor) {
    // options for faenas
    newOptions.faenas = parseFaenasFromContratosCompra(
      contratosCompra,
      selectedProveedor
    );
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectFaenaLogic(
  option: IOption | null,
  guia: GuiaDespacho,
  contratosCompra: ContratoCompra[]
): {
  newGuia: GuiaDespacho;
  newOptions: GuiaDespachoOptions;
} {
  // Look for predio option in contratosCompra with the selected proveedor
  const selectedFaena = contratosCompra.find(
    (contrato) =>
      contrato.faena.rol === option?.value &&
      contrato.proveedor.rut === guia.proveedor.rut
  )?.faena;

  // Construct new Guia with the selected predio, keeping upper ones
  const newGuia = {
    ...initialStatesCreate.guia,
    identificacion: guia.identificacion,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    proveedor: guia.proveedor,
    faena: selectedFaena || initialStatesCreate.guia.faena,
  };

  // Reconstruct options keeping upper ones
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesCreate.options,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
    faenas: parseFaenasFromContratosCompra(contratosCompra, guia.proveedor),
  };
  if (selectedFaena) {
    // options for clientes
    newOptions.clientes = parseClientesFromContratosCompra(
      contratosCompra,
      guia.proveedor,
      selectedFaena
    );
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectClienteLogic(
  option: IOptionClienteContratoCompra | null,
  guia: GuiaDespacho,
  contratosCompra: ContratoCompra[]
): {
  newGuia: GuiaDespacho;
  newOptions: GuiaDespachoOptions;
} {
  // Look for the cliente in the selected proveedor and faena from the contratoCompra left
  const contratoCompraCliente = contratosCompra.find(
    (contrato) =>
      contrato.clientes.some((cliente) => cliente.rut === option?.value) &&
      contrato.faena.rol === guia.faena.rol &&
      contrato.proveedor.rut === guia.proveedor.rut
  );
  const selectedCliente = contratoCompraCliente?.clientes.find(
    (cliente) => cliente.rut === option?.value
  );

  // Construct new Guia with the selected cliente, keeping previous fields
  const newGuia = {
    ...initialStatesCreate.guia,
    identificacion: guia.identificacion,
    proveedor: guia.proveedor,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    faena: guia.faena,
    cliente: selectedCliente || initialStatesCreate.guia.cliente,
    contrato_compra_id: contratoCompraCliente?.firestore_id || '',
  };

  // Reconstruct options
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesCreate.options,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
    faenas: parseFaenasFromContratosCompra(contratosCompra, guia.proveedor),
    clientes: parseClientesFromContratosCompra(
      contratosCompra,
      guia.proveedor,
      guia.faena
    ),
  };
  if (selectedCliente) {
    // options for destinos_contrato, these now depend solely on the selected cliente
    newOptions.destinos_contrato =
      parseDestinosContratoFromCliente(selectedCliente);

    newOptions.empresas_carguio = parseCarguiosFromContratoCompra(
      contratoCompraCliente as ContratoCompra
    );
    newOptions.empresas_cosecha = parseCosechasFromContratoCompra(
      contratoCompraCliente as ContratoCompra
    );
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectDestinoContratoLogic(
  option: IOptionDestinoContrato | null,
  options: GuiaDespachoOptions,
  guia: GuiaDespacho
): {
  newGuia: GuiaDespacho;
  newOptions: GuiaDespachoOptions;
} {
  // Look for the destinoContratoObject in option
  const selectedDestinoContrato = option?.destinoContratoObject;

  // Construct new Guia with the selected destinoContrato, keeping upper
  const newGuia = {
    ...initialStatesCreate.guia,
    identificacion: guia.identificacion,
    proveedor: guia.proveedor,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    faena: guia.faena,
    cliente: guia.cliente,
    servicios: guia.servicios,
    contrato_compra_id: guia.contrato_compra_id,
    destino_contrato:
      selectedDestinoContrato || initialStatesCreate.guia.destino_contrato,
  };

  // Reconstruct options
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesCreate.options,
    proveedores: options.proveedores,
    faenas: options.faenas,
    clientes: options.clientes,
    empresas_carguio: options.empresas_carguio,
    empresas_cosecha: options.empresas_cosecha,
    destinos_contrato: options.destinos_contrato,
  };
  if (selectedDestinoContrato) {
    // options for empresas_transporte
    newOptions.empresas_transporte = parseTransportesFromDestinoContrato(
      selectedDestinoContrato
    );
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectTransporteLogic(
  option: IOptionTransporte | null,
  options: GuiaDespachoOptions,
  guia: GuiaDespacho
): {
  newGuia: GuiaDespacho;
  newOptions: GuiaDespachoOptions;
} {
  // Get transporteObject from the selected option
  const selectedTransportista = option?.transporteObject;

  // Construct new Guia with the selected transporte, with previous fields
  const newGuia = {
    ...initialStatesCreate.guia,
    identificacion: guia.identificacion,
    proveedor: guia.proveedor,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    faena: guia.faena,
    cliente: guia.cliente,
    servicios: guia.servicios,
    contrato_compra_id: guia.contrato_compra_id,
    destino_contrato: guia.destino_contrato,
    transporte: selectedTransportista || initialStatesCreate.guia.transporte,
  };

  // Reconstruct options
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesCreate.options,
    proveedores: options.proveedores,
    faenas: options.faenas,
    clientes: options.clientes,
    destinos_contrato: options.destinos_contrato,
    empresas_carguio: options.empresas_carguio,
    empresas_cosecha: options.empresas_cosecha,
    empresas_transporte: options.empresas_transporte,
  };
  if (selectedTransportista) {
    // options for choferes and camiones
    newOptions.choferes = parseChoferesFromTransporte(selectedTransportista);
    newOptions.camiones = parseCamionesFromTransporte(selectedTransportista);
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectCarguioLogic(
  option: IOptionCarguio | null,
  guia: GuiaDespacho
): GuiaDespacho {
  // get carguioObject from the selected option
  const selectedCarguio = option?.carguioObject;

  // Construct new Guia with the selected cosecha keeping upper
  const newGuia = {
    ...guia,
    servicios: {
      carguio: selectedCarguio,
      cosecha: guia.servicios?.cosecha,
    },
  };

  return newGuia;
}

export function selectCosechaLogic(
  option: IOptionCosecha | null,
  guia: GuiaDespacho
): GuiaDespacho {
  // get cosechaObject from the selected option
  const selectedCosecha = option?.cosechaObject;

  // Construct new Guia with the selected cosecha keeping upper
  const newGuia = {
    ...guia,
    servicios: {
      carguio: guia.servicios?.carguio,
      cosecha: selectedCosecha,
    },
  };

  return newGuia;
}

export function selectChoferLogic(
  option: IOptionChofer | null,
  guia: GuiaDespacho
): GuiaDespacho {
  // get choferobject
  const selectedChofer = option?.choferObject;

  // Construct new Guia with the selected chofer keeping upper
  const newGuia = {
    ...guia,
    chofer: selectedChofer || initialStatesCreate.guia.chofer,
  };

  // 3. Return new guia
  return newGuia;
}

export function selectCamionLogic(
  option: IOption | null,
  guia: GuiaDespacho
): GuiaDespacho {
  // get camion object
  const selectedCamion = option?.value;

  // Construct new Guia with the selected camion
  const newGuia = {
    ...guia,
    camion: selectedCamion || initialStatesCreate.guia.camion,
  };

  return newGuia;
}

export const parseFoliosOptions = (folios: number[]): IOption[] => {
  let foliosOpts = [];
  for (const folio of folios) {
    foliosOpts.push({
      value: folio.toString(),
      label: folio.toString(),
    });
  }
  return foliosOpts;
};

const parseProveedoresFromContratosCompra = (
  contratosCompra: ContratoCompra[]
): IOption[] => {
  let proveedores: Proveedor[] = [];
  for (const contratoCompra of contratosCompra) {
    if (contratoCompra.proveedor) proveedores.push(contratoCompra.proveedor);
  }
  let proveedoresOptions = [];
  let seenProvedores = new Set<string>();
  for (const proveedor of proveedores) {
    // Skip repeated proveedores
    if (seenProvedores.has(proveedor.rut)) continue;
    seenProvedores.add(proveedor.rut);
    proveedoresOptions.push({
      value: proveedor.rut,
      label: proveedor.razon_social,
    });
  }
  // Order proveedores by alphabetical order of razon_social
  proveedoresOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return proveedoresOptions;
};

const parseFaenasFromContratosCompra = (
  contratosCompra: ContratoCompra[],
  proveedor: Proveedor
): IOption[] => {
  const contratosCompraFiltered = contratosCompra.filter(
    (contrato) => contrato.proveedor.rut === proveedor.rut
  );
  let faenas: Faena[] = [];
  for (const contratoCompra of contratosCompraFiltered) {
    faenas.push(contratoCompra.faena);
  }

  // from ChatGPT Consensus
  let faenasOptions: { value: string; label: string }[] = [];
  const seenValues = new Set<string>();
  for (const faena of faenas) {
    const value = faena.rol;
    if (!seenValues.has(value)) {
      seenValues.add(value);
      faenasOptions.push({
        value: faena.rol,
        label: `${faena.nombre} | ${faena.comuna}`,
      });
    }
  }
  // Order faenasOptions by alphabetical order of label
  faenasOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );
  return faenasOptions;
};

/**
 * Here the contracts should be narrowed down to a single one to get the clientes from
 */

const parseClientesFromContratosCompra = (
  contratosCompra: ContratoCompra[],
  proveedor: Proveedor,
  faena: Faena
): IOptionClienteContratoCompra[] => {
  const contratosCompraFiltered = contratosCompra.filter(
    (contrato) =>
      contrato.faena.rol === faena.rol &&
      contrato.proveedor.rut === proveedor.rut
  );

  let clientes: ClienteContratoCompra[] = [];
  for (const contratoCompra of contratosCompraFiltered) {
    for (const cliente of contratoCompra.clientes) {
      clientes.push(cliente);
    }
  }
  let clienteOptions = [];
  for (const cliente of clientes) {
    clienteOptions.push({
      value: cliente.rut,
      label: cliente.razon_social,
      clienteObject: cliente,
    });
  }

  // Order clienteOptions by alphabetical order of label
  clienteOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return clienteOptions;
};

const parseCarguiosFromContratoCompra = (
  contratoCompra: ContratoCompra
): IOptionCarguio[] => {
  let carguioOptions = [];
  for (const carguio of contratoCompra?.servicios?.carguio || []) {
    carguioOptions.push({
      value: carguio.empresa.rut,
      label: carguio.empresa.razon_social,
      carguioObject: carguio,
    });
  }

  // Order carguioOptions by alphabetical order of label
  carguioOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return carguioOptions;
};
const parseCosechasFromContratoCompra = (
  contratoCompra: ContratoCompra
): IOptionCosecha[] => {
  let cosechaOptions = [];
  for (const cosecha of contratoCompra?.servicios?.cosecha || []) {
    cosechaOptions.push({
      value: cosecha.empresa.rut,
      label: cosecha.empresa.razon_social,
      cosechaObject: cosecha,
    });
  }

  // Order cosechaOptions by alphabetical order of label
  cosechaOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return cosechaOptions;
};

const parseDestinosContratoFromCliente = (
  cliente: ClienteContratoCompra
): IOptionDestinoContrato[] => {
  const destinos = cliente.destinos_contrato;

  let destinosOptions = [];
  for (const destino of destinos) {
    destinosOptions.push({
      value: destino.nombre,
      label: destino.nombre,
      destinoContratoObject: destino,
    });
  }

  // Order destinosOptions by alphabetical order of label
  destinosOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return destinosOptions;
};

const parseTransportesFromDestinoContrato = (
  destino_contrato: DestinoContratoCompra
): IOptionTransporte[] => {
  let transportesOptions = [];
  for (const transporte of destino_contrato.transportes) {
    transportesOptions.push({
      value: transporte.rut,
      label: `${transporte.razon_social} - ${transporte.rut}`,
      transporteObject: transporte,
    });
  }

  // Order transportesOptions by alphabetical order of label
  transportesOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return transportesOptions;
};

const parseChoferesFromTransporte = (
  empresa_transporte: TransporteContratoCompra
): IOptionChofer[] => {
  let choferesOptions = [];
  for (const chofer of empresa_transporte.choferes) {
    choferesOptions.push({
      value: chofer.rut,
      label: `${chofer.nombre} - ${chofer.rut}`,
      choferObject: chofer,
    });
  }

  // Order choferesOptions by alphabetical order of label
  choferesOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return choferesOptions;
};

const parseCamionesFromTransporte = (
  empresa_transporte: TransporteContratoCompra
): IOption[] => {
  let camionesOptions = [];
  for (const camion of empresa_transporte.camiones) {
    camionesOptions.push({
      value: camion.patente,
      label: camion.patente,
    });
  }

  // Order camionesOptions by alphabetical order of label
  camionesOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  );

  return camionesOptions;
};

export const folioProveedorChangeLogic = (
  folio: string,
  guia: GuiaDespacho
): GuiaDespacho => {
  const newGuia = {
    ...guia,
    folio_guia_proveedor: parseInt(folio),
  };

  return newGuia;
};
