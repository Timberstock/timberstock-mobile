interface Receptor {
  razon_social: string;
  rut: string;
}

export interface GuiaDespachoProps {
  //     {
  //       estado: 'emitida',
  //       fecha: 'December 24, 2022 at 1:02:28 PM UTC-3',
  //       folio: 1,
  //       monto: 2046414,
  //       receptor: {
  //         razon_social: 'COLLOTYPE LABELS CHILE SA',
  //         rut: '99563940-8',
  //       },
  //     },
  folio: number;
  estado: string;
  monto: number;
  receptor: Receptor;
  fecha: Date;
}

export interface GuiasScreenProps {
  navigation: any;
  GlobalState: {
    guias: GuiaDespachoProps[];
    setGuias: (value: GuiaDespachoProps[]) => void;
    rutEmpresa: string;
  };
}
