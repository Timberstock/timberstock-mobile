import { IOption } from "@/interfaces/screens/screens";
import {
  GuiaDespachoOptions,
  IOptionDestinoContrato,
  IOptionClienteContratoCompra,
  IOptionTransporte,
  IOptionChofer,
  IOptionCarguio,
  IOptionCosecha,
  IOptionCamion,
} from "@/interfaces/screens/emision/create";
import {
  initialStateGuia,
  initialStatesOptionsCreate,
} from "@/resources/initialStates";
import {
  ClienteContratoCompra,
  ContratoCompra,
  DestinoContratoCompra,
  TransporteContratoCompra,
} from "@/interfaces/contratos/contratoCompra";
import { Faena, Proveedor } from "@/interfaces/esenciales";
import { GuiaDespachoFirestore } from "@/interfaces/firestore/guia";
import { Predio } from "@/interfaces/sii/detalles";

export function getInitialOptions(
  contratosCompra: ContratoCompra[],
): GuiaDespachoOptions {
  return {
    tipoDespacho: initialStatesOptionsCreate.tipoDespacho,
    tipoTraslado: initialStatesOptionsCreate.tipoTraslado,
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
    carros: [],
  };
}

export function isGuiaValid(
  guia: GuiaDespachoFirestore,
  options: GuiaDespachoOptions,
): boolean {
  if (
    !(
      guia.identificacion.folio &&
      guia.identificacion.tipo_despacho &&
      guia.identificacion.tipo_traslado
    ) ||
    !(guia.proveedor.rut && guia.proveedor.razon_social) ||
    !(guia.predio_origen.rol && guia.predio_origen.nombre) ||
    !(
      guia.receptor.rut &&
      guia.receptor.direccion &&
      guia.receptor.razon_social
    ) ||
    !guia.destino.nombre ||
    !(guia.servicios?.carguio && options.empresas_carguio) ||
    !(guia.servicios?.cosecha && options.empresas_cosecha) ||
    !(guia.transporte.empresa.rut && guia.transporte.empresa.razon_social) ||
    !(guia.transporte.chofer.nombre && guia.transporte.chofer.rut) ||
    !guia.transporte.camion.patente ||
    !guia.transporte.carro
  ) {
    return false;
  }
  return true;
}

