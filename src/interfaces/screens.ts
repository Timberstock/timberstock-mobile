import { Usuario } from './usuario';

export interface HomeScreenProps {
  navigation: any;
  GlobalState: {
    user: Usuario | null;
    rutEmpresa: string;
  };
}

export interface IOptions {
  value: string;
  label: string;
}
