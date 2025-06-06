import {
  ClaseDiametricaContratoCompra,
  ContratoCompra,
} from '@/context/app/types/contratoCompra';
import {
  ClaseDiametricaContratoVenta,
  ContratoVenta,
} from '@/context/app/types/contratoVenta';
import { Alert } from 'react-native';
import { GuiaFormData } from '../../guia-form/types';
import { initialize_bancos, productoFormDataInitialState } from '../initialState';
import { ProductoFormData, ProductoFormOptions } from '../types';

export class ParserService {
  static parseTiposOptions(
    productosOptions: ProductoFormOptions['productos']
  ): ProductoFormOptions['tipos'] {
    const tipos = [];

    if (productosOptions.some((producto) => producto.tipo === 'Aserrable')) {
      tipos.push({ label: 'Aserrable', object: 'Aserrable' });
    }

    if (productosOptions.some((producto) => producto.tipo === 'Pulpable')) {
      tipos.push({ label: 'Pulpable', object: 'Pulpable' });
    }

    return tipos;
  }

  static parseProductosOptions(
    guiaForm: GuiaFormData,
    contratosCompra: ContratoCompra[],
    contratosVenta: ContratoVenta[]
  ): ProductoFormOptions['productos'] {
    const contratoVenta = contratosVenta.find(
      (contrato) => contrato.firestoreID === guiaForm.contrato_venta_id
    );
    const contratoCompra = contratosCompra.find(
      (contrato) => contrato.firestoreID === guiaForm.contrato_compra_id
    );

    if (!contratoVenta || !contratoCompra) {
      console.warn('Missing contratos for productos parsing');
      return [];
    }

    const productosContratoVenta = contratoVenta?.cliente.destinos_contrato
      .find((d) => d.nombre === guiaForm.destino_contrato?.nombre)
      ?.faenas.find((f) => f.rol === guiaForm.faena?.rol)?.productos_destino_contrato;

    if (!productosContratoVenta?.length) {
      console.warn('No productos found in contrato venta');
      return [];
    }

    const productosContratoCompra = contratoCompra?.clientes
      .find((c) => c.rut === guiaForm.cliente?.rut)
      ?.destinos_contrato.find(
        (d) => d.nombre === guiaForm.destino_contrato?.nombre
      )?.productos;

    // Find productos in common, map to option format and add precio compra
    const productos = productosContratoVenta
      // Get productos in common (will have venta)
      ?.filter((producto) =>
        productosContratoCompra?.some((pc) => pc.codigo === producto.codigo)
      )
      // Add precio compra to productoVenta and map to option format
      .map((productoVenta) => {
        const productoCompra = productosContratoCompra?.find(
          (pc) => pc.codigo === productoVenta.codigo
        );

        const newProductoFormDataOption: ProductoFormData = {
          ...productoFormDataInitialState,
          tipo: productoVenta.tipo,
          label: `${productoVenta.especie} ${productoVenta.calidad} ${productoVenta.largo}`,
          info: {
            codigo: productoVenta.codigo,
            especie: productoVenta.especie,
            calidad: productoVenta.calidad,
            largo: productoVenta.largo,
            unidad: productoVenta.unidad,
          },
        };

        switch (productoVenta.tipo) {
          case 'Pulpable':
            console.log(productoVenta);
            console.log('Pulpable');
            newProductoFormDataOption.precio_unitario_venta_mr =
              productoVenta.precio_unitario_venta_mr;
            newProductoFormDataOption.precio_unitario_compra_mr =
              productoCompra!.precio_unitario_compra_mr!;
            newProductoFormDataOption.bancos = initialize_bancos();
            break;
          case 'Aserrable':
            console.log('Aserrable');
            console.log(productoVenta);
            newProductoFormDataOption.clases_diametricas_guia =
              ParserService._parsePreciosIntoClasesDiametricas(
                productoCompra!.clases_diametricas!,
                productoVenta.clases_diametricas!
              );
            break;
        }

        return newProductoFormDataOption;
      });

    if (!productos) {
      Alert.alert('No hay productos en común');
      return [];
    }

    console.log('productos', productos);
    return productos;
  }

  static _parsePreciosIntoClasesDiametricas(
    precios_compra_clases_diametricas: ClaseDiametricaContratoCompra[],
    precios_venta_clases_diametricas: ClaseDiametricaContratoVenta[]
  ): NonNullable<ProductoFormData['clases_diametricas_guia']> {
    const lowerLimit = 14;
    const upperLimit = 50;

    const newArray: NonNullable<ProductoFormData['clases_diametricas_guia']> = [];

    for (let i = lowerLimit; i <= upperLimit; i += 2) {
      let precioCompra = precios_compra_clases_diametricas.find(
        (pc) => pc.clase === i.toString()
      )?.precio_unitario_compra_clase;
      let precioVenta = precios_venta_clases_diametricas.find(
        (pv) => pv.clase === i.toString()
      )?.precio_unitario_venta_clase;

      newArray.push({
        clase: i.toString(),
        cantidad_emitida: 0,
        volumen_emitido: 0,
        precio_unitario_compra_clase: precioCompra!,
        precio_unitario_venta_clase: precioVenta!,
      });
    }
    return newArray;
  }
}
