import { globals } from '@/utils/globals';
import { getAllDependentFields } from './initialState';
import { GuiaFormAction, GuiaFormData, GuiaFormState } from './types';

export function guiaFormReducer(
  state: GuiaFormState,
  action: GuiaFormAction
): GuiaFormState {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      globals.logTimeDelta('Reducer-Start');

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
          newGuia[depField as keyof GuiaFormData] = null;
        }
      });

      const result = {
        ...state,
        guia: newGuia,
        options: selectionResult?.newOptions
          ? { ...state.options, ...selectionResult.newOptions }
          : state.options,
      };

      globals.logTimeDelta('Reducer-End');
      return result;
    }

    case 'RESET_VIEW':
      return action.payload;

    default:
      return state;
  }
}
