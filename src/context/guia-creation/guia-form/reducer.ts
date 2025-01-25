import { getAllDependentFields } from './initialState';
import { GuiaFormAction, GuiaFormData, GuiaFormState, SelectorOption } from './types';

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
        (newGuia[field] as SelectorOption['optionObject'] | null) = value;
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

      return {
        ...state,
        guia: newGuia,
        options: selectionResult?.newOptions
          ? { ...state.options, ...selectionResult.newOptions }
          : state.options,
      };
    }

    case 'RESET_VIEW':
      return action.payload;

    default:
      return state;
  }
}
