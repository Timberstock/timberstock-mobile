import { createContext, useState, useEffect, useContext } from 'react';
import { Proveedor, Predio } from '../interfaces/detalles';
import {
  Identificacion,
  Receptor,
  Transporte,
  Chofer,
} from '../interfaces/guias';
import { IOptions, IOptionsTransportes } from '../interfaces/screens';
import {
  foliosOptions,
  parseClientesFromContratosVenta,
  parseFaenasFromContratosVenta,
  parseProveedoresFromContratosCompra,
  parseTransportesOptionsFromContratosCompra,
  tipoDespachoOptions,
  tipoTrasladoOptions,
} from '../resources/options';
import { Cliente, ContratoVenta } from '../interfaces/contratos/contratoVenta';
import { ContratoCompra } from '../interfaces/contratos/contratoCompra';
import { Usuario } from '../interfaces/usuario';
import { FaenaFirestore } from '../interfaces/firestore';
import { AppContext } from './AppContext';
import { UserContext } from './UserContext';

type CreateGuiaContextType = {
  // options: Options;
  identificacion: Identificacion;
  updateIdentificacion: (identificacion: Identificacion) => void;
  receptor: Receptor;
  despacho: Transporte;
  updateDespacho: (despacho: Transporte) => void;
  predio: FaenaFirestore;
  proveedor: Proveedor;
  handleSelectClienteLogic: (
    option: IOptions | null,
    direccionDespachoRef: any,
    predioRef: any,
    proveedorRef: any,
    empresaTransporteRef: any,
    choferRef: any,
    camionRef: any
  ) => void;
  handleSelectPredioLogic: (
    option: IOptions | null,
    proveedorRef: any,
    empresaTransporteRef: any,
    choferRef: any,
    camionRef: any
  ) => void;
  handleSelectProveedorLogic: (
    option: IOptions | null,
    empresaTransporteRef: any,
    camionRef: any,
    choferRef: any
  ) => void;
  handleSelectEmpresaTransporteLogic: (
    option: IOptionsTransportes | null,
    contratosCompraFiltered: ContratoCompra[],
    empresaTransporteRef: any,
    camionRef: any,
    choferRef: any
  ) => void;
  contratosCompraFiltered: ContratoCompra[];
  contratosVentaFiltered: ContratoVenta[];
};

const initialState = {
  // options: {
  //   tipoDespacho: tipoDespachoOptions,
  //   tipoTraslado: tipoTrasladoOptions,
  //   folios: [] as IOptions[],
  //   clientes: [] as IOptions[],
  //   destinos: [] as IOptions[],
  //   empresasTransporte: [] as IOptionsTransportes[],
  //   choferes: [] as IOptions[],
  //   camiones: [] as IOptions[],
  //   predios: [] as IOptions[],
  //   planesDeManejo: [] as IOptions[],
  //   proveedores: [] as IOptions[],
  // },
  identificacion: {
    folio: -1,
    tipo_despacho: '',
    tipo_traslado: '',
  },
  updateIdentificacion: () => {},
  receptor: {
    razon_social: '',
    rut: '',
    giro: '',
    direccion: '',
    comuna: '',
  },
  despacho: {
    chofer: {
      nombre: '',
      rut: '',
    } as Chofer,
    patente: '',
    rut_transportista: '',
    direccion_destino: '',
  },
  updateDespacho: () => {},
  predio: {
    certificado: '',
    comuna: '',
    georreferencia: {
      latitude: 0,
      longitude: 0,
    },
    nombre: '',
    plan_de_manejo: '',
    rol: '',
    productos: [],
  },
  proveedor: {
    razon_social: '',
    rut: '',
  },
  handleSelectClienteLogic: () => {},
  handleSelectPredioLogic: () => {},
  handleSelectProveedorLogic: () => {},
  handleSelectEmpresaTransporteLogic: () => {},
  contratosCompraFiltered: [] as ContratoCompra[],
  contratosVentaFiltered: [] as ContratoVenta[],
};

export const CreateGuiaContext =
  createContext<CreateGuiaContextType>(initialState);

