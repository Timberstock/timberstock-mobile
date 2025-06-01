import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { ContratoVenta } from '@/context/app/types/contratoVenta';
import { GuiaDespachoFirestore } from '@/context/app/types/guia';
import { GuiaFormData, GuiaFormOptions, GuiaFormState } from './types';

interface SelectionResult {
  newData: Partial<GuiaFormData>;
  newOptions: Partial<GuiaFormOptions>;
}

export class SelectorService {
  // Handles proveedor selection and updates dependent options
  static handleProveedorSelection(
    proveedor: GuiaFormOptions['proveedores'][number] | null,
    contratosCompra: ContratoCompra[]
  ): SelectionResult {
    if (!proveedor) {
      return {
        newData: { proveedor: null },
        newOptions: { faenas: [] },
      };
    }

    const faenas = contratosCompra
      .filter((contrato) => contrato.proveedor.rut === proveedor.rut)
      .map((contrato) => contrato.faena);

    const sortedFaenas = faenas.sort((a, b) => a.nombre.localeCompare(b.nombre));

    return {
      newData: { proveedor },
      newOptions: { faenas: sortedFaenas },
    };
  }

  // Handles faena selection and updates dependent options
  static handleFaenaSelection(
    faena: GuiaFormOptions['faenas'][number] | null,
    proveedor: GuiaFormData['proveedor'],
    contratosCompra: ContratoCompra[]
  ): SelectionResult {
    if (!faena) {
      return {
        newData: {
          faena: null,
          // Clear contrato_compra when faena changes
          contrato_compra_id: null,
        },
        newOptions: { clientes: [] },
      };
    }

    // Find the unique contratoCompra for this faena/proveedor combination
    const contratoCompra = contratosCompra.find(
      (contrato) =>
        contrato.faena.rol === faena.rol && contrato.proveedor.rut === proveedor!.rut
    );

    if (!contratoCompra)
      return {
        newData: {
          faena: null,
          // Clear contrato_compra when faena changes
          contrato_compra_id: null,
        },
        newOptions: { clientes: [] },
      };

    return {
      newData: {
        faena: contratoCompra.faena,
        // Set contrato_compra_id
        contrato_compra_id: contratoCompra.firestoreID,
      },
      newOptions: {
        // Parse clientes from this contratoCompra
        clientes: contratoCompra?.clientes.sort((a, b) =>
          a.razon_social.localeCompare(b.razon_social)
        ),
        servicios_carguio_empresas: contratoCompra?.servicios.carguio || [],
        servicios_cosecha_empresas: contratoCompra?.servicios.cosecha || [],
      },
    };
  }

  // Handles cliente/receptor selection and updates dependent options
  static handleClienteSelection(
    cliente: GuiaFormOptions['clientes'][number] | null
  ): SelectionResult {
    if (!cliente) {
      return {
        newData: {
          cliente: null,
        },
        newOptions: {
          destinos_contrato: [],
        },
      };
    }

    return {
      newData: {
        cliente: {
          rut: cliente.rut,
          razon_social: cliente.razon_social,
          giro: cliente.giro,
          direccion: cliente.direccion,
          comuna: cliente.comuna,
          destinos_contrato: cliente.destinos_contrato,
          destinos: cliente.destinos,
        },
      },
      newOptions: {
        // Parse destinos_contrato from cliente
        destinos_contrato: cliente.destinos_contrato.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        ),
      },
    };
  }

  // Handles destino_contrato selection and updates dependent options
  static handleDestinoContratoSelection(
    destino_contrato: GuiaFormOptions['destinos_contrato'][number] | null,
    contratosVenta: ContratoVenta[],
    faena: GuiaFormData['faena'],
    cliente: NonNullable<GuiaFormData['cliente']>
  ): SelectionResult {
    if (!destino_contrato) {
      return {
        newData: { destino_contrato: null },
        newOptions: {
          transporte_empresas: [],
        },
      };
    }

    const contratoVenta = contratosVenta.find(
      (contrato) =>
        contrato.cliente.rut === cliente!.rut &&
        contrato.cliente.destinos_contrato.some(
          (d) =>
            d.rol === destino_contrato!.rol &&
            d.faenas.some((f) => f.rol === faena!.rol)
        )
    );

    return {
      newData: {
        cliente: {
          ...cliente,
          giro: contratoVenta?.cliente.giro || '',
        },
        destino_contrato: {
          nombre: destino_contrato.nombre,
          comuna: destino_contrato.comuna,
          rol: destino_contrato.rol,
          georreferencia: destino_contrato.georreferencia,
          transportes: destino_contrato.transportes,
          productos: destino_contrato.productos,
        },
        contrato_venta_id: contratoVenta?.firestoreID,
        // Parse codigo_fsc from destino_contrato
        codigo_fsc:
          contratoVenta?.cliente.destinos_contrato
            .find((d) => d.rol === destino_contrato!.rol)
            ?.faenas.find((f) => f.rol === faena!.rol)?.codigo_fsc || null,
        // Parse codigo_contrato_externo from destino_contrato
        codigo_contrato_externo:
          contratoVenta?.cliente.destinos_contrato
            .find((d) => d.rol === destino_contrato!.rol)
            ?.faenas.find((f) => f.rol === faena!.rol)?.codigo_contrato_externo || null,
        guia_incluye_codigo_producto:
          contratoVenta?.guias_incluye_codigo_producto || false,
        guia_incluye_fecha_faena: contratoVenta?.guias_incluye_fecha_faena || false,
      },
      newOptions: {
        // Parse transportes from destino_contrato
        transporte_empresas: destino_contrato.transportes.sort((a, b) =>
          a.razon_social.localeCompare(b.razon_social)
        ),
      },
    };
  }

  // Handles transporte selection and updates dependent options
  static handleTransporteEmpresaSelection(
    transporte_empresa: GuiaFormOptions['transporte_empresas'][number] | null
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
          camiones: transporte_empresa.camiones,
          choferes: transporte_empresa.choferes,
          carros: transporte_empresa.carros,
          precio_unitario_transporte: transporte_empresa.precio_unitario_transporte,
        },
        transporte_empresa_chofer: null,
        transporte_empresa_camion: null,
        transporte_empresa_carro: null,
      },
      newOptions: {
        transporte_empresa_choferes: transporte_empresa.choferes.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        ),
        transporte_empresa_camiones: transporte_empresa.camiones.sort((a, b) =>
          a.patente.localeCompare(b.patente)
        ),
        // If carros is an array of strings, make it an array of objects with patente, otherwise keep it as is
        transporte_empresa_carros: transporte_empresa.carros.map((carro) =>
          typeof carro === 'string' ? { patente: carro } : carro
        ),
      },
    };
  }

  static initFromGuiaTemplate(
    guiaTemplate: GuiaDespachoFirestore,
    contratosCompra: ContratoCompra[],
    contratosVenta: ContratoVenta[],
    resetState: GuiaFormState
  ) {
    // Initialize formData and formOptions
    let formData = { ...resetState.guia };
    let formOptions = { ...resetState.options };

    // Select proveedor
    const proveedorSelection = SelectorService.handleProveedorSelection(
      formOptions.proveedores.find((p) => p.rut === guiaTemplate.proveedor?.rut)!,
      contratosCompra
    );

    formData = { ...formData, ...proveedorSelection.newData };
    formOptions = { ...formOptions, ...proveedorSelection.newOptions };

    // Select faena
    const faenaSelection = SelectorService.handleFaenaSelection(
      formOptions.faenas.find((f) => f.rol === guiaTemplate.predio_origen.rol)!,
      formData.proveedor!,
      contratosCompra
    );

    formData = { ...formData, ...faenaSelection.newData };
    formOptions = { ...formOptions, ...faenaSelection.newOptions };

    // Select cliente (choose cliente that matches receptor of guiaTemplate.guia in contratoCompra)
    const clienteSelection = SelectorService.handleClienteSelection(
      formOptions.clientes.find((cliente) => cliente.rut === guiaTemplate.receptor.rut)!
    );

    formData = { ...formData, ...clienteSelection.newData };
    formOptions = { ...formOptions, ...clienteSelection.newOptions };

    // Select destino_contrato (get destino_contrato from cliente.destinos_contrato)
    const destinoContratoSelection = SelectorService.handleDestinoContratoSelection(
      formOptions.destinos_contrato.find(
        (destino_contrato) => destino_contrato.rol === guiaTemplate.destino.rol
      )!,
      contratosVenta,
      formData.faena!,
      formData.cliente!
    );

    formData = { ...formData, ...destinoContratoSelection.newData };
    formOptions = { ...formOptions, ...destinoContratoSelection.newOptions };

    // Select transporte_empresa
    const transporteEmpresaSelection = SelectorService.handleTransporteEmpresaSelection(
      formOptions.transporte_empresas.find(
        (transporte_empresa) =>
          transporte_empresa.rut === guiaTemplate.transporte.empresa.rut
      )!
    );

    formData = { ...formData, ...transporteEmpresaSelection.newData };
    formOptions = { ...formOptions, ...transporteEmpresaSelection.newOptions };

    return { templateFormData: formData, templateFormOptions: formOptions };
  }

  static validateRepetirGuia(
    guia: GuiaDespachoFirestore,
    contratosCompra: ContratoCompra[],
    contratosVenta: ContratoVenta[]
  ): {
    isValid: boolean;
    contratoCompra: ContratoCompra | null;
    contratoVenta: ContratoVenta | null;
  } {
    // Check if both contratos exist and are valid
    const contratoCompra = contratosCompra.find(
      (c) => c.firestoreID === guia.contrato_compra_id && c.vigente
    );
    const contratoVenta = contratosVenta.find(
      (c) => c.firestoreID === guia.contrato_venta_id && c.vigente
    );

    return {
      isValid: Boolean(contratoCompra && contratoVenta),
      contratoCompra: contratoCompra || null,
      contratoVenta: contratoVenta || null,
    };
  }
}
