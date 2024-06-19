import { ContratoCompra } from '../../interfaces/contratos/contratoCompra';
import { ContratoVenta } from '../../interfaces/contratos/contratoVenta';
import { Cliente } from '../../interfaces/firestore';
import { IOption } from '../../interfaces/screens';
import {
  ContratosFiltered,
  CreateGuiaOptions,
  GuiaInCreateGuiaScreen,
} from '../../interfaces/screens/createGuia';
import { createGuiaInitialStates } from '../../resources/initialStates';
import {
  getFoliosOptions,
  parseClientesFromContratosVenta,
  parseFaenasFromContratosVenta,
  parseProveedoresFromContratosCompra,
  parseTransportesOptionsFromContratosCompra,
} from '../../resources/options';

export function getInitializationOptions(
  contratos: ContratosFiltered,
  folios_reservados: number[]
): CreateGuiaOptions {
  return {
    tipoDespacho: createGuiaInitialStates.options.tipoDespacho,
    tipoTraslado: createGuiaInitialStates.options.tipoTraslado,
    folios: getFoliosOptions(folios_reservados),
    clientes: parseClientesFromContratosVenta(contratos.venta),
    destinos: [],
    empresasTransporte: [],
    choferes: [],
    camiones: [],
    predios: parseFaenasFromContratosVenta(contratos.venta),
    planesDeManejo: [],
    proveedores: parseProveedoresFromContratosCompra(contratos.compra),
  };
}

export function isGuiaValid(guia: GuiaInCreateGuiaScreen) {
  if (
    !(
      guia.identificacion.folio &&
      guia.identificacion.tipo_despacho &&
      guia.identificacion.tipo_traslado
    ) ||
    !(guia.receptor.razon_social && guia.receptor.direccion) ||
    !(
      guia.despacho.chofer.nombre &&
      guia.despacho.chofer.rut &&
      guia.despacho.patente &&
      guia.despacho.rut_transportista
    ) ||
    !guia.predio.rol ||
    !guia.proveedor.razon_social
  ) {
    return false;
  }
  return true;
}

export function selectClienteLogic(
  option: IOption | null,
  options: CreateGuiaOptions,
  guia: GuiaInCreateGuiaScreen,
  contratosCompra: ContratoCompra[],
  contratosVenta: ContratoVenta[]
): {
  newGuia: GuiaInCreateGuiaScreen;
  newContratosFiltered: ContratosFiltered;
  newOptions: CreateGuiaOptions;
} {
  // 1. get cliente from contratosVenta (always) and set the receptor state
  const selectedCliente =
    contratosVenta.find(
      (contrato) => contrato.cliente?.razon_social === option?.value
    )?.cliente || null;

  // 3. Construct new Guia with the selected cliente and defaulting the lower hierarchy fields
  const newGuia = { ...guia };
  newGuia.receptor = selectedCliente
    ? {
        ...selectedCliente,
        giro: '', // default giro
      }
    : createGuiaInitialStates.guia.receptor;
  newGuia.despacho = createGuiaInitialStates.guia.despacho;
  newGuia.predio = createGuiaInitialStates.guia.predio;
  newGuia.proveedor = createGuiaInitialStates.guia.proveedor;

  // 2. Filter contratos by cliente
  let newContratosCompraFiltered;
  let newContratosVentaFiltered;

  if (selectedCliente === null) {
    // If we are clearing the cliente, we have to set the contratosCompra and contratosVenta to their initial states
    newContratosCompraFiltered = contratosCompra;
    newContratosVentaFiltered = contratosVenta;
  } else {
    // Else filter the contratosCompra and contratosVenta by the selected cliente
    newContratosCompraFiltered = contratosCompra.filter((contrato) => {
      contrato.clientes.find(
        (cliente) => cliente.razon_social === selectedCliente?.razon_social
      );
    });
    newContratosVentaFiltered = contratosVenta.filter(
      (contrato) =>
        contrato.cliente?.razon_social === selectedCliente?.razon_social
    );
  }

  // 4. Construct new options with the filtered contratos (only for immediately lower fields)
  const newDestinosOptions =
    selectedCliente?.destinos.map((destino) => ({
      label: destino,
      value: destino,
    })) || [];
  const newOptions: CreateGuiaOptions = {
    ...options,
    destinos: newDestinosOptions,
    predios: parseFaenasFromContratosVenta(newContratosVentaFiltered),
    proveedores: [],
    empresasTransporte: [],
    choferes: [],
    camiones: [],
  };

  // 5. Return new states
  return {
    newGuia: newGuia,
    newContratosFiltered: {
      compra: newContratosCompraFiltered,
      venta: newContratosVentaFiltered,
    },
    newOptions: newOptions,
  };
}

