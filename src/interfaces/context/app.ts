import { Emisor } from "@/interfaces/sii/guia";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { Cliente, Faena, Producto, Proveedor } from "@/interfaces/esenciales";

export interface Empresa {
  razon_social: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
  actividad_economica: number[];
  fecha_resolucion_sii: FirebaseFirestoreTypes.Timestamp;
  numero_resolucion_sii: string;
}

export interface EmpresaSubCollectionsData {
  clientes: Cliente[];
  faenas: Faena[];
  productos: Producto[];
  proveedores: Proveedor[];
}
