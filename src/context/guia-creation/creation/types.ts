import { ProductoFormData } from '../producto-form/types';

import { ContratoCompra } from '@/context/app/types/contratoCompra';
import { ContratoVenta } from '@/context/app/types/contratoVenta';
import { GuiaFormData } from '../guia-form/types';

export type GuiaCreationStep = 'index' | 'guia-form' | 'producto-form' | 'preview';

export interface GuiaCreationState {
  currentStep: GuiaCreationStep;
  error: string | null;
  isSubmitting: boolean;
}

export type GuiaCreationAction =
  | { type: 'SET_STEP'; payload: GuiaCreationStep }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_CREATION' };

export interface GuiaCreationContextType {
  state: GuiaCreationState;
  moveToNextStep: (
    // Any for now, but will be used to pass
    resetNextStepFunc: (
      contratoCompra?: ContratoCompra,
      contratoVenta?: ContratoVenta
    ) => void,
    guiaForm?: GuiaFormData,
    productoForm?: ProductoFormData
  ) => void;
  moveToPreviousStep: () => void;
  submitGuia: () => Promise<void>;
  resetCreation: () => void;
}