export function selectPredioLogic(
  option: IOption | null,
  options: CreateGuiaOptions,
  guia: GuiaInCreateGuiaScreen,
  contratosFiltered: ContratosFiltered,
  contratosCompra: ContratoCompra[],
  contratosVenta: ContratoVenta[]
): {
  newGuia: GuiaInCreateGuiaScreen;
  newContratosFiltered: ContratosFiltered;
  newOptions: CreateGuiaOptions;
} {
  const contratosVentaFiltered = contratosFiltered.venta;

  // 1. Look for predio option in contratosVentaFiltered and set the predio state
  const predioSplit = option?.value.split('|');
  const { comuna, rol } = {
    comuna: predioSplit ? predioSplit[0].trim() : '',
    rol: predioSplit ? predioSplit[1].trim() : '',
  };
  const selectedPredio = contratosVentaFiltered
    .find((contrato) =>
      contrato.faenas.find(
        (faena) => faena.comuna === comuna && faena.rol === rol
      )
    )
    ?.faenas.find(
      (newPredio) => newPredio.comuna === comuna && newPredio.rol === rol
    );

  // 2. Construct new Guia with the selected predio and defaulting the lower hierarchy fields
  const newGuia = { ...guia };
  newGuia.predio = selectedPredio
    ? {
        ...selectedPredio,
        productos: [], // default productos (field not used in Guia)
      }
    : createGuiaInitialStates.guia.predio;
  newGuia.proveedor = createGuiaInitialStates.guia.proveedor;
  newGuia.despacho = {
    ...guia.despacho, // only keep the direccion_despacho field
    chofer: createGuiaInitialStates.guia.despacho.chofer,
    patente: createGuiaInitialStates.guia.despacho.patente,
    rut_transportista: createGuiaInitialStates.guia.despacho.rut_transportista,
  };

  // 3. Filter the contratosCompra and contratosVenta by the selected predio
  let newContratosCompraFiltered;
  let newContratosVentaFiltered;

  if (option === null) {
    // If we are clearing the predio, we have to set the contratos filtered states just filtered by the selected cliente (one hierarchy above)
    newContratosCompraFiltered = contratosCompra.filter((contrato) => {
      contrato.clientes.find(
        (cliente) => cliente.razon_social === guia.receptor.razon_social
      );
    });
    newContratosVentaFiltered = contratosVenta.filter(
      (contrato) =>
        contrato.cliente?.razon_social === guia.receptor.razon_social
    );
  } else {
    // Else filter the contratosCompra and contratosVenta by the selected predio and cliente
    newContratosCompraFiltered = contratosCompra.filter(
      (contrato) =>
        // First filter by the selected cliente (in case changing from one selected predio to another)
        contrato.clientes.find(
          (cliente) => cliente.razon_social === guia.receptor.razon_social
        ) &&
        // Then filter by the selected predio
        contrato.faena.rol === selectedPredio?.rol &&
        contrato.faena.comuna === selectedPredio?.comuna
    );

    newContratosVentaFiltered = contratosVenta.filter(
      (contrato) =>
        // First filter cliente
        contrato.cliente?.razon_social === guia.receptor.razon_social &&
        // Then filter predio
        contrato.faenas.find(
          (faena) =>
            faena.rol === selectedPredio?.rol &&
            faena.comuna === selectedPredio?.comuna
        )
    );
  }

  // 4. Construct new options with the filtered contratos (only for immediately lower fields)
  const newProveedoresOptions = parseProveedoresFromContratosCompra(
    newContratosCompraFiltered
  );
  console.log('in selectPredioHandler', newProveedoresOptions);
  const newEmpresasTransporteOptions =
    parseTransportesOptionsFromContratosCompra(
      newContratosCompraFiltered,
      guia.despacho.direccion_destino
    );
  const newOptions: CreateGuiaOptions = {
    ...options,
    proveedores: newProveedoresOptions,
    empresasTransporte: newEmpresasTransporteOptions,
    choferes: [],
    camiones: [],
  };

  // 5. Return new states
  return {
    newGuia: newGuia,
    newContratosFiltered: {
      compra: newContratosCompraFiltered,
      venta: newContratosVentaFiltered,
    },
    newOptions: newOptions,
  };
}

