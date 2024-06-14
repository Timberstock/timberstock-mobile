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
import { Select, SelectRef } from '@mobile-reality/react-native-select-pro';
import { CheckBox } from 'react-native-elements';
import { AppContext } from '../context/AppContext';
import { UserContext } from '../context/UserContext';
import { CreateGuiaContext } from '../context/CreateGuiaContext';
import { IOptionsTransportes } from '../interfaces/screens';

// TODO: Before entering this screen, we have to make sure that the user was logged in correctly and that we have the data loaded.
// TODO 1: ADD FIELDS VALIDATIONS, BOTH FOR COMPLETENESS AND CORRECTNESS
// TODO 2: MAKE CERTIFICATE OPTIONAL
export default function CreateGuia(props: any) {
  const { navigation } = props;
  const [certChecked, setCertChecked] = useState(false);
  const { empresa, subCollectionsData, contratosCompra, contratosVenta } =
    useContext(AppContext);

  const [contratosCompraFiltered, setContratosCompraFiltered] =
    useState(contratosCompra);
  const [contratosVentaFiltered, setContratosVentaFiltered] =
    useState(contratosVenta);

  const { user } = useContext(UserContext);

  const {
    options,
    updateOptions,
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
  } = useContext(CreateGuiaContext);

  const direccionDespachoRef = useRef() as MutableRefObject<SelectRef>;
  const predioRef = useRef() as MutableRefObject<SelectRef>;
  const proveedorRef = useRef() as MutableRefObject<SelectRef>;

  const empresaTransporteRef = useRef() as MutableRefObject<SelectRef>;
  const choferRef = useRef() as MutableRefObject<SelectRef>;
  const camionRef = useRef() as MutableRefObject<SelectRef>;

  useEffect(() => {
    // After loading the screen, update all the options that we will need with the latest possible values
    // TODO: mover esto a los handlers de los selects en CreateGuiaContext, mover todo el manejo de contratos alla
    updateOptions(
      user,
      contratosCompra,
      contratosVenta,
      contratosCompraFiltered,
      contratosVentaFiltered
    );
  }, [user, contratosCompraFiltered, contratosVentaFiltered]);

  const handleToggle = () => {
    setCertChecked(!certChecked);
  };

  const handleAddProductos = () => {
    console.log(identificacion);
    console.log(receptor);
    console.log(despacho);
    console.log(predio);
    console.log(proveedor);

    if (
      !(
        identificacion.folio &&
        identificacion.tipo_despacho &&
        identificacion.tipo_traslado
      ) ||
      !(receptor.razon_social && receptor.direccion) ||
      !(
        despacho.chofer.nombre &&
        despacho.chofer.rut &&
        despacho.patente &&
        despacho.rut_transportista
      ) ||
      !predio.rol ||
      !proveedor.razon_social
    ) {
      alert('Debes llenar todos los campos');
      return;
    }
    if (!certChecked) {
      predio.certificado = '';
    }

    navigation.push('Products', {
      data: {
        guia: {
          emisor: empresa.emisor,
          identificacion,
          receptor,
          transporte: despacho, // Just to keep structure correct with PreGuia
          predio,
        },
        contratoVenta: contratosVentaFiltered[0],
      },
    });
  };

  return (
    <View style={styles.screen}>
      <Header
        screenName="CreateGuia"
        empresa={empresa.emisor.razon_social}
        {...props}
      />
      <View style={styles.body}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Identificación </Text>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                // @ts-ignore
                selectControlStyle={{
                  ...selectStyles.input,
                  ...selectStyles.input.folio,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Nº Folio"
                animated={true}
                options={options.folios}
                defaultOption={options.folios.find(
                  (option) => option.value === identificacion.folio.toString()
                )}
                onSelect={(option) =>
                  updateIdentificacion({
                    ...identificacion,
                    folio: parseInt(option?.value || '-1'),
                  })
                }
              />
            </View>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                selectControlStyle={selectStyles.input}
                selectControlButtonsContainerStyle={
                  selectStyles.buttonsContainer
                }
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Tipo Despacho"
                animated={true}
                options={options.tipoDespacho}
                defaultOption={options.tipoDespacho.find(
                  (option) => option.value === identificacion.tipo_despacho
                )}
                onSelect={(option) =>
                  updateIdentificacion({
                    ...identificacion,
                    tipo_despacho: option ? option.value : '',
                  })
                }
              />
              <Select
                selectContainerStyle={selectStyles.container}
                selectControlStyle={selectStyles.input}
                selectControlButtonsContainerStyle={
                  selectStyles.buttonsContainer
                }
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Tipo Traslado"
                animated={true}
                options={options.tipoTraslado}
                defaultOption={options.tipoTraslado.find(
                  (option) => option.value === identificacion.tipo_traslado
                )}
                onSelect={(option) =>
                  updateIdentificacion({
                    ...identificacion,
                    tipo_traslado: option ? option.value : '',
                  })
                }
              />
            </View>
          </View>
          <View style={{ ...styles.section, ...styles.section.receptor }}>
            <Text style={styles.sectionTitle}> Receptor </Text>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                // @ts-ignore
                selectControlStyle={{
                  ...selectStyles.input,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Razon Social"
                animated={true}
                options={options.clientes}
                defaultOption={options.clientes.find(
                  (option) => option.value === receptor.razon_social
                )}
                onSelect={(option: any) =>
                  handleSelectClienteLogic(
                    option,
                    contratosCompra,
                    contratosVenta,
                    setContratosCompraFiltered,
                    setContratosVentaFiltered,
                    direccionDespachoRef,
                    predioRef,
                    proveedorRef,
                    empresaTransporteRef,
                    choferRef,
                    camionRef
                  )
                }
              />
            </View>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                // @ts-ignore
                selectControlStyle={{
                  ...selectStyles.input,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Direccion Despacho"
                animated={true}
                disabled={receptor.razon_social === ''}
                options={options.destinos}
                defaultOption={options.destinos.find(
                  (option) => option.value === despacho.direccion_destino
                )}
                ref={direccionDespachoRef}
                onSelect={(option) =>
                  updateDespacho({
                    ...despacho,
                    direccion_destino: option?.value as unknown as string,
                  })
                }
              />
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {receptor.rut !== '' && (
                  <Text style={styles.text}>
                    RUT: {receptor.rut} || Comuna: {receptor.comuna}
                  </Text>
                )}
                {receptor.rut !== '' && (
                  <Text style={styles.text}>
                    Direccion: {receptor.direccion}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={{ ...styles.section, ...styles.section.predio }}>
            <Text style={styles.sectionTitle}> Origen </Text>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                selectControlStyle={{
                  ...selectStyles.input,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Comuna - Predio (Origen)"
                // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
                // searchable={true}
                ref={predioRef}
                animated={true}
                options={options.predios}
                defaultOption={options.predios.find(
                  (option) =>
                    option.value === `${predio.comuna} | ${predio.rol}`
                )}
                disabled={receptor.razon_social === ''}
                onSelect={(option) =>
                  handleSelectPredioLogic(
                    option,
                    contratosVenta,
                    contratosVentaFiltered,
                    contratosCompra,
                    setContratosCompraFiltered,
                    setContratosVentaFiltered,
                    proveedorRef,
                    empresaTransporteRef,
                    choferRef,
                    camionRef
                  )
                }
              />
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {predio.rol !== '' && (
                  <Text style={styles.text}>Predio: {predio.rol}</Text>
                )}
                {predio.rol !== '' && (
                  <Text style={styles.text}>
                    GEO: {predio.georreferencia.latitude},
                    {predio.georreferencia.longitude}
                  </Text>
                )}
                {predio.rol !== '' && (
                  <Text style={styles.text}>
                    Plan de Manejo o Uso Suelo: {predio.plan_de_manejo}
                  </Text>
                )}
              </View>
            </View>
            {predio.rol !== '' && (
              <View style={styles.row}>
                <CheckBox
                  checked={certChecked}
                  onPress={handleToggle}
                  containerStyle={styles.checkboxContainer}
                  textStyle={{
                    color: certChecked ? '#2ecc71' : colors.crudo,
                  }}
                  // checkedColor={colors.white}
                />
                <Text style={styles.textCertificate}>
                  CERT: {predio.certificado}
                </Text>
              </View>
            )}
          </View>
          <View style={{ ...styles.section }}>
            <Text style={styles.sectionTitle}> Proveedor A Pagar </Text>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                selectControlStyle={{
                  ...selectStyles.input,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Proveedor"
                // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
                // searchable={true}
                animated={true}
                disabled={predio.rol == '' || receptor.razon_social == ''}
                options={options.proveedores}
                ref={proveedorRef}
                onSelect={(option) => {
                  handleSelectProveedorLogic(
                    option,
                    contratosVenta,
                    contratosCompra,
                    contratosCompraFiltered,
                    setContratosCompraFiltered,
                    setContratosVentaFiltered,
                    empresaTransporteRef,
                    choferRef,
                    camionRef
                  );
                }}
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Datos Despacho </Text>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                // @ts-ignore
                selectControlStyle={{
                  ...selectStyles.input,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Empresa Transportista"
                animated={true}
                disabled={
                  proveedor.razon_social === '' ||
                  despacho.direccion_destino === ''
                }
                options={options.empresasTransporte}
                ref={empresaTransporteRef}
                onSelect={(option) => {
                  return handleSelectEmpresaTransporteLogic(
                    // We add the whole transporte object to the options, so we can access the choferes and camiones
                    option as IOptionsTransportes,
                    contratosCompraFiltered,
                    direccionDespachoRef,
                    choferRef,
                    camionRef
                  );
                }}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  selectContainerStyle={selectStyles.container}
                  // @ts-ignore
                  selectControlStyle={{
                    ...selectStyles.input,
                  }}
                  selectControlArrowImageStyle={selectStyles.buttonsContainer}
                  placeholderText="Chofer"
                  animated={true}
                  ref={choferRef}
                  disabled={despacho.rut_transportista === ''}
                  options={options.choferes}
                  onSelect={(option) => {
                    const parsedChoferOption = {
                      nombre: option?.value.split('/')[0] || '',
                      rut: option?.value.split('/')[1] || '',
                    };
                    updateDespacho({
                      ...despacho,
                      chofer: {
                        nombre: parsedChoferOption.nombre,
                        rut: parsedChoferOption.rut,
                      },
                    });
                  }}
                />
              </View>
              <View style={styles.container}>
                <Select
                  selectContainerStyle={selectStyles.container}
                  // @ts-ignore
                  selectControlStyle={{
                    ...selectStyles.input,
                  }}
                  selectControlArrowImageStyle={selectStyles.buttonsContainer}
                  placeholderText="Camion"
                  animated={true}
                  ref={camionRef}
                  options={options.camiones}
                  disabled={despacho.rut_transportista === ''}
                  onSelect={(option) => {
                    updateDespacho({
                      ...despacho,
                      patente: option?.value || '',
                    });
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAddProductos}>
        <Text style={styles.buttonText}> Agregar Productos </Text>
      </TouchableOpacity>
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
    marginTop: '2%',
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
    dispaly: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 2,
    height: 35,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '90%',
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
    // backgroundColor: 'transparent',
    borderWidth: 0,
    backgroundColor: colors.white,
    left: 5,
  },
});

const selectStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '90%',
    folio: {
      width: '45%',
      alignSelf: 'center',
      marginLeft: '2.5%',
    },
  },
  buttonsContainer: {
    tintColor: colors.secondary,
    width: 10,
    alignSelf: 'center',
    alignContent: 'flex-end',
    alignItems: 'center',
  },
});
