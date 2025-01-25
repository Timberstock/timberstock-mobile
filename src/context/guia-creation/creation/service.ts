// import { ContratoVenta } from '@/context/app/types/contratoVenta';
// import { GuiaFormData } from '../guia-form/types';

// export class GuiaCreationService {
//   static getContratoVenta(guiaForm: GuiaFormData, contratosVenta: ContratoVenta[]) {
//     return contratosVenta.find(
//       (contrato) =>
//         contrato.cliente.rut === guiaForm.proveedor!.rut &&
//         contrato.cliente.destinos_contrato.some(
//           (destino) =>
//             destino.rol === guiaForm.destino!.rol &&
//             destino.faenas.some((faena) => faena.rol === guiaForm.predio_origen!.rol)
//         )
//     );
//   }
// }
