import { GuiaFormData } from '../guia-form/types';
import { ProductoFormData } from '../producto-form/types';
import { GuiaDespachoIncomplete } from './services/creation';

export type GuiaCreationStep = 'index' | 'guia-form' | 'producto-form';

export interface GuiaCreationState {
  currentStep: GuiaCreationStep;
  isSubmitting: boolean;
  error: string | null;
}

export type StatusCallback = (message: string) => void;

export type GuiaCreationAction =
  | { type: 'SET_STEP'; payload: GuiaCreationStep }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_CREATION' };

export interface GuiaCreationContextType {
  state: GuiaCreationState;
  submitGuia: (
    guia: GuiaDespachoIncomplete,
    onStatusChange?: StatusCallback
  ) => Promise<void>;
  combineGuiaProductoForms: (
    precioUnitarioGuia: number,
    guiaForm: GuiaFormData,
    productoForm: ProductoFormData
  ) => GuiaDespachoIncomplete;
  resetCreation: () => void;
}
