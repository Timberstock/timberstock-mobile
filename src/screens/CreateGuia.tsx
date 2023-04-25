import React, { useEffect, useRef, MutableRefObject, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import { Select, SelectRef } from '@mobile-reality/react-native-select-pro';
import {
  clientesOptions,
  foliosOptions,
  prediosOptions,
  proveedoresOptions,
} from '../resources/options';
import {
  handleSelectPredioLogic,
  handleSelectClienteLogic,
  handleSelectProveedorLogic,
} from '../functions/screenFunctions';
import { createGuiaScreenHooks } from '../functions/screenHooks';
import { AppContext } from '../context/AppContext';

// TODO 1: ADD FIELDS VALIDATIONS, BOTH FOR COMPLETENESS AND CORRECTNESS
// TODO 2: MAKE CERTIFICATE OPTIONAL
export default function CreateGuia(props: any) {
  const { navigation, GlobalState } = props;
  const { rutEmpresa } = GlobalState;
  const { emisor, retrievedData } = useContext(AppContext);

  const {
    options,
    setOptions,
    identificacion,
    setIdentificacion,
    receptor,
    setReceptor,
    despacho,
    setDespacho,
    predio,
    setPredio,
    proveedor,
    setProveedor,
  } = createGuiaScreenHooks();

  const despachoRef = useRef() as MutableRefObject<SelectRef>;
  const planDeManejoRef = useRef() as MutableRefObject<SelectRef>;

  useEffect(() => {
    setOptions({
      ...options,
      folios: foliosOptions(retrievedData.foliosDisp),
      clientes: clientesOptions(retrievedData.clientes),
      predios: prediosOptions(retrievedData.predios),
      proveedores: proveedoresOptions(retrievedData.proveedores),
    });
  }, []);

  const handleAddProductos = () => {
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
    navigation.push('AddProductos', {
      data: {
        retrievedData,
        rutEmpresa,
        guia: {
          identificacion,
          emisor,
          receptor,
          despacho,
          predio,
        },
      },
    });
  };

  const handleSelectCliente = (option: any) => {
    handleSelectClienteLogic(
      option,
      retrievedData,
      options,
      despachoRef,
      despacho,
      setDespacho,
      setReceptor
    );
  };

  const handleSelectPredio = (option: any) => {
    handleSelectPredioLogic(
      option,
      retrievedData,
      options,
      planDeManejoRef,
      predio,
      setPredio
    );
  };

  const handleSelectProveedor = (option: any) => {
    handleSelectProveedorLogic(option, retrievedData, setProveedor);
  };
  return (
    <View style={styles.screen}>
      <Header
        screenName="CreateGuia"
        empresa={emisor.razon_social}
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
                onSelect={(option) =>
                  setIdentificacion({
                    ...identificacion,
                    folio: option?.value as unknown as number,
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
                onSelect={(option) =>
                  setIdentificacion({
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
                onSelect={(option) =>
                  setIdentificacion({
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
                onSelect={handleSelectCliente}
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
                ref={despachoRef}
                onSelect={(option) =>
                  setDespacho({
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Datos Despacho </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre Chofer"
                  value={despacho.chofer.nombre}
                  onChangeText={(e) => {
                    setDespacho({
                      ...despacho,
                      chofer: {
                        ...despacho.chofer,
                        nombre: e,
                      },
                    });
                  }}
                />
              </View>
              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  placeholder="RUT (sin puntos c/ guión)"
                  value={despacho.chofer.rut}
                  onChangeText={(e) => {
                    setDespacho({
                      ...despacho,
                      chofer: {
                        ...despacho.chofer,
                        rut: e,
                      },
                    });
                  }}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  placeholder="Patente"
                  value={despacho.patente}
                  onChangeText={(e) => {
                    setDespacho({
                      ...despacho,
                      patente: e,
                    });
                  }}
                />
              </View>
              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  placeholder="RUT Transportista"
                  value={despacho.rut_transportista}
                  onChangeText={(e) => {
                    setDespacho({
                      ...despacho,
                      rut_transportista: e,
                    });
                  }}
                />
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
                animated={true}
                options={options.predios}
                onSelect={handleSelectPredio}
              />
            </View>
            <View style={styles.row}>
              <Select
                selectContainerStyle={selectStyles.container}
                selectControlStyle={{
                  ...selectStyles.input,
                }}
                selectControlArrowImageStyle={selectStyles.buttonsContainer}
                placeholderText="Plan de Manejo"
                animated={true}
                disabled={predio.manzana === ''}
                ref={planDeManejoRef}
                options={options.planesDeManejo}
                onSelect={(option) =>
                  setPredio({
                    ...predio,
                    plan_de_manejo: [option?.value as unknown as string],
                  })
                }
              />
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {predio.rol !== '' && (
                  <Text style={styles.text}>
                    Predio: {predio.manzana} - {predio.rol}
                  </Text>
                )}
                {predio.rol !== '' && (
                  <Text style={styles.text}>
                    GEO: {predio.georreferencia.latitude},
                    {predio.georreferencia.longitude}
                  </Text>
                )}
                {predio.rol !== '' && (
                  <Text style={styles.text}>CERT: {predio.certificado}</Text>
                )}
              </View>
            </View>
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
                placeholderText="Proveedores"
                // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
                // searchable={true}
                animated={true}
                options={options.proveedores}
                onSelect={handleSelectProveedor}
              />
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
    justifyContent: 'space-between',
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
