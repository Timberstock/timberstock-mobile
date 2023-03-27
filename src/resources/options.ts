import { Predio, Producto, Proveedor } from '../interfaces/detalles';
import { Cliente } from '../interfaces/firestore';

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

export const clientesOptions = (clientes: Cliente[]) => {
  let razonSocialOptions = [];
  for (const cliente of clientes) {
    razonSocialOptions.push({
      value: cliente.razon_social,
      label: cliente.razon_social,
    });
  }
  return razonSocialOptions;
};

export const destinosOptions = (cliente: Cliente) => {
  let destinosOptions = [];
  for (const destino of cliente.destinos) {
    destinosOptions.push({
      value: destino,
      label: destino,
    });
  }
  return destinosOptions;
};

export const prediosOptions = (predios: Predio[]) => {
  let predioOptions = [];
  for (const predio of predios) {
    predioOptions.push({
      value: `${predio.comuna}-${predio.manzana}-${predio.rol}`,
      label: `${predio.comuna} - ${predio.nombre}`,
    });
  }
  return predioOptions;
};

export const productosOptions = (productos: Producto[]) => {
  let productosOptions = [];
  for (const producto of productos) {
    productosOptions.push({
      value: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo} - $${producto.precio_ref}c/u`,
      label: `${producto.especie} - ${producto.tipo} - ${producto.calidad} - ${producto.largo} - $${producto.precio_ref}c/u`,
    });
  }
  return productosOptions;
};

export const proveedoresOptions = (proveedores: Proveedor[]) => {
  let proveedoresOptions = [];
  for (const proveedor of proveedores) {
    proveedoresOptions.push({
      value: proveedor.razon_social,
      label: proveedor.razon_social,
    });
  }
  return proveedoresOptions;
};
