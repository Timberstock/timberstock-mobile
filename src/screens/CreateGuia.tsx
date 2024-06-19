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
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import {
  Select,
  SelectRef,
  SelectStyles,
} from '@mobile-reality/react-native-select-pro';
import { CheckBox } from 'react-native-elements';
import { AppContext } from '../context/AppContext';
import { UserContext } from '../context/UserContext';
import { IOption } from '../interfaces/screens';
import {
  ContratosFiltered,
  CreateGuiaOptions,
  GuiaInCreateGuiaScreen,
} from '../interfaces/screens/createGuia';
import { createGuiaInitialStates } from '../resources/initialStates';
import {
  getInitializationOptions,
  isGuiaValid,
  selectClienteLogic,
  selectPredioLogic,
  selectProveedorLogic,
  selectTransportistaLogic,
  selectChoferLogic,
  selectCamionLogic,
} from '../functions/screens/createGuia';
import OverlayLoading from '../resources/OverlayLoading';

// TODO: Before entering this screen, we have to make sure that the user was logged in correctly and that we have the data loaded.
// TODO 1: ADD FIELDS VALIDATIONS, BOTH FOR COMPLETENESS AND CORRECTNESS
export default function CreateGuia(props: any) {
  const { navigation } = props;
  const { empresa } = useContext(AppContext);
  const { user } = useContext(UserContext);
  const { contratosCompra, contratosVenta } = useContext(AppContext);
  const [renderKey, setRenderKey] = useState(0);

  const [contratosFiltered, setContratosFiltered] = useState<ContratosFiltered>(
    createGuiaInitialStates.contratosFiltered
  );

  const [options, setOptions] = useState<CreateGuiaOptions>(
    createGuiaInitialStates.options
  );

  // TODO: Only guia could be managed in GuiaContext
  const [guia, setGuia] = useState<GuiaInCreateGuiaScreen>(
    createGuiaInitialStates.guia
  );

  const [certChecked, setCertChecked] = useState(false);

  const predioRef = useRef() as MutableRefObject<SelectRef>;
  const proveedorRef = useRef() as MutableRefObject<SelectRef>;
  const direccionDespachoRef = useRef() as MutableRefObject<SelectRef>;
  const empresaTransporteRef = useRef() as MutableRefObject<SelectRef>;
  const choferRef = useRef() as MutableRefObject<SelectRef>;
  const camionRef = useRef() as MutableRefObject<SelectRef>;

  const [optionsInitialized, setOptionsInitialized] = useState(false);

  // const renderCount = useRef(0);
  // useEffect(() => {
  //   renderCount.current = renderCount.current + 1;
  //   console.log(`Render number: ${renderCount.current}`);
  // });

  useEffect(() => {
    // Run only once after loading contratosCompraFiltered and contratosVentaFiltered for the first time
    if (
      !optionsInitialized &&
      contratosCompra.length > 0 &&
      contratosVenta.length > 0 &&
      user
    ) {
      const contratos = {
        compra: contratosCompra,
        venta: contratosVenta,
      };
      // If I modify contratosFiltered will it modify contratosCompra and contratosVenta?
      setContratosFiltered({
        compra: contratosCompra,
        venta: contratosVenta,
      });
      const newOptions = getInitializationOptions(
        contratos,
        user.folios_reservados
      );
      setRenderKey((prevKey) => prevKey + 1);
      setOptions(newOptions);
      setOptionsInitialized(true);
    }
  }, [contratosCompra, contratosVenta, user]);

  const handleCertToggle = () => {
    setCertChecked(!certChecked);
  };

  const handleNavigateToCreateGuiaProductos = () => {
    if (!isGuiaValid(guia)) {
      alert('Debes llenar todos los campos');
      return;
    }
    if (!certChecked) {
      guia.predio.certificado = 'No Aplica';
    }
    navigation.push('CreateGuiaProductos', {
      data: {
        guia: {
          identificacion: guia.identificacion,
          receptor: guia.receptor,
          predio: guia.predio,
          proveedor: guia.proveedor,
          emisor: empresa.emisor,
          transporte: guia.despacho, // Just to keep structure correct with PreGuia
        },
        contratosFiltered: contratosFiltered,
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

  function selectClienteHandler(option: IOption | null) {
    const { newGuia, newContratosFiltered, newOptions } = selectClienteLogic(
      option,
      options,
      guia,
      contratosCompra,
      contratosVenta
    );

    direccionDespachoRef.current?.clear();
    proveedorRef.current?.clear();
    predioRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
    setContratosFiltered(newContratosFiltered);
  }

  function selectDireccionDespachoHandler(option: IOption | null) {
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia({
      ...guia,
      despacho: {
        ...createGuiaInitialStates.guia.despacho, // Reset empresa chofer and camion
        direccion_destino: option?.value || '',
      },
    });
  }

  function selectPredioHandler(option: IOption | null) {
    const { newGuia, newContratosFiltered, newOptions } = selectPredioLogic(
      option,
      options,
      guia,
      contratosFiltered,
      contratosCompra,
      contratosVenta
    );

    proveedorRef.current?.clear();
    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
    setContratosFiltered(newContratosFiltered);
  }

  function selectProveedorHandler(option: IOption | null) {
    const { newGuia, newContratosFiltered, newOptions } = selectProveedorLogic(
      option,
      options,
      guia,
      contratosFiltered,
      contratosCompra
    );

    empresaTransporteRef.current?.clear();
    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setOptions(newOptions);
    setRenderKey((prevKey) => prevKey + 1);
    setContratosFiltered(newContratosFiltered);
  }

  function selectTransportistaHandler(option: IOption | null) {
    const { newGuia, newOptions } = selectTransportistaLogic(
      option,
      options,
      guia
    );

    choferRef.current?.clear();
    camionRef.current?.clear();

    setGuia(newGuia);
    setRenderKey((prevKey) => prevKey + 1);
    setOptions(newOptions);
  }

  function selectChoferHandler(option: IOption | null) {
    const newGuia = selectChoferLogic(option, options, guia);

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
      <Header
        screenName="CreateGuia"
        empresa={empresa.emisor.razon_social}
        {...props}
      />
      <OverlayLoading loading={!optionsInitialized} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Identificación </Text>
            <Select
              styles={selectStyles}
              placeholderText="Nº Folio"
              animation={true}
              options={options.folios}
              defaultOption={options.folios.find(
                (option) =>
                  option.value === guia.identificacion.folio.toString()
              )}
              onSelect={selectFolioHandler}
              onRemove={() => selectFolioHandler(null)}
              key={`folios-${renderKey}`}
            />
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
          <View style={{ ...styles.section, ...styles.section.receptor }}>
            <Text style={styles.sectionTitle}> Receptor </Text>
            <Select
              placeholderText="Razon Social"
              styles={selectStyles}
              animation={true}
              options={options.clientes}
              defaultOption={options.clientes.find(
                (option) => option.value === guia.receptor.razon_social
              )}
              onSelect={selectClienteHandler}
              onRemove={() => selectClienteHandler(null)}
              key={`clientes-${renderKey}`}
            />
            <Select
              styles={selectStyles}
              placeholderText="Direccion Despacho"
              animation={true}
              ref={direccionDespachoRef}
              disabled={guia.receptor.razon_social === ''}
              options={options.destinos}
              defaultOption={options.destinos.find(
                (option) => option.value === guia.despacho.direccion_destino
              )}
              onSelect={selectDireccionDespachoHandler}
              onRemove={() => selectDireccionDespachoHandler(null)}
              key={`despachos-${renderKey}`}
            />
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.receptor.rut !== '' && (
                  <Text style={styles.text}>
                    RUT: {guia.receptor.rut} || Comuna: {guia.receptor.comuna}
                  </Text>
                )}
                {guia.receptor.rut !== '' && (
                  <Text style={styles.text}>
                    Direccion: {guia.receptor.direccion}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={{ ...styles.section, ...styles.section.predio }}>
            <Text style={styles.sectionTitle}> Origen </Text>
            <Select
              styles={selectStyles}
              placeholderText="Comuna - Predio (Origen)"
              // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
              // searchable={true}
              ref={predioRef}
              animation={true}
              options={options.predios}
              defaultOption={options.predios.find(
                (option) =>
                  option.value === `${guia.predio.comuna} | ${guia.predio.rol}`
              )}
              disabled={guia.receptor.razon_social === ''}
              onSelect={selectPredioHandler}
              onRemove={() => selectPredioHandler(null)}
              key={`predios-${renderKey}`}
            />
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guia.predio.rol !== '' && (
                  <Text style={styles.text}>Predio: {guia.predio.rol}</Text>
                )}
                {guia.predio.rol !== '' && (
                  <Text style={styles.text}>
                    GEO: {guia.predio.georreferencia.latitude},
                    {guia.predio.georreferencia.longitude}
                  </Text>
                )}
                {guia.predio.rol !== '' && (
                  <Text style={styles.text}>
                    Plan de Manejo o Uso Suelo: {guia.predio.plan_de_manejo}
                  </Text>
                )}
              </View>
            </View>
            {guia.predio.rol !== '' && (
              <View style={styles.row}>
                <CheckBox
                  checked={certChecked}
                  onPress={handleCertToggle}
                  containerStyle={styles.checkboxContainer}
                  textStyle={{
                    color: certChecked ? '#2ecc71' : colors.crudo,
                  }}
                  // checkedColor={colors.white}
                />
                <Text style={styles.textCertificate}>
                  CERT: {guia.predio.certificado}
                </Text>
              </View>
            )}
          </View>
          <View style={{ ...styles.section }}>
            <Text style={styles.sectionTitle}> Proveedor A Pagar </Text>
            <Select
              styles={selectStyles}
              placeholderText="Proveedor"
              // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
              // searchable={true}
              animation={true}
              disabled={
                guia.predio.rol === '' || guia.receptor.razon_social === ''
              }
              options={options.proveedores}
              ref={proveedorRef}
              defaultOption={options.proveedores.find(
                (option) => option.value === guia.proveedor.razon_social
              )}
              onSelect={selectProveedorHandler}
              onRemove={() => selectProveedorHandler(null)}
              key={`proveedores-${renderKey}`}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Datos Despacho </Text>
            <Select
              styles={selectStyles}
              placeholderText="Empresa Transportista"
              animation={true}
              disabled={
                guia.proveedor.razon_social === '' ||
                guia.despacho.direccion_destino === ''
              }
              options={options.empresasTransporte}
              defaultOption={options.empresasTransporte.find(
                (option) => option.value === guia.despacho.rut_transportista
              )}
              ref={empresaTransporteRef}
              key={`transportistas-${renderKey}`}
              onSelect={selectTransportistaHandler}
              onRemove={() => selectTransportistaHandler(null)}
            />
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Chofer"
                  animation={true}
                  ref={choferRef}
                  disabled={guia.despacho.rut_transportista === ''}
                  options={options.choferes}
                  defaultOption={options.choferes.find(
                    (option) => option.value === guia.despacho.chofer.rut
                  )}
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
                    (option) => option.value === guia.despacho.patente
                  )}
                  disabled={guia.despacho.rut_transportista === ''}
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
