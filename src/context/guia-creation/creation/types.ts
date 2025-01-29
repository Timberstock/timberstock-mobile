import { GuiaFormData } from '../guia-form/types';
import { ProductoFormData } from '../producto-form/types';
import { GuiaDespachoIncomplete } from './services/creation';

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
  submitGuia: (guiaDespachoIncomplete: GuiaDespachoIncomplete) => Promise<void>;
  resetCreation: () => void;
  combineGuiaProductoForms: (
    precioUnitarioGuia: number,
    guiaForm: GuiaFormData,
    productoForm: ProductoFormData
  ) => GuiaDespachoIncomplete;
}
