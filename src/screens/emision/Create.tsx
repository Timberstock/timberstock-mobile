// Arreglo de renderkeys para que se actualicen los selects desde https://github.com/MobileReality/react-native-select-pro/issues/237
import React, {
  useEffect,
  useRef,
  MutableRefObject,
  useContext,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  Select,
  SelectRef,
  SelectStyles,
} from '@mobile-reality/react-native-select-pro';
import { CheckBox } from 'react-native-elements';
import colors from '@/resources/Colors';
import Header from '@/components/Header';
import { AppContext } from '@/context/AppContext';
import { UserContext } from '@/context/UserContext';
import { IOption } from '@/interfaces/screens/screens';
import {
  GuiaDespachoOptions,
  GuiaDespacho,
  IOptionClienteContratoCompra,
  IOptionDestinoContrato,
  IOptionTransporte,
  IOptionChofer,
  IOptionCarguio,
  IOptionCosecha,
} from '@/interfaces/screens/emision/create';
import { initialStatesCreate } from '@/resources/initialStates';
import {
  isGuiaValid,
  getInitialOptions,
  parseFoliosOptions,
  selectClienteLogic,
  selectProveedorLogic,
  selectTransporteLogic,
  selectChoferLogic,
  selectCamionLogic,
  selectFaenaLogic,
  selectDestinoContratoLogic,
  selectCarguioLogic,
  selectCosechaLogic,
  folioProveedorChangeLogic,
} from './createLogic';
import OverlayLoading from '@/components/OverlayLoading';

