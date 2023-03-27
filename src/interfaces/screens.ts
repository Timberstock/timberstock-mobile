import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GuiaDespachoProps, GuiaDespachoSummaryProps } from './guias';
import { Usuario } from './usuario';
import { Predio, Producto, Proveedor } from '../interfaces/detalles';
import { Cliente } from './firestore';

export interface HomeScreenProps {
  navigation: any;
  GlobalState: {
    user: Usuario | null;
    guias: GuiaDespachoSummaryProps[];
    setGuias: (value: GuiaDespachoSummaryProps[]) => void;
    rutEmpresa: string;
  };
}

export interface IOptions {
  value: string;
  label: string;
}
