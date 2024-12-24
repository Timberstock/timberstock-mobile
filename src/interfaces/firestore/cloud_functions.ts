import { CAF } from "../context/user";

export interface requestReservarFoliosResponse {
  status: string;
  message: string;
  folios_reservados: number[];
  cafs: CAF[];
}