export function selectProveedorLogic(
  option: IOption | null,
  options: CreateGuiaOptions,
  guia: GuiaInCreateGuiaScreen,
  contratosFiltered: ContratosFiltered,
  contratosCompra: ContratoCompra[]
): {
  newGuia: GuiaInCreateGuiaScreen;
  newContratosFiltered: ContratosFiltered;
  newOptions: CreateGuiaOptions;
} {
  const contratosCompraFiltered = contratosFiltered.compra;
  // 1. Look for proveedor option in contratosCompra and set the proveedor state
  const selectedProveedor = contratosCompraFiltered.find(
    (contrato) => contrato.proveedor.razon_social === option?.value
  )?.proveedor;

  // 2. Construct new Guia with the selected proveedor and defaulting the lower hierarchy fields
  const newGuia = { ...guia };
  newGuia.proveedor = selectedProveedor
    ? {
        ...selectedProveedor,
      }
    : createGuiaInitialStates.guia.proveedor;
  newGuia.despacho = {
    ...guia.despacho, // only keep the direccion_despacho field
    chofer: createGuiaInitialStates.guia.despacho.chofer,
    patente: createGuiaInitialStates.guia.despacho.patente,
    rut_transportista: createGuiaInitialStates.guia.despacho.rut_transportista,
  };

  // 3. Filter contratos by proveedor
  let newContratosCompraFiltered;

  if (option === null) {
    // If we are clearing the proveedor, we have to set the contratosCompraFiltered state just by selected cliente and predio
    newContratosCompraFiltered = contratosCompra.filter(
      (contrato) =>
        contrato.clientes.find(
          (cliente) => cliente.razon_social === guia.receptor.razon_social
        ) &&
        contrato.faena.rol === guia.predio.rol &&
        contrato.faena.comuna === guia.predio.comuna
    );
  } else {
    // Else filter the contratosCompra by selected proveedor, predio and cliente
    newContratosCompraFiltered = contratosCompra.filter(
      (contrato) =>
        // First by selected cliente and predio (In case we are changing from one selected predio to another)
        contrato.clientes.find(
          (cliente) => cliente.razon_social === guia.receptor.razon_social
        ) &&
        contrato.faena.rol === guia.predio.rol &&
        contrato.faena.comuna === guia.predio.comuna &&
        // Then by selected proveedor
        contrato.proveedor.razon_social === selectedProveedor?.razon_social
    );
  }

  // 4. Construct new options with the filtered contratos (only for immediately lower fields)
  const newEmpresasTransporteOptions =
    parseTransportesOptionsFromContratosCompra(
      newContratosCompraFiltered,
      guia.despacho.direccion_destino
    );
  const newOptions: CreateGuiaOptions = {
    ...options,
    empresasTransporte: newEmpresasTransporteOptions,
    choferes: [],
    camiones: [],
  };

  // 4. Return new states
  return {
    newGuia: newGuia,
    newContratosFiltered: {
      // Only update the compra field
      ...contratosFiltered,
      compra: newContratosCompraFiltered,
    },
    newOptions: newOptions,
  };
}

export function selectTransportistaLogic(
  option: IOption | null,
  options: CreateGuiaOptions,
  guia: GuiaInCreateGuiaScreen
): {
  newGuia: GuiaInCreateGuiaScreen;
  newOptions: CreateGuiaOptions;
} {
  // 1. Look for transportista option in options and set the transportista state
  const selectedTransportista = options.empresasTransporte.find(
    (empresa) => empresa.value === option?.value
  )?.transporteObject;

  // 2. Construct new Guia with the selected transportista and defaulting the lower hierarchy fields
  const newGuia = { ...guia };
  newGuia.despacho.rut_transportista =
    selectedTransportista?.rut ||
    createGuiaInitialStates.guia.despacho.rut_transportista;

  // 3. Construct new options with the selected transportista
  const newChoferesOptions =
    selectedTransportista?.choferes.map((chofer) => ({
      label: chofer.nombre,
      value: chofer.rut,
      choferObject: chofer,
    })) || [];
  const newCamionesOptions =
    selectedTransportista?.camiones.map((camion) => ({
      label: camion.patente,
      value: camion.patente,
    })) || [];
  const newOptions: CreateGuiaOptions = {
    ...options,
    choferes: newChoferesOptions,
    camiones: newCamionesOptions,
  };

  // 4. Return new states
  return {
    newGuia: newGuia,
    newOptions: newOptions,
  };
}

export function selectChoferLogic(
  option: IOption | null,
  options: CreateGuiaOptions,
  guia: GuiaInCreateGuiaScreen
): GuiaInCreateGuiaScreen {
  // 1. Look for chofer option in options and set the chofer state
  const selectedChofer = options.choferes.find(
    (chofer) => chofer.value === option?.value
  )?.choferObject;

  // 2. Construct new Guia with the selected chofer
  const newGuia = { ...guia };
  newGuia.despacho.chofer =
    selectedChofer || createGuiaInitialStates.guia.despacho.chofer;

  // 3. Return new guia
  return newGuia;
}

export function selectCamionLogic(
  option: IOption | null,
  guia: GuiaInCreateGuiaScreen
): GuiaInCreateGuiaScreen {
  // 1. Look for camion option in options and set the camion state
  const selectedCamion = option?.value;

  // 2. Construct new Guia with the selected camion
  const newGuia = { ...guia };
  newGuia.despacho.patente =
    selectedCamion || createGuiaInitialStates.guia.despacho.patente;

  // 3. Return new guia
  return newGuia;
}