const CreateGuiaProvider = ({ children }: any) => {
  // const { contratosCompra, contratosVenta } = useContext(AppContext);
  const { user } = useContext(UserContext);

  const [contratosCompraFiltered, setContratosCompraFiltered] = useState<
    ContratoCompra[]
  >([]);

  const [contratosVentaFiltered, setContratosVentaFiltered] = useState<
    ContratoVenta[]
  >([]);

  const [identificacion, setIdentificacion] = useState(
    initialState.identificacion
  );
  const [receptor, setReceptor] = useState(initialState.receptor);
  const [despacho, setDespacho] = useState(initialState.despacho);
  const [predio, setPredio] = useState(initialState.predio);
  const [proveedor, setProveedor] = useState(initialState.proveedor);

  useEffect(() => {
    // Load options as soon as contratosCompra and Ventas are loaded
    // updateOptions(
    //   'inicializar',
    //   contratosCompra,
    //   contratosVenta,
    //   undefined,
    //   undefined
    // );
    setContratosCompraFiltered(contratosCompra);
    setContratosVentaFiltered(contratosVenta);
  }, [contratosCompra, contratosVenta]);

  const updateIdentificacion = (identificacion: Identificacion) => {
    setIdentificacion(identificacion);
  };

  const updateDespacho = (despacho: Transporte) => {
    setDespacho(despacho);
  };

  // function updateOptions(
  //   callingFieldHandler:
  //     | 'inicializar'
  //     | 'cliente'
  //     // | 'direccion_despacho'
  //     | 'faena'
  //     | 'proveedor'
  //     | 'empresa_transporte',
  //   // | 'chofer'
  //   // | 'camion',
  //   newContratosCompraFiltered: ContratoCompra[],
  //   newContratosVentaFiltered: ContratoVenta[],
  //   newDestinosOptions?: IOptions[],
  //   newChoferesAndCamionesOptions?: {
  //     choferes: IOptions[];
  //     camiones: IOptions[];
  //   }
  // ) {
  //   // OPTIONS MODIFICATION LOGIC DEPENDS ON THE CALLING FIELD HIERARCHY:
  //   // We update the options of only the field immediately below, so we can't create guias with wrong data
  //   // but also keeping the options updated with the already selected data
  //   let newOptions = { ...options };

  //   // in stead of updating with foliosDisp, we update with the folios from the user.
  //   newOptions.folios = foliosOptions(user?.folios_reservados || []);

  //   // 1. clientes options basically never change
  //   newOptions.clientes = parseClientesFromContratosVenta(contratosVenta);

  //   // 2.a. destinos options only change when cliente changes
  //   (newOptions.destinos =
  //     callingFieldHandler === 'cliente'
  //       ? newDestinosOptions || []
  //       : options.destinos),
  //     // 2.b predios options only change when cliente changes
  //     (newOptions.predios =
  //       callingFieldHandler === 'cliente'
  //         ? parseFaenasFromContratosVenta(
  //             newContratosVentaFiltered as ContratoVenta[]
  //           )
  //         : options.predios);

  //   // 3. proveedores options only change when predio (faena) changes
  //   newOptions.proveedores =
  //     callingFieldHandler === 'faena'
  //       ? parseProveedoresFromContratosCompra(
  //           newContratosCompraFiltered as ContratoCompra[]
  //         )
  //       : options.proveedores;

  //   // 4. empresasTransporte options only change when proveedor change (and direccion_destino is already selected)
  //   newOptions.empresasTransporte =
  //     callingFieldHandler === 'proveedor' && despacho.direccion_destino
  //       ? parseTransportesOptionsFromContratosCompra(
  //           newContratosCompraFiltered as ContratoCompra[],
  //           despacho.direccion_destino
  //         )
  //       : options.empresasTransporte;

  //   // 5.a choferes options only change when empresaTransporte changes (and direccion_destino is already selected)
  //   newOptions.choferes =
  //     callingFieldHandler === 'empresa_transporte' && despacho.direccion_destino
  //       ? newChoferesAndCamionesOptions?.choferes || []
  //       : options.choferes;
  //   // 5.b camiones options only change when empresaTransporte changes (and direccion_destino is already selected)
  //   newOptions.camiones =
  //     callingFieldHandler === 'empresa_transporte' && despacho.direccion_destino
  //       ? newChoferesAndCamionesOptions?.camiones || []
  //       : options.camiones;

  //   // 6. set new states
  //   setOptions(newOptions);
  // setContratosCompraFiltered(newContratosCompraFiltered);
  // setContratosVentaFiltered(newContratosVentaFiltered);
  // }

  const handleSelectClienteLogic = (
    option: IOptions | null,
    direccionDespachoRef: any,
    predioRef: any,
    proveedorRef: any,
    empresaTransporteRef: any,
    choferRef: any,
    camionRef: any
  ) => {
    // 1. Look for the cliente option in all contratosVenta (always) and set the receptor state
    const cliente = contratosVenta.find(
      (contrato) => contrato.cliente?.razon_social === option?.value
    )?.cliente;
    setReceptor({
      razon_social: cliente?.razon_social || '',
      rut: cliente?.rut || '',
      giro: '',
      direccion: cliente?.direccion || '',
      comuna: cliente?.comuna || '',
    });

    // 2. Set the destinos options
    const newDestinosOptions =
      cliente?.destinos.map((destino) => ({
        label: destino,
        value: destino,
      })) || [];

    // 3. Clean lower hierarchy fields states and refs
    direccionDespachoRef?.current.clear();
    empresaTransporteRef?.current?.clear();
    choferRef?.current?.clear();
    camionRef?.current?.clear();
    setDespacho(initialState.despacho);

    predioRef?.current?.clear();
    setPredio(initialState.predio);

    proveedorRef?.current?.clear();
    setProveedor(initialState.proveedor);

    // 4. Filter the contratosCompra and contratosVenta by the selected cliente
    let newContratosCompraFiltered;
    let newContratosVentaFiltered;

    if (option === null) {
      // If we are clearing the cliente, we have to set the contratosCompra and contratosVenta to their initial states
      newContratosCompraFiltered = contratosCompra;
      newContratosVentaFiltered = contratosVenta;
    } else {
      // Else filter the contratosCompra and contratosVenta by the selected cliente
      newContratosCompraFiltered = contratosCompra.filter((contrato) => {
        contrato.clientes.find(
          (cliente) => cliente.razon_social === option?.value
        );
      });
      newContratosVentaFiltered = contratosVenta.filter(
        (contrato) => contrato.cliente?.razon_social === option?.value
      );
    }

    if (newContratosCompraFiltered)
      setContratosCompraFiltered(newContratosCompraFiltered);
    if (newContratosVentaFiltered)
      setContratosVentaFiltered(newContratosVentaFiltered);

    // 4. Update the options
    // updateOptions(
    //   'cliente',
    //   newContratosCompraFiltered,
    //   newContratosVentaFiltered,
    //   // We have to update destinos options in case we are selecting a cliente
    //   newDestinosOptions,
    //   // No value for choferes and camiones options because we are selecting a cliente
    //   undefined
    // );
  };

  const handleSelectPredioLogic = (
    option: IOptions | null,
    proveedorRef: any,
    empresaTransporteRef: any,
    choferRef: any,
    camionRef: any
  ) => {
    // 1. Look for predio option in contratosVentaFiltered and set the predio state
    const predioSplit = option?.value.split('|');
    const { comuna, rol } = {
      comuna: predioSplit ? predioSplit[0].trim() : '',
      rol: predioSplit ? predioSplit[1].trim() : '',
    };
    const newPredio = contratosVentaFiltered
      .find((contrato) =>
        contrato.faenas.find(
          (faena) => faena.comuna === comuna && faena.rol === rol
        )
      )
      ?.faenas.find(
        (newPredio) => newPredio.comuna === comuna && newPredio.rol === rol
      );
    setPredio({
      certificado: newPredio?.certificado || '',
      comuna: newPredio?.comuna || '',
      georreferencia: {
        latitude: newPredio?.georreferencia.latitude || 0,
        longitude: newPredio?.georreferencia.longitude || 0,
      },
      rol: newPredio?.rol || '',
      nombre: newPredio?.nombre || '',
      plan_de_manejo: newPredio?.plan_de_manejo || '',
      // Productos are not necessary for the guia yet, we have to take them from contrato, not predio
      productos: [],
    });

    // 2. Clean lower hierarchy fields states and refs (except for direccion_despacho which is independent from faena)
    empresaTransporteRef?.current?.clear();
    choferRef?.current?.clear();
    camionRef?.current?.clear();
    setDespacho({
      ...despacho,
      chofer: initialState.despacho.chofer,
      patente: initialState.despacho.patente,
      rut_transportista: initialState.despacho.rut_transportista,
    });

    proveedorRef?.current?.clear();
    setProveedor(initialState.proveedor);

    // 3. Filter the contratosCompra and contratosVenta by the selected predio
    let newContratosCompraFiltered;
    let newContratosVentaFiltered;

    if (option === null) {
      // If we are clearing the predio, we have to set the contratos filtered states just filtered by the selected cliente (one hierarchy above)
      newContratosCompraFiltered = contratosCompra.filter((contrato) => {
        contrato.clientes.find(
          (cliente) => cliente.razon_social === receptor.razon_social
        );
      });
      newContratosVentaFiltered = contratosVenta.filter(
        (contrato) => contrato.cliente?.razon_social === receptor.razon_social
      );
    } else {
      // Else filter the contratosCompra and contratosVenta by the selected predio and cliente

      newContratosCompraFiltered = contratosCompra.filter(
        (contrato) =>
          // First filter by the selected cliente (in case changing from one seleceted predio to another)
          contrato.clientes.find(
            (cliente) => cliente.razon_social === receptor.razon_social
          ) &&
          // Then filter by the selected predio
          contrato.faena.rol === newPredio?.rol &&
          contrato.faena.comuna === newPredio?.comuna
      );

      newContratosVentaFiltered = contratosVenta.filter(
        (contrato) =>
          // First filter cliente
          contrato.cliente?.razon_social === receptor.razon_social &&
          // Then filter predio
          contrato.faenas.find(
            (faena) =>
              faena.rol === newPredio?.rol && faena.comuna === newPredio?.comuna
          )
      );
    }
    if (newContratosCompraFiltered)
      setContratosCompraFiltered(newContratosCompraFiltered);
    if (newContratosVentaFiltered)
      setContratosVentaFiltered(newContratosVentaFiltered);

    // 4. Update the options
    // updateOptions(
    //   'faena',
    //   newContratosCompraFiltered,
    //   newContratosVentaFiltered,
    //   // No value for destinos options because we are selecting a predio
    //   undefined,
    //   // No value for choferes and camiones options because we are selecting a predio
    //   undefined
    // );
  };

  const handleSelectProveedorLogic = (
    option: IOptions | null,
    empresaTransporteRef: any,
    camionRef: any,
    choferRef: any
  ) => {
    // 1. Look for proveedor option in contratosCompraFiltered and set the proveedor state
    const newProveedor = contratosCompraFiltered.find(
      (contrato) => contrato.proveedor?.razon_social === option?.value
    )?.proveedor;
    setProveedor({
      razon_social: newProveedor?.razon_social || '',
      rut: newProveedor?.rut || '',
    });

    // 2. Clean lower hierarchy fields states and refs (except for direccion_despacho which is independent from proveedor)
    empresaTransporteRef?.current?.clear();
    choferRef?.current?.clear();
    camionRef?.current?.clear();
    setDespacho({
      ...despacho,
      chofer: initialState.despacho.chofer,
      patente: initialState.despacho.patente,
      rut_transportista: initialState.despacho.rut_transportista,
    });

    // 3. Filter the contratosCompra and contratosVenta by the selected proveedor
    let newContratosCompraFiltered;
    let newContratosVentaFiltered;

    if (option === null) {
      // If we are clearing the proveedor, we have to set the contratos filtered states just filtered by the selected cliente and predio (two hierarchies above)
      newContratosCompraFiltered = contratosCompra.filter((contrato) => {
        contrato.clientes.find(
          (cliente) => cliente.razon_social === receptor.razon_social
        ) &&
          contrato.faena.rol === predio?.rol &&
          contrato.faena.comuna === predio?.comuna;
      });
      newContratosVentaFiltered = contratosVenta.filter((contrato) => {
        contrato.cliente?.razon_social === receptor.razon_social &&
          contrato.faenas.find(
            (faena) =>
              faena.rol === predio?.rol && faena.comuna === predio?.comuna
          );
      });
    } else {
      // Else filter the contratosCompra and contratosVenta by the selected proveedor, cliente and predio
      newContratosCompraFiltered = contratosCompra.filter(
        (contrato) =>
          // First filter cliente
          contrato.clientes.find(
            (cliente) => cliente.razon_social === receptor.razon_social
          ) &&
          // Then filter predio
          contrato.faena.rol === predio?.rol &&
          contrato.faena.comuna === predio?.comuna &&
          // Then filter proveedor
          contrato.proveedor?.razon_social === newProveedor?.razon_social
      );
    }

    if (newContratosCompraFiltered)
      setContratosCompraFiltered(newContratosCompraFiltered);
    if (newContratosVentaFiltered)
      setContratosVentaFiltered(newContratosVentaFiltered);
    // 4. Update the options
    // updateOptions(
    //   'proveedor',
    //   newContratosCompraFiltered,
    //   newContratosVentaFiltered || contratosVentaFiltered,
    //   // No value for destinos options because we are selecting a proveedor
    //   undefined,
    //   // No value for choferes and camiones options because we are selecting a proveedor
    //   undefined
    // );
  };

  const handleSelectEmpresaTransporteLogic = (
    option: IOptionsTransportes | null,
    contratosCompraFiltered: ContratoCompra[],
    empresaTransporteRef: any,
    camionRef: any,
    choferRef: any
  ) => {
    // Since we already selected Cliente, Predio and Proveedor, we should only have one ContratoCompra, so we will pick the first one
    // QUESTION_1: Can it exist more than one contratoCompra with the same cliente, predio and proveedor?

    const contratoCompra = contratosCompraFiltered[0];

    const newTransporte = contratoCompra.clientes
      .find((cliente) => cliente.razon_social === receptor.razon_social)
      ?.destinos_contrato?.find(
        (destino) => destino.nombre === despacho.direccion_destino
      )
      ?.transportes?.find((transporte) => transporte.rut === option?.value);

    const newCamionesAndChoferesOptions = {
      camionesOptions:
        newTransporte?.camiones.map((camion) => ({
          label: camion.patente,
          value: camion.patente,
        })) || [],
      choferesOptions:
        newTransporte?.choferes.map((chofer) => ({
          label: chofer.nombre,
          value: `${chofer.nombre}/${chofer.rut}`,
        })) || [],
    };

    // For consistence, we default to initial states for the next fields except for direccion_despacho which comes from cliente
    // and rut_transportista which is the one being selected
    setDespacho({
      ...despacho,
      rut_transportista: newTransporte?.rut || '',
      patente: initialState.despacho.patente,
      chofer: initialState.despacho.chofer,
    });
    camionRef?.current?.clear();
    choferRef?.current?.clear();

    if (option === null) {
      empresaTransporteRef?.current?.clear();
    }
  };

  const contextValue: CreateGuiaContextType = {
    // options,
    // updateOptions,
    identificacion,
    updateIdentificacion,
    receptor,
    despacho,
    updateDespacho,
    predio,
    proveedor,
    handleSelectClienteLogic,
    handleSelectPredioLogic,
    handleSelectProveedorLogic,
    handleSelectEmpresaTransporteLogic,
    contratosCompraFiltered,
    contratosVentaFiltered,
  };

  return (
    <CreateGuiaContext.Provider value={contextValue}>
      {children}
    </CreateGuiaContext.Provider>
  );
};

export default CreateGuiaProvider;
