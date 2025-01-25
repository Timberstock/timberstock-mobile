import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { ContratoVenta } from '@/context/app/types/contratoVenta';
import { GuiaFormData, GuiaFormOptions } from '../types';
import { ParserService } from './parser';

interface SelectionResult {
  newData: Partial<GuiaFormData>;
  newOptions: Partial<GuiaFormOptions>;
}

export class SelectorService {
  // Handles proveedor selection and updates dependent options
  static handleProveedorSelection(
    proveedor: ContratoCompra['proveedor'] | null,
    contratosCompra: ContratoCompra[]
  ): SelectionResult {
    if (!proveedor) {
      return {
        newData: { proveedor: null },
        newOptions: { predios: [] },
      };
    }

    return {
      newData: {
        proveedor: proveedor,
      },
      newOptions: {
        predios: ParserService.parsePrediosOptions(contratosCompra, proveedor),
      },
    };
  }

  // Handles predio selection and updates dependent options
  static handlePredioSelection(
    predio_origen: ContratoCompra['faena'] | null,
    proveedor: ContratoCompra['proveedor'],
    contratosCompra: ContratoCompra[]
  ): SelectionResult {
    if (!predio_origen) {
      return {
        newData: {
          predio_origen: null,
          contrato_compra_id: null, // Clear contrato_compra when predio_origen changes
        },
        newOptions: { clientes: [] },
      };
    }

    // Find the unique contratoCompra for this predio_origen/proveedor combination
    const contratoCompra = contratosCompra.find(
      (contrato) =>
        contrato.faena.rol === predio_origen.rol &&
        contrato.proveedor.rut === proveedor.rut
    );

    if (!contratoCompra)
      return {
        newData: {
          predio_origen: null,
          contrato_compra_id: null,
        },
        newOptions: { clientes: [] },
      };

    return {
      newData: {
        predio_origen: contratoCompra.faena,
        contrato_compra_id: contratoCompra.firestoreID, // Set the contrato_compra_id
      },
      newOptions: {
        clientes: ParserService.parseClientesOptions(contratoCompra),
      },
    };
  }

  // Handles cliente/receptor selection and updates dependent options
  static handleReceptorSelection(
    cliente: ContratoCompra['clientes'][number] | null
  ): SelectionResult {
    if (!cliente) {
      return {
        newData: {
          receptor: null,
        },
        newOptions: {
          destinos: [],
        },
      };
    }

    return {
      newData: {
        receptor: {
          rut: cliente.rut,
          razon_social: cliente.razon_social,
          giro: cliente.giro,
          direccion: cliente.direccion,
          comuna: cliente.comuna,
        },
      },
      newOptions: {
        destinos: ParserService.parseDestinosOptions(cliente),
      },
    };
  }

  // Handles destino selection and updates dependent options
  static handleDestinoSelection(
    destino: ContratoCompra['clientes'][number]['destinos_contrato'][number] | null,
    contratosVenta: ContratoVenta[],
    predio_origen: GuiaFormData['predio_origen'],
    receptor: GuiaFormData['receptor']
  ): SelectionResult {
    if (!destino) {
      return {
        newData: { destino: null },
        newOptions: {
          transporte_empresas: [],
        },
      };
    }

    const contratoVenta = contratosVenta.find(
      (contrato) =>
        contrato.cliente.rut === receptor!.rut &&
        contrato.cliente.destinos_contrato.some(
          (d) =>
            d.rol === destino!.rol &&
            d.faenas.some((faena) => faena.rol === predio_origen!.rol)
        )
    );

    return {
      newData: {
        destino: {
          nombre: destino.nombre,
          comuna: destino.comuna,
          rol: destino.rol,
          georreferencia: destino.georreferencia,
        },
        contrato_venta_id: contratoVenta?.firestoreID,
        codigo_fsc:
          contratoVenta?.cliente.destinos_contrato
            .find((d) => d.rol === destino!.rol)
            ?.faenas.find((faena) => faena.rol === predio_origen!.rol)?.codigo_fsc ||
          null,
        codigo_contrato_externo:
          contratoVenta?.cliente.destinos_contrato
            .find((d) => d.rol === destino!.rol)
            ?.faenas.find((faena) => faena.rol === predio_origen!.rol)
            ?.codigo_contrato_externo || null,
      },
      newOptions: {
        transporte_empresas: ParserService.parseTransportesOptions(destino),
      },
    };
  }

  // Handles transporte selection and updates dependent options
  static handleTransporteEmpresaSelection(
    transporte_empresa:
      | ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]
      | null
  ): SelectionResult {
    if (!transporte_empresa) {
      return {
        newData: {
          transporte_empresa: null,
        },
        newOptions: {
          transporte_empresa_choferes: [],
          transporte_empresa_camiones: [],
          transporte_empresa_carros: [],
        },
      };
    }

    return {
      newData: {
        transporte_empresa: {
          rut: transporte_empresa.rut,
          razon_social: transporte_empresa.razon_social,
        },
        transporte_empresa_chofer: null,
        transporte_empresa_camion: null,
        transporte_empresa_carro: null,
      },
      newOptions: {
        transporte_empresa_choferes:
          ParserService.parseChoferesOptions(transporte_empresa),
        transporte_empresa_camiones:
          ParserService.parseCamionesOptions(transporte_empresa),
        transporte_empresa_carros: ParserService.parseCarrosOptions(transporte_empresa),
      },
    };
  }
}
