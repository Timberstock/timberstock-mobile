import {
  Camion,
  Chofer,
  ContratoCompra,
  TransporteDestinoContratoCompra,
} from '../interfaces/contratos/contratoCompra';
import { ContratoVenta } from '../interfaces/contratos/contratoVenta';
import { Predio, Producto, Proveedor } from '../interfaces/detalles';
import { Cliente, FaenaFirestore } from '../interfaces/firestore';

export const tipoDespachoOptions = [
  { value: 'Por cuenta del receptor', label: 'Cuenta Receptor' },
  {
    value: 'Por cuenta del emisor a instalaciones cliente',
    label: 'Cuenta Emisor a Instalaciones Cliente',
  },
  {
    value: 'Por cuenta del emisor a otras instalaciones',
    label: 'Cuenta Emisor Otras Instalaciones',
  },
];

export const tipoTrasladoOptions = [
  { value: 'Constituye venta', label: 'Venta' },
  { value: 'Venta por efectuar', label: 'Venta x Efectuar' },
  { value: 'Consignación', label: 'Consignación' },
  { value: 'Entrega gratuita', label: 'Gratuito' },
  { value: 'Traslados internos', label: 'Interno' },
  { value: 'Otros traslados no venta', label: 'Otros' },
];

export const claseDiametricaOptions = [
  { value: '18', label: '18cm' },
  { value: '20', label: '20cm' },
  { value: '22', label: '22cm' },
  { value: '24', label: '24cm' },
  { value: '26', label: '26cm' },
  { value: '28', label: '28cm' },
  { value: '30', label: '30cm' },
];

export const tipoOptions = [
  { value: 'Aserrable', label: 'Aserrable' },
  { value: 'Pulpable', label: 'Pulpable' },
];

export const parseClientesFromContratosVenta = (
  contratosVenta: ContratoVenta[]
) => {
  let clientes: Cliente[] = [];
  for (const contratoVenta of contratosVenta) {
    if (contratoVenta.cliente) clientes.push(contratoVenta.cliente);
  }
  let razonSocialOptions = [];
  for (const cliente of clientes) {
    razonSocialOptions.push({
      value: cliente.razon_social,
      label: cliente.razon_social,
    });
  }
  return razonSocialOptions;
};

export const parseFaenasFromContratosVenta = (
  contratosVenta: ContratoVenta[]
) => {
  let faenas: FaenaFirestore[] = [];
  for (const contratoVenta of contratosVenta) {
    for (const faena of contratoVenta.faenas) {
      if (faena) faenas.push(faena);
    }
  }

  // from ChatGPT Consensus
  let faenasOptions: { value: string; label: string }[] = [];
  const seenValues = new Set<string>();
  for (const faena of faenas) {
    const value = `${faena.comuna} | ${faena.rol}`;
    if (!seenValues.has(value)) {
      seenValues.add(value);
      faenasOptions.push({ value, label: `${faena.comuna} | ${faena.nombre}` });
    }
  }
  return faenasOptions;
};

export const getProductosOptions = (
  productos: Producto[],
  tipo: string | null
) => {
  let productosOptions = [];
  for (const producto of productos) {
    if (producto.tipo == tipo) {
      console.log(producto.tipo);
      productosOptions.push({
        value: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo} - $${producto.precio_ref}c/u`,
        label: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo} - $${producto.precio_ref}c/u`,
      });
    }
  }
  return productosOptions;
};

export const parseProveedoresFromContratosCompra = (
  contratosCompra: ContratoCompra[]
) => {
  let proveedores: Proveedor[] = [];
  for (const contratoCompra of contratosCompra) {
    if (contratoCompra.proveedor) proveedores.push(contratoCompra.proveedor);
  }
  let proveedoresOptions = [];
  for (const proveedor of proveedores) {
    proveedoresOptions.push({
      value: proveedor.razon_social,
      label: proveedor.razon_social,
    });
  }
  return proveedoresOptions;
};

export const parseTransportesOptionsFromContratosCompra = (
  contratosCompra: ContratoCompra[],
  direccionDestino: string
) => {
  let transportes: TransporteDestinoContratoCompra[] = [];
  for (const contratoCompra of contratosCompra) {
    for (const cliente of contratoCompra.clientes) {
      for (const destino of cliente.destinos_contrato) {
        if (destino.transportes && destino.nombre === direccionDestino)
          transportes = destino.transportes;
      }
    }
  }
  let transportesOptions = [];
  for (const transporte of transportes) {
    transportesOptions.push({
      value: transporte.rut,
      label: `${transporte.razon_social} - ${transporte.rut}`,
      transporteObject: transporte,
    });
  }
  return transportesOptions;
};

// export const parsedChoferesYCamionesFromTransporte = (
//   contratosCompra: ContratoCompra[],
//   empresaTransporteRUT: string,
//   direccionDestino: string
// ) => {
//   let choferes: Chofer[] = [];
//   let camiones: Camion[] = [];
//   for (const contratoCompra of contratosCompra) {
//     for (const cliente of contratoCompra.clientes) {
//       for (const destino of cliente.destinos_contrato) {
//         if (destino.empresa_transporte && destino.nombre === direccionDestino) {
//           choferes = destino.empresa_transporte.choferes;
//           camiones = destino.empresa_transporte.camiones;
//         }
//       }
//     }
//   }

//   let choferesOptions = [];
//   let camionesOptions = [];
//   for (const chofer of choferes) {
//     choferesOptions.push({
//       value: chofer.rut,
//       label: chofer.nombre,
//     });
//   }
//   for (const camion of camiones) {
//     camionesOptions.push({
//       value: camion.patente,
//       label: camion.patente,
//     });
//   }
// };

export const getFoliosOptions = (folios: number[]) => {
  let foliosOpts = [];
  for (const folio of folios) {
    foliosOpts.push({
      value: folio.toString(),
      label: folio.toString(),
    });
  }
  return foliosOpts;
};

// OLD VERSION
// export const clientesOptions = (clientes: Cliente[]) => {
//   let razonSocialOptions = [];
//   for (const cliente of clientes) {
//     razonSocialOptions.push({
//       value: cliente.razon_social,
//       label: cliente.razon_social,
//     });
//   }
//   return razonSocialOptions;
// };

// export const destinosOptions = (cliente: Cliente) => {
//   let destinosOptions = [];
//   for (const destino of cliente.destinos) {
//     destinosOptions.push({
//       value: destino,
//       label: destino,
//     });
//   }
//   return destinosOptions;
// };

// export const prediosOptions = (predios: Predio[]) => {
//   let predioOptions = [];
//   for (const predio of predios) {
//     predioOptions.push({
//       value: `${predio.comuna}-${predio.manzana}-${predio.rol}`,
//       label: `${predio.comuna} - ${predio.nombre}`,
//     });
//   }
//   return predioOptions;
// };

// export const getProductosOptions = (
//   productos: Producto[],
//   tipo: string | null
// ) => {
//   let productosOptions = [];
//   for (const producto of productos) {
//     if (producto.tipo == tipo) {
//       console.log(producto.tipo);
//       productosOptions.push({
//         value: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo} - $${producto.precio_ref}c/u`,
//         label: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo} - $${producto.precio_ref}c/u`,
//       });
//     }
//   }
//   return productosOptions;
// };

// export const proveedoresOptions = (proveedores: Proveedor[]) => {
//   let proveedoresOptions = [];
//   for (const proveedor of proveedores) {
//     proveedoresOptions.push({
//       value: proveedor.razon_social,
//       label: proveedor.razon_social,
//     });
//   }
//   return proveedoresOptions;
// };
