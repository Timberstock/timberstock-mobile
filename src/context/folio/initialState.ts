import { FolioState } from './types';

export const initialState: FolioState = {
  loading: false,
  error: null,
  lastSync: null,
  syncStatus: 'synced',
};
