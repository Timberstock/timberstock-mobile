import { Receptor } from '@/interfaces/sii/guia';

export interface GuiaDespachoSummaryProps {
  folio: number;
  estado: string;
  monto_total_guia: number;
  receptor: Receptor;
  volumen_emitido: number;
  fecha: string;
  url: string;
}
