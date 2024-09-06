import {
  ClaseDiametricaContratoCompra,
  ProductoContratoCompra,
} from "@/interfaces/contratos/contratoCompra";
import {
  ClaseDiametricaContratoVenta,
  ProductoContratoVenta,
} from "@/interfaces/contratos/contratoVenta";
import { Producto } from "@/interfaces/esenciales";
import { IOption } from "@/interfaces/screens/screens";

export interface IOptionTipoProducto {
  value: "Aserrable" | "Pulpable" | "";
  label: "Aserrable" | "Pulpable" | "";
}

export interface IOptionProducto extends IOption {
  productoObject: ProductoOptionObject;
}

export interface ProductoOptionObject
  extends ProductoContratoCompra,
    ProductoContratoVenta {
  // Precios of MR come combined by extending ProductoContratoCompra and ProductoContratoVenta
  clases_diametricas?: ClaseDiametricaContratos[];
}

// Combine prices from ContratoCompra and ContratoVenta for the corresponding ClaseDiametrica of the corresponding Producto
export interface ClaseDiametricaContratos
  extends ClaseDiametricaContratoCompra,
    ClaseDiametricaContratoVenta {}

export interface ProductoScreenOptions {
  tipo: IOptionTipoProducto[];
  productos: IOptionProducto[];
}

export interface ClaseDiametrica {
  clase: string;
}
export interface Banco {
  altura1: number;
  altura2: number;
  ancho: number;
}
