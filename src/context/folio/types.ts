export interface CAF {
  id: string;
  D: number;
  H: number;
  text: string;
}

export interface FolioState {
  loading: boolean;
  error: string | null;
  lastSync: number | null;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface ReserveFoliosCloudFunctionResponse {
  status: string;
  message: string;
  folios_reservados: number[];
  cafs: CAF[];
}

export interface ReserveFoliosResult {
  success: boolean;
  foliosReservados?: number[];
  cafs?: CAF[];
  error?: string;
}

export interface FolioContextType {
  state: FolioState;
  reserveFolios: (cantidad: number) => Promise<ReserveFoliosResult>;
  liberarFolios: () => Promise<boolean>;
}

export type FolioAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SYNC_STATUS'; payload: 'synced' | 'pending' | 'error' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };
