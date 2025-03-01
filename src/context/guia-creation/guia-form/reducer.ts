import { getAllDependentFields } from './initialState';
import { GuiaFormAction, GuiaFormData, GuiaFormState } from './types';

export function guiaFormReducer(
  state: GuiaFormState,
  action: GuiaFormAction
): GuiaFormState {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const { field, value, selectionResult } = action.payload;
      const dependentFields = getAllDependentFields(field);
      const newGuia = { ...state.guia };

      // Apply the main field update if no selectionResult is provided
      if (!selectionResult) {
        (newGuia[field] as GuiaFormData[keyof GuiaFormData] | null) = value;
      }

      // Apply additional updates from selection logic
      if (selectionResult?.newData) {
        Object.assign(newGuia, selectionResult.newData);
      }

      // Clear dependent fields that weren't set by selection logic
      dependentFields.forEach((depField) => {
        if (!(depField in (selectionResult?.newData || {}))) {
          newGuia[depField as keyof Omit<GuiaFormData, 'observaciones'>] = null;
        }
      });

      const result = {
        ...state,
        guia: newGuia,
        options: selectionResult?.newOptions
          ? { ...state.options, ...selectionResult.newOptions }
          : state.options,
      };

      return result;
    }

    case 'RESET_VIEW':
      return action.payload;

    default:
      return state;
  }
}