export default function CreateGuia(props: any) {
  const { navigation } = props;
  const { empresa } = useContext(AppContext);
  const { user } = useContext(UserContext);
  const { contratosCompra } = useContext(AppContext);

  const [guia, setGuia] = useState<GuiaDespacho>(initialStatesCreate.guia);
  // Folios options is apart from the rest since it comes from the user, not contratos
  const [foliosOptions, setFoliosOptions] = useState<IOption[]>([]);
  const [options, setOptions] = useState<GuiaDespachoOptions>(
    initialStatesCreate.options
  );

  const proveedorRef = useRef() as MutableRefObject<SelectRef>;
  const predioRef = useRef() as MutableRefObject<SelectRef>;
  const clienteRef = useRef() as MutableRefObject<
    SelectRef<IOptionClienteContratoCompra>
  >;
  const destinoContratoRef = useRef() as MutableRefObject<
    SelectRef<IOptionDestinoContrato>
  >;
  const empresaTransporteRef = useRef() as MutableRefObject<
    SelectRef<IOptionTransporte>
  >;
  const carguioRef = useRef() as MutableRefObject<SelectRef<IOptionCarguio>>;
  const cosechaRef = useRef() as MutableRefObject<SelectRef<IOptionCosecha>>;
  const choferRef = useRef() as MutableRefObject<SelectRef<IOptionChofer>>;
  const camionRef = useRef() as MutableRefObject<SelectRef>;

  const [certChecked, setCertChecked] = useState(false);

  const [optionsInitialized, setOptionsInitialized] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Run only once after loading contratosCompra
    if (!optionsInitialized && contratosCompra.length > 0 && user) {
      const newOptions = getInitialOptions(contratosCompra);
      const newFoliosOptions = parseFoliosOptions(user.folios_reservados);

      setRenderKey((prevKey) => prevKey + 1);
      setOptions(newOptions);
      setFoliosOptions(newFoliosOptions);
      setOptionsInitialized(true);
    }
  }, [contratosCompra]);

  const handleCertToggle = () => {
    setCertChecked(!certChecked);
  };

  const handleNavigateToCreateGuiaProductos = () => {
    if (!isGuiaValid(guia)) {
      alert('Debes llenar todos los campos');
      return;
    }
    if (!certChecked) {
      guia.faena.certificado = 'No Aplica';
    }
    navigation.push('CreateGuiaProductos', {
      data: {
        guia: guia,
      },
    });
    return;
  };

  function selectFolioHandler(option: IOption | null) {
    setGuia({
      ...guia,
      identificacion: {
        ...guia.identificacion,
        folio: parseInt(option?.value || '-1'),
      },
    });

    setRenderKey((prevKey) => prevKey);
  }

  function selectTipoDespachoHandler(option: IOption | null) {
    setGuia({
      ...guia,
      identificacion: {
        ...guia.identificacion,
        tipo_despacho: option?.value || '',
      },
    });
  }

  function selectTipoTrasladoHandler(option: IOption | null) {
    setGuia({
      ...guia,
      identificacion: {
        ...guia.identificacion,
        tipo_traslado: option?.value || '',
      },
    });
  }

  function selectProveedorHandler(option: IOption | null) {
    const { newGuia, newOptions } = selectProveedorLogic(
      option,
      guia,
      contratosCompra
    );

    predioRef.current?.clear();
    clienteRef.current?.clear();
    destinoContratoRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function folioProveedorChangeHandler(folio: string) {
    const newGuia = folioProveedorChangeLogic(folio, guia);

    setGuia(newGuia);
  }

  function selectFaenaHandler(option: IOption | null) {
    const { newGuia, newOptions } = selectFaenaLogic(
      option,
      guia,
      contratosCompra
    );

    clienteRef.current?.clear();
    destinoContratoRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectClienteHandler(option: IOptionClienteContratoCompra | null) {
    const { newGuia, newOptions } = selectClienteLogic(
      option,
      guia,
      contratosCompra
    );

    destinoContratoRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectDestinoContratoHandler(option: IOptionDestinoContrato | null) {
    const { newGuia, newOptions } = selectDestinoContratoLogic(
      option,
      options,
      guia
    );

    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectTransportistaHandler(option: IOptionTransporte | null) {
    const { newGuia, newOptions } = selectTransporteLogic(
      option,
      options,
      guia
    );

    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectCarguioHandler(option: IOptionCarguio | null) {
    const newGuia = selectCarguioLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }
  function selectCosechaHandler(option: IOptionCosecha | null) {
    const newGuia = selectCosechaLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectChoferHandler(option: IOptionChofer | null) {
    const newGuia = selectChoferLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  function selectCamionHandler(option: IOption | null) {
    const newGuia = selectCamionLogic(option, guia);

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
  }

  return (
    <View style={styles.screen}>
      <Header screenName="CreateGuia" empresa={'TimberBiz'} {...props} />
      <OverlayLoading loading={!optionsInitialized} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Identificación Guía </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Nº Folio"
                  animation={true}
                  options={foliosOptions}
                  defaultOption={foliosOptions.find(
                    (option) =>
                      option.value === guia.identificacion.folio.toString()
                  )}
                  onSelect={selectFolioHandler}
                  onRemove={() => selectFolioHandler(null)}
                  key={`folios-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Tipo Despacho"
                  animation={true}
                  options={options.tipoDespacho}
                  defaultOption={options.tipoDespacho.find(
                    (option) =>
                      option.value === guia.identificacion.tipo_despacho
                  )}
                  onSelect={selectTipoDespachoHandler}
                  onRemove={() => selectTipoDespachoHandler(null)}
                />
              </View>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Tipo Traslado"
                  animation={true}
                  options={options.tipoTraslado}
                  defaultOption={options.tipoTraslado.find(
                    (option) =>
                      option.value === guia.identificacion.tipo_traslado
                  )}
                  onSelect={selectTipoTrasladoHandler}
                  onRemove={() => selectTipoTrasladoHandler(null)}
                />
              </View>
            </View>
          </View>
          <View style={{ ...styles.section }}>
            <Text style={styles.sectionTitle}> Proveedor (Interno)</Text>
            <Select
              styles={selectStyles}
              placeholderText="Proveedor"
              // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
              // searchable={true}
              animation={true}
              options={options.proveedores}
              ref={proveedorRef}
              defaultOption={options.proveedores.find(
                (option) => option.value === guia.proveedor.rut
              )}
              onSelect={selectProveedorHandler}
              onRemove={() => selectProveedorHandler(null)}
              key={`proveedores-${renderKey}`}
            />
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                value={
                  guia.folio_guia_proveedor && guia.folio_guia_proveedor !== 0
                    ? guia.folio_guia_proveedor.toString()
                    : ''
                }
                placeholder={'Folio Proveedor (opcional)'}
                keyboardType="numeric"
                onChangeText={folioProveedorChangeHandler}
              />
            </View>
          </View>
          <View style={{ ...styles.section, ...styles.section.predio }}>
            <Text style={styles.sectionTitle}> Origen </Text>
            <Select
              styles={selectStyles}
              placeholderText="Comuna - Predio (Origen)"
              // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
              // searchable={true}
              animation={true}
              ref={predioRef}
              options={options.faenas}
              defaultOption={options.faenas.find(
                (option) => option.value === guia.faena.rol
              )}
              disabled={guia.proveedor.razon_social === ''}
              onSelect={selectFaenaHandler}
              onRemove={() => selectFaenaHandler(null)}
              key={`predios-${renderKey}`}
            />
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.faena.rol && (
                  <Text style={styles.text}>Predio: {guia.faena.rol}</Text>
                )}
                {guia.faena.rol && (
                  <Text style={styles.text}>
                    GEO: {guia.faena?.georreferencia.latitude},
                    {guia.faena?.georreferencia.longitude}
                  </Text>
                )}
                {guia.faena.rol && (
                  <Text style={styles.text}>
                    Plan de Manejo o Uso Suelo: {guia.faena.plan_de_manejo}
                  </Text>
                )}
              </View>
            </View>
            {guia.faena.rol && (
              <View style={styles.row}>
                <CheckBox
                  checked={certChecked}
                  onPress={handleCertToggle}
                  containerStyle={styles.checkboxContainer}
                  textStyle={{
                    color: certChecked ? '#2ecc71' : colors.crudo,
                  }}
                />
                <Text style={styles.textCertificate}>
                  CERT: {guia.faena.certificado}
                </Text>
              </View>
            )}
          </View>
          <View style={{ ...styles.section, ...styles.section.receptor }}>
            <Text style={styles.sectionTitle}> Cliente </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  placeholderText="Razon Social"
                  styles={selectStyles}
                  animation={true}
                  ref={clienteRef}
                  options={options.clientes}
                  disabled={
                    guia.faena.rol === '' || guia.proveedor.razon_social === ''
                  }
                  defaultOption={options.clientes.find(
                    (option) => option.value === guia.cliente.rut
                  )}
                  onSelect={selectClienteHandler}
                  onRemove={() => selectClienteHandler(null)}
                  key={`clientes-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  placeholderText="Direccion Despacho"
                  styles={selectStyles}
                  animation={true}
                  ref={destinoContratoRef}
                  options={options.destinos_contrato}
                  defaultOption={options.destinos_contrato.find(
                    (option) => option.value === guia.destino_contrato.nombre
                  )}
                  disabled={
                    guia.proveedor.rut === '' ||
                    guia.faena.rol === '' ||
                    guia.cliente.razon_social === ''
                  }
                  onSelect={selectDestinoContratoHandler}
                  onRemove={() => selectDestinoContratoHandler(null)}
                  key={`despachos-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.cliente.rut !== '' && (
                  <Text style={styles.text}>
                    RUT: {guia.cliente.rut} || Comuna: {guia.cliente.comuna}
                  </Text>
                )}
                {guia.cliente.rut !== '' && (
                  <Text style={styles.text}>
                    Direccion: {guia.cliente.direccion}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Servicios </Text>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Carguio"
                  animation={true}
                  ref={carguioRef}
                  options={options.empresas_carguio}
                  defaultOption={options.empresas_carguio.find(
                    (option) =>
                      option.value === guia.servicios?.carguio?.empresa.rut
                  )}
                  disabled={
                    guia.proveedor.rut === '' ||
                    guia.faena.rol === '' ||
                    guia.cliente.rut === ''
                  }
                  onSelect={selectCarguioHandler}
                  onRemove={() => selectCarguioHandler(null)}
                  key={`carguio-${renderKey}`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Cosecha"
                  animation={true}
                  ref={cosechaRef}
                  options={options.empresas_cosecha}
                  defaultOption={options.empresas_cosecha.find(
                    (option) =>
                      option.value === guia.servicios?.cosecha?.empresa.rut
                  )}
                  disabled={
                    guia.proveedor.rut === '' ||
                    guia.faena.rol === '' ||
                    guia.cliente.rut === ''
                  }
                  onSelect={selectCosechaHandler}
                  onRemove={() => selectCosechaHandler(null)}
                  key={`carguio-${renderKey}`}
                />
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Datos Despacho </Text>
            <Select
              styles={selectStyles}
              placeholderText="Empresa Transportista"
              animation={true}
              ref={empresaTransporteRef}
              options={options.empresas_transporte}
              defaultOption={options.empresas_transporte.find(
                (option) => option.value === guia.transporte.rut
              )}
              disabled={
                guia.proveedor.rut === '' ||
                guia.cliente.rut === '' ||
                guia.faena.rol === '' ||
                guia.destino_contrato.nombre === ''
              }
              onSelect={selectTransportistaHandler}
              onRemove={() => selectTransportistaHandler(null)}
              key={`transportistas-${renderKey}`}
            />
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Chofer"
                  animation={true}
                  ref={choferRef}
                  options={options.choferes}
                  defaultOption={options.choferes.find(
                    (option) => option.value === guia.chofer.rut
                  )}
                  disabled={
                    guia.proveedor.rut === '' ||
                    guia.cliente.rut === '' ||
                    guia.faena.rol === '' ||
                    guia.destino_contrato.nombre === '' ||
                    guia.transporte.rut === ''
                  }
                  onSelect={selectChoferHandler}
                  onRemove={() => selectChoferHandler(null)}
                  key={`choferes-${renderKey}`}
                />
              </View>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Camion"
                  animation={true}
                  ref={camionRef}
                  options={options.camiones}
                  defaultOption={options.camiones.find(
                    (option) => option.value === guia.camion
                  )}
                  disabled={
                    guia.proveedor.rut === '' ||
                    guia.cliente.rut === '' ||
                    guia.faena.rol === '' ||
                    guia.destino_contrato.nombre === '' ||
                    guia.transporte.rut === ''
                  }
                  onSelect={selectCamionHandler}
                  onRemove={() => selectCamionHandler(null)}
                  key={`camiones-${renderKey}`}
                />
              </View>
            </View>
          </View>
          {/* Add an empty space */}
          <View style={{ height: 50 }} />
          <TouchableOpacity
            style={styles.button}
            onPress={handleNavigateToCreateGuiaProductos}
          >
            <Text style={styles.buttonText}> Agregar Productos </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: '1%',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: '2.5%',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: '4%',
    height: 150,
    backgroundColor: colors.crudo,
    borderRadius: 15,
    receptor: {
      height: 200,
    },
    predio: {
      height: 230,
    },
  },
  body: {
    flex: 9,
    width: '100%',
    backgroundColor: colors.white,
    display: 'flex',
  },
  row: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'solid',
  },
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 2,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '50%',
    textAlign: 'center',
    marginVertical: 7,
    fontSize: 13,
  },
  text: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    margin: 5,
  },
  textCertificate: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 15,
    margin: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
  },
  checkboxContainer: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: colors.white,
    left: 5,
  },
});

const selectStyles: SelectStyles = {
  select: {
    container: {
      borderWidth: 2,
      borderColor: '#cccccc',
      borderRadius: 13,
      alignSelf: 'center',
      width: '90%',
    },
  },
};
