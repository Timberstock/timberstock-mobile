export type clasesDiametricas = {
  [key: string]: number;
};

export type AserrableType = {
  clasesDiametricas: clasesDiametricas;
  updateClaseDiametricaValue: (label: string, value: number) => void;
  increaseNumberOfClasesDiametricas: () => void;
};

export interface Banco {
  altura1: number;
  altura2: number;
  ancho: number;
}

export interface BancosPulpable {
  banco1: Banco;
  banco2: Banco;
  banco3: Banco;
  banco4: Banco;
  banco5: Banco;
  banco6: Banco;
}

export type updateBancoPulpableValue = (
  bancoIndex: number,
  dimension: keyof Banco,
  value: number
) => void;

export type PulpableType = {
  bancosPulpable: BancosPulpable;
  updateBancoPulpableValue: updateBancoPulpableValue;
};
