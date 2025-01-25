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
import { INITIAL_BANCOS, productoFormDataInitialState } from '../initialState';
import { ProductoFormData, SelectorOption } from '../types';

export class ParserService {
  static parseTiposOptions(
    productos: SelectorOption<ProductoFormData>[]
  ): SelectorOption<'Aserrable' | 'Pulpable'>[] {
    const tipos = productos.map((producto) => producto.optionObject?.tipo);
    const uniqueTipos = [...new Set(tipos)];
    return uniqueTipos.map((tipo) => ({
      value: tipo!,
      label: tipo!,
      optionObject: tipo!,
    }));
  }

  static parseProductosOptions(
    guiaForm: GuiaFormData,
    contratosCompra: ContratoCompra[],
    contratosVenta: ContratoVenta[]
  ): SelectorOption<ProductoFormData>[] {
    console.log('🔄 Parsing productos options');
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
      .find((destino) => destino.nombre === guiaForm.destino?.nombre)
      ?.faenas.find(
        (faena) => faena.rol === guiaForm.predio_origen?.rol
      )?.productos_destino_contrato;

    if (!productosContratoVenta?.length) {
      console.warn('No productos found in contrato venta');
      return [];
    }

    const productosContratoCompra = contratoCompra?.clientes
      .find((cliente) => cliente.rut === guiaForm.receptor?.rut)
      ?.destinos_contrato.find(
        (destino) => destino.nombre === guiaForm.destino?.nombre
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
            newProductoFormDataOption.precio_unitario_venta_mr =
              productoVenta.precio_unitario_venta_mr;
            newProductoFormDataOption.precio_unitario_compra_mr =
              productoCompra!.precio_unitario_compra_mr!;
            newProductoFormDataOption.bancos = [...INITIAL_BANCOS];
            break;
          case 'Aserrable':
            newProductoFormDataOption.clases_diametricas_guia =
              ParserService._parsePreciosIntoClasesDiametricas(
                productoCompra!.clases_diametricas!,
                productoVenta.clases_diametricas!
              );
            break;
        }

        return {
          value: productoVenta.codigo,
          label: `${productoVenta.codigo} - ${productoVenta.especie} - ${productoVenta.calidad} - ${productoVenta.largo}`,
          optionObject: newProductoFormDataOption,
        };
      });

    if (!productos) {
      Alert.alert('No hay productos en común');
      return [];
    }

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
