import { Receptor } from '@/interfaces/sii/guia';

export interface GuiaDespachoSummaryProps {
  folio: number;
  estado: string;
  monto_total_guia: number;
  receptor: Receptor;
  fecha: string;
  url: string;
}
