import { ProductoFormData, ProductoFormOptions, ProductoFormState } from './types';

export const productoFormDataInitialState: ProductoFormData = {
  tipo: null,
  label: null,
  info: null,
  clases_diametricas_guia: null,
  bancos: null,
  precio_unitario_venta_mr: null,
  precio_unitario_compra_mr: null,
  volumen_total_emitido: 0,
};

export const productoFormOptionsInitialState: ProductoFormOptions = {
  tipos: [],
  productos: [], // This will be populated based on tipo selection and contratos
};

export const productoFormInitialState: ProductoFormState = {
  productoForm: { ...productoFormDataInitialState },
  options: { ...productoFormOptionsInitialState },
};

export const INITIAL_BANCOS = [
  { altura1: 0, altura2: 0, ancho: 250, volumen_banco: 0 },
  { altura1: 0, altura2: 0, ancho: 250, volumen_banco: 0 },
  { altura1: 0, altura2: 0, ancho: 250, volumen_banco: 0 },
  { altura1: 0, altura2: 0, ancho: 250, volumen_banco: 0 },
  { altura1: 0, altura2: 0, ancho: 250, volumen_banco: 0 },
  { altura1: 0, altura2: 0, ancho: 250, volumen_banco: 0 },
];
