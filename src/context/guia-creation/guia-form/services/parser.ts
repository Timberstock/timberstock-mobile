import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { SelectorOption } from '../types';

export class ParserService {
  static parseFoliosOptions = (
    folios_reservados: number[]
  ): SelectorOption<number>[] => {
    return folios_reservados
      .map((folio) => ({
        value: folio.toString(),
        label: folio.toString(),
        optionObject: folio,
      }))
      .sort((a, b) => a.value.localeCompare(b.label));
  };

  // Gets unique proveedores from all contratos and formats them as options
  static parseProveedoresOptions = (
    contratosCompra: ContratoCompra[]
  ): SelectorOption<ContratoCompra['proveedor']>[] => {
    const uniqueProveedores = new Map<string, ContratoCompra['proveedor']>();

    contratosCompra.forEach((contrato) => {
      const { rut } = contrato.proveedor;
      if (!uniqueProveedores.has(rut)) {
        uniqueProveedores.set(rut, contrato.proveedor);
      }
    });

    return Array.from(uniqueProveedores.values())
      .map((proveedor) => ({
        value: proveedor.rut,
        label: proveedor.razon_social,
        optionObject: proveedor,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all predios associated with a specific proveedor
  static parsePrediosOptions = (
    contratosCompra: ContratoCompra[],
    proveedor: ContratoCompra['proveedor']
  ): SelectorOption<ContratoCompra['faena']>[] => {
    const contratosProveedor = contratosCompra.filter(
      (contrato) => contrato.proveedor.rut === proveedor.rut
    );

    return contratosProveedor
      .map((contrato) => ({
        value: contrato.faena.rol,
        label: `${contrato.faena.nombre} | ${contrato.faena.comuna}`,
        optionObject: contrato.faena,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all clientes available for a specific proveedor and predio combination
  static parseClientesOptions = (
    contratoCompra: ContratoCompra
  ): SelectorOption<ContratoCompra['clientes'][number]>[] => {
    if (!contratoCompra) return [];

    return contratoCompra.clientes
      .map((cliente) => ({
        value: cliente.rut,
        label: cliente.razon_social,
        optionObject: cliente,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all destinos available for a specific cliente
  static parseDestinosOptions = (
    cliente: ContratoCompra['clientes'][number]
  ): SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]
  >[] => {
    return cliente.destinos_contrato
      .map((destino) => ({
        value: destino.nombre,
        label: destino.nombre,
        optionObject: destino,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all transportes available for a specific destino
  static parseTransportesOptions = (
    destino: ContratoCompra['clientes'][number]['destinos_contrato'][number]
  ): SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]
  >[] => {
    return destino.transportes
      .map((transporte) => ({
        value: transporte.rut,
        label: `${transporte.razon_social} - ${transporte.rut}`,
        optionObject: transporte,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all choferes available for a specific transporte
  static parseChoferesOptions = (
    transporte: ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]
  ): SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['choferes'][number]
  >[] => {
    return transporte.choferes
      .map((chofer) => ({
        value: chofer.rut,
        label: `${chofer.nombre} - ${chofer.rut}`,
        optionObject: chofer,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all camiones available for a specific transporte
  static parseCamionesOptions = (
    transporte: ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]
  ): SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['camiones'][number]
  >[] => {
    return transporte.camiones
      .map((camion) => ({
        value: camion.patente,
        label: camion.patente,
        optionObject: camion,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Gets all carros available for a specific transporte
  static parseCarrosOptions = (
    transporte: ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]
  ): SelectorOption<
    ContratoCompra['clientes'][number]['destinos_contrato'][number]['transportes'][number]['carros'][number]
  >[] => {
    return transporte.carros
      .map((carro) => ({
        value: carro,
        label: carro,
        optionObject: carro,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };
}
