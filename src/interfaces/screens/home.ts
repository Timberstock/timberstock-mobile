import { Receptor } from "@/interfaces/sii/guia";

export interface GuiaDespachoSummaryProps {
  id: string;
  folio: number;
  estado: string;
  monto_total_guia: number;
  receptor: Receptor;
  volumen_total_emitido: number;
  fecha: string;
  pdf_url: string;
}
