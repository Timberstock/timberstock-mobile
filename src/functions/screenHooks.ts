import { useState } from 'react';
import { Proveedor, Predio } from '../interfaces/detalles';
import {
  Identificacion,
  Receptor,
  Transporte,
  Chofer,
} from '../interfaces/guias';
import { IOptions } from '../interfaces/screens';
import {
  CreateGuiaOptions,
  GuiaInCreateGuiaScreen,
  IOptionsTransportes,
} from '../interfaces/screens/createGuia';
import { tipoDespachoOptions, tipoTrasladoOptions } from '../resources/options';
import { Banco } from '../interfaces/productos';
import { ContratoCompra } from '../interfaces/contratos/contratoCompra';
import { ContratoVenta } from '../interfaces/contratos/contratoVenta';

export const tipoProductHooks = () => {
  // case tipo == 'Aserrable'
  const [clasesDiametricas, _setClasesDiametricas] = useState({
    14: 0,
    16: 0,
    18: 0,
    20: 0,
  });

  const updateClaseDiametricaValue = (label: string, value: number) => {
    // Values are to be updated one row at a time, which are identified by the label
    _setClasesDiametricas((prevValue: any) => ({
      ...prevValue,
      [label]: value,
    }));
  };

  const increaseNumberOfClasesDiametricas = () => {
    // get the number of clases diametricas and starting with 14, add a new row that's 2cm bigger that the last one
    _setClasesDiametricas((prevValue: any) => {
      const numberOfClasesDiametricas = Object.keys(prevValue).length;
      const biggestClaseDiametrica = 14 + 2 * (numberOfClasesDiametricas - 1);
      return {
        ...prevValue,
        [`${biggestClaseDiametrica + 2}`]: 0,
      };
    });
  };

  // case tipo == 'Pulpable'
  const [bancosPulpable, _setBancosPulpable] = useState({
    banco1: {
      altura1: 0,
      altura2: 0,
      ancho: 0,
    },
    banco2: {
      altura1: 0,
      altura2: 0,
      ancho: 0,
    },
    banco3: {
      altura1: 0,
      altura2: 0,
      ancho: 0,
    },
    banco4: {
      altura1: 0,
      altura2: 0,
      ancho: 0,
    },
    banco5: {
      altura1: 0,
      altura2: 0,
      ancho: 0,
    },
    banco6: {
      altura1: 0,
      altura2: 0,
      ancho: 0,
    },
  });

  const updateBancoPulpableValue = (
    bancoIndex: number,
    dimension: keyof Banco,
    value: number
  ) => {
    // const prevValue = [...bancosPulpable];
    // prevValue[bancoIndex][dimension] = value;
    _setBancosPulpable((prevState) => ({
      ...prevState,
      [`banco${bancoIndex}`]: {
        ...prevState[`banco${bancoIndex}` as keyof typeof prevState],
        [dimension]: value,
      },
    }));
  };

  return {
    clasesDiametricas,
    updateClaseDiametricaValue,
    increaseNumberOfClasesDiametricas,
    bancosPulpable,
    updateBancoPulpableValue,
  };
};