export function selectProveedorLogic(
  option: IOption | null,
  guia: GuiaDespachoFirestore,
  contratosCompra: ContratoCompra[],
) {
  // Select the proveedorOption from contratosCompra
  const selectedProveedor = contratosCompra.find(
    (contrato) => contrato.proveedor.rut === option?.value,
  )?.proveedor;

  // Construct new Guia keeping upper fields
  const newGuia = {
    ...initialStateGuia,
    // previous identificacion
    identificacion: guia.identificacion,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    proveedor: selectedProveedor || initialStateGuia.proveedor,
  };

  // Reconstruct options keeping upper ones
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesOptionsCreate,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
  };
  if (selectedProveedor) {
    // options for faenas
    newOptions.faenas = parseFaenasFromContratosCompra(
      contratosCompra,
      selectedProveedor,
    );
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectFaenaLogic(
  option: IOption | null,
  guia: GuiaDespachoFirestore,
  contratosCompra: ContratoCompra[],
): {
  newGuia: GuiaDespachoFirestore;
  newOptions: GuiaDespachoOptions;
} {
  // Look for predio option in contratosCompra with the selected proveedor
  const selectedFaena = contratosCompra.find(
    (contrato) =>
      contrato.faena.rol === option?.value &&
      contrato.proveedor.rut === guia.proveedor.rut,
  )?.faena;

  // Construct new Guia with the selected predio, keeping upper ones
  const newGuia = {
    ...initialStateGuia,
    identificacion: guia.identificacion,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    proveedor: guia.proveedor,
    predio_origen: selectedFaena
      ? {
          rol: selectedFaena.rol,
          nombre: selectedFaena.nombre,
          comuna: selectedFaena.comuna,
          georreferencia: selectedFaena.georreferencia,
          certificado: selectedFaena.certificado,
          plan_de_manejo: selectedFaena.plan_de_manejo,
        }
      : initialStateGuia.predio_origen,
  };

  // Reconstruct options keeping upper ones
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesOptionsCreate,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
    faenas: parseFaenasFromContratosCompra(contratosCompra, guia.proveedor),
  };
  if (selectedFaena) {
    // options for clientes
    newOptions.clientes = parseClientesFromContratosCompra(
      contratosCompra,
      guia.proveedor,
      selectedFaena,
    );
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectClienteLogic(
  option: IOptionClienteContratoCompra | null,
  guia: GuiaDespachoFirestore,
  contratosCompra: ContratoCompra[],
): {
  newGuia: GuiaDespachoFirestore;
  newOptions: GuiaDespachoOptions;
} {
  // Look for the cliente in the selected proveedor and faena from the contratoCompra left
  const contratoCompraCliente = contratosCompra.find(
    (contrato) =>
      contrato.clientes.some((cliente) => cliente.rut === option?.value) &&
      contrato.faena.rol === guia.predio_origen.rol &&
      contrato.proveedor.rut === guia.proveedor.rut,
  );
  const selectedCliente = contratoCompraCliente?.clientes.find(
    (cliente) => cliente.rut === option?.value,
  );

  // Construct new Guia with the selected cliente, keeping previous fields
  const newGuia = {
    ...initialStateGuia,
    identificacion: guia.identificacion,
    proveedor: guia.proveedor,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    predio_origen: guia.predio_origen,
    receptor: selectedCliente
      ? {
          rut: selectedCliente.rut,
          razon_social: selectedCliente.razon_social,
          comuna: selectedCliente.comuna,
          direccion: selectedCliente.direccion,
          giro: selectedCliente.giro,
        }
      : initialStateGuia.receptor,
    contrato_compra_id: contratoCompraCliente?.firestoreID || "",
  };

  // Reconstruct options
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesOptionsCreate,
    proveedores: parseProveedoresFromContratosCompra(contratosCompra),
    faenas: parseFaenasFromContratosCompra(contratosCompra, guia.proveedor),
    clientes: parseClientesFromContratosCompra(
      contratosCompra,
      guia.proveedor,
      guia.predio_origen,
    ),
  };
  if (selectedCliente) {
    // options for destinos_contrato, these now depend solely on the selected cliente
    newOptions.destinos_contrato =
      parseDestinosContratoFromCliente(selectedCliente);

    newOptions.empresas_carguio = parseCarguiosFromContratoCompra(
      contratoCompraCliente as ContratoCompra,
    );
    newOptions.empresas_cosecha = parseCosechasFromContratoCompra(
      contratoCompraCliente as ContratoCompra,
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
  guia: GuiaDespachoFirestore,
): {
  newGuia: GuiaDespachoFirestore;
  newOptions: GuiaDespachoOptions;
} {
  // Look for the destinoContratoObject in option
  const selectedDestinoContrato = option?.destinoContratoObject;

  // Construct new Guia with the selected destinoContrato, keeping upper
  const newGuia = {
    ...initialStateGuia,
    identificacion: guia.identificacion,
    proveedor: guia.proveedor,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    predio_origen: guia.predio_origen,
    receptor: guia.receptor,
    servicios: guia.servicios,
    contrato_compra_id: guia.contrato_compra_id,
    destino: selectedDestinoContrato
      ? {
          nombre: selectedDestinoContrato.nombre,
          rol: selectedDestinoContrato.rol,
          comuna: selectedDestinoContrato.comuna,
          georreferencia: selectedDestinoContrato.georreferencia,
        }
      : initialStateGuia.destino,
  };

  // Reconstruct options
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesOptionsCreate,
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
      selectedDestinoContrato,
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
  guia: GuiaDespachoFirestore,
): {
  newGuia: GuiaDespachoFirestore;
  newOptions: GuiaDespachoOptions;
} {
  // Get transporteObject from the selected option
  const selectedTransportista = option?.transporteObject;

  // Construct new Guia with the selected transporte, with previous fields
  const newGuia = {
    ...initialStateGuia,
    identificacion: guia.identificacion,
    proveedor: guia.proveedor,
    folio_guia_proveedor: guia.folio_guia_proveedor,
    predio_origen: guia.predio_origen,
    receptor: guia.receptor,
    servicios: guia.servicios,
    contrato_compra_id: guia.contrato_compra_id,
    destino: guia.destino,
    transporte: selectedTransportista
      ? {
          empresa: {
            rut: selectedTransportista.rut,
            razon_social: selectedTransportista.razon_social,
          },
          precio_unitario_transporte:
            selectedTransportista.precio_unitario_transporte || 0,
          chofer: initialStateGuia.transporte.chofer,
          camion: initialStateGuia.transporte.camion,
          carro: initialStateGuia.transporte.carro,
        }
      : initialStateGuia.transporte,
  };

  // Reconstruct options
  const newOptions: GuiaDespachoOptions = {
    ...initialStatesOptionsCreate,
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
    newOptions.carros = parseCarrosFromTransporte(selectedTransportista);
  }

  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectCarguioLogic(
  option: IOptionCarguio | null,
  guia: GuiaDespachoFirestore,
): GuiaDespachoFirestore {
  // get carguioObject from the selected option
  const selectedCarguio = option?.carguioObject;

  // Construct new Guia with the selected cosecha keeping upper
  const newGuia = {
    ...guia,
    servicios: {
      ...guia.servicios,
      carguio: selectedCarguio,
    },
  };

  return newGuia;
}

export function selectCosechaLogic(
  option: IOptionCosecha | null,
  guia: GuiaDespachoFirestore,
): GuiaDespachoFirestore {
  // get cosechaObject from the selected option
  const selectedCosecha = option?.cosechaObject;

  // Construct new Guia with the selected cosecha keeping upper
  const newGuia = {
    ...guia,
    servicios: {
      ...guia.servicios,
      cosecha: selectedCosecha,
    },
  };

  return newGuia;
}

export function selectChoferLogic(
  option: IOptionChofer | null,
  guia: GuiaDespachoFirestore,
): GuiaDespachoFirestore {
  // get choferobject
  const selectedChofer = option?.choferObject;

  // Construct new Guia with the selected chofer keeping upper
  const newGuia = {
    ...guia,
    transporte: {
      ...guia.transporte,
      chofer: selectedChofer || initialStateGuia.transporte.chofer,
    },
  };

  // 3. Return new guia
  return newGuia;
}

export function selectCamionLogic(
  option: IOptionCamion | null,
  guia: GuiaDespachoFirestore,
): GuiaDespachoFirestore {
  // get camion object
  const selectedCamion = option?.camionObject;

  // Construct new Guia with the selected camion
  const newGuia = {
    ...guia,
    transporte: {
      ...guia.transporte,
      camion: selectedCamion || initialStateGuia.transporte.camion,
    },
  };

  return newGuia;
}

export function selectCarroLogic(
  option: IOption | null,
  guia: GuiaDespachoFirestore,
): GuiaDespachoFirestore {
  // Construct new Guia with the selected carro keeping upper
  const newGuia = {
    ...guia,
    transporte: {
      ...guia.transporte,
      carro: option?.value || initialStateGuia.transporte.carro,
    },
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
  contratosCompra: ContratoCompra[],
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return proveedoresOptions;
};

const parseFaenasFromContratosCompra = (
  contratosCompra: ContratoCompra[],
  proveedor: Proveedor,
): IOption[] => {
  const contratosCompraFiltered = contratosCompra.filter(
    (contrato) => contrato.proveedor.rut === proveedor.rut,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );
  return faenasOptions;
};

/**
 * Here the contracts should be narrowed down to a single one to get the clientes from
 */

const parseClientesFromContratosCompra = (
  contratosCompra: ContratoCompra[],
  proveedor: Proveedor,
  predio_origen: Predio,
): IOptionClienteContratoCompra[] => {
  const contratosCompraFiltered = contratosCompra.filter(
    (contrato) =>
      contrato.faena.rol === predio_origen.rol &&
      contrato.proveedor.rut === proveedor.rut,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return clienteOptions;
};

const parseCarguiosFromContratoCompra = (
  contratoCompra: ContratoCompra,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return carguioOptions;
};
const parseCosechasFromContratoCompra = (
  contratoCompra: ContratoCompra,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return cosechaOptions;
};

const parseDestinosContratoFromCliente = (
  cliente: ClienteContratoCompra,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return destinosOptions;
};

const parseTransportesFromDestinoContrato = (
  destino_contrato: DestinoContratoCompra,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return transportesOptions;
};

const parseChoferesFromTransporte = (
  empresa_transporte: TransporteContratoCompra,
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
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return choferesOptions;
};

const parseCamionesFromTransporte = (
  empresa_transporte: TransporteContratoCompra,
): IOptionCamion[] => {
  let camionesOptions = [];
  for (const camion of empresa_transporte.camiones) {
    camionesOptions.push({
      value: camion.patente,
      label: camion.patente,
      camionObject: camion,
    });
  }

  // Order camionesOptions by alphabetical order of label
  camionesOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return camionesOptions;
};

const parseCarrosFromTransporte = (
  empresa_transporte: TransporteContratoCompra,
): IOption[] => {
  let carrosOptions = [];
  for (const carro of empresa_transporte.carros) {
    carrosOptions.push({
      value: carro,
      label: carro,
    });
  }

  // Order carrosOptions by alphabetical order of label
  carrosOptions.sort((a, b) =>
    a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
  );

  return carrosOptions;
};

export const folioProveedorChangeLogic = (
  folio: string,
  guia: GuiaDespachoFirestore,
): GuiaDespachoFirestore => {
  const newGuia = {
    ...guia,
    folio_guia_proveedor: parseInt(folio),
  };

  return newGuia;
};
