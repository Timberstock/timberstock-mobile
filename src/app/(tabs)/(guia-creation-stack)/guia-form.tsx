// Arreglo de renderkeys para que se actualicen los selects desde https://github.com/MobileReality/react-native-select-pro/issues/237
import colors from '@/constants/colors';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { SelectorOption } from '@/context/guia-creation/guia-form/types';
import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { Select, SelectStyles } from '@mobile-reality/react-native-select-pro';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function GuiaForm() {
  const router = useRouter();
  const {
    state: { guia: guiaFormData, options: guiaFormOptions },
    updateField,
    updateObservacionField,
    isFormValid,
  } = useGuiaForm();

  const { resetForm } = useProductoForm();

  const [renderKey, setRenderKey] = useState(0);

  const nextStep = () => {
    const valid = isFormValid();

    if (!valid) {
      Alert.alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    resetForm();
    router.push('/(tabs)/(guia-creation-stack)/producto-form');
  };

  return (
    <View style={styles.screen}>
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
                  options={guiaFormOptions.identificacion_folios}
                  defaultOption={guiaFormOptions.identificacion_folios.find(
                    (option) =>
                      option.value === guiaFormData.identificacion_folio?.toString()
                  )}
                  onSelect={(option) => {
                    updateField('identificacion_folio', option.value);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('identificacion_folio', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-folio`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Tipo Despacho"
                  animation={true}
                  options={guiaFormOptions.identificacion_tipos_despacho}
                  defaultOption={guiaFormOptions.identificacion_tipos_despacho.find(
                    (option) =>
                      option.value === guiaFormData.identificacion_tipo_despacho
                  )}
                  onSelect={(option) => {
                    updateField('identificacion_tipo_despacho', option.value);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('identificacion_tipo_despacho', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-tipo-despacho`}
                />
              </View>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Tipo Traslado"
                  animation={true}
                  options={guiaFormOptions.identificacion_tipos_traslado}
                  defaultOption={guiaFormOptions.identificacion_tipos_traslado.find(
                    (option) =>
                      option.value === guiaFormData.identificacion_tipo_traslado
                  )}
                  onSelect={(option) => {
                    updateField('identificacion_tipo_traslado', option.value);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('identificacion_tipo_traslado', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-tipo-traslado`}
                />
              </View>
            </View>
          </View>
          <View style={{ ...styles.section }}>
            <Text style={styles.sectionTitle}> Proveedor</Text>
            <Select
              styles={selectStyles}
              placeholderText="Proveedor"
              // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
              // searchable={true}
              animation={true}
              options={guiaFormOptions.proveedores}
              defaultOption={guiaFormOptions.proveedores.find(
                (option) => option.value === guiaFormData.proveedor?.rut
              )}
              onSelect={(option: SelectorOption) => {
                updateField('proveedor', option?.optionObject);
                setRenderKey(renderKey + 1);
              }}
              onRemove={() => {
                updateField('proveedor', null);
                setRenderKey(renderKey + 1);
              }}
              key={`${renderKey}-proveedor`}
            />
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                value={
                  guiaFormData.folio_guia_proveedor &&
                  guiaFormData.folio_guia_proveedor !== 0
                    ? guiaFormData.folio_guia_proveedor.toString()
                    : ''
                }
                placeholder={'Folio Proveedor (opcional)'}
                keyboardType="numeric"
                onChangeText={(text) => updateField('folio_guia_proveedor', text)}
              />
            </View>
          </View>
          <View style={[styles.section, { height: 230 }]}>
            <Text style={styles.sectionTitle}> Origen </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Predio - Comuna"
                  // TODO: FIX PROBLEMS WITH SEARCHABLE TRUE AND KEYBOARD AWARE SCROLL VIEW
                  // searchable={true}
                  animation={true}
                  options={guiaFormOptions.predios}
                  defaultOption={guiaFormOptions.predios.find(
                    (option) => option.value === guiaFormData.predio_origen?.rol
                  )}
                  disabled={!guiaFormData.proveedor}
                  onSelect={(option: SelectorOption) => {
                    updateField('predio_origen', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('predio_origen', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-predios`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guiaFormData.predio_origen?.rol && (
                  <Text style={styles.text}>Rol: {guiaFormData.predio_origen.rol}</Text>
                )}
                {guiaFormData.predio_origen?.rol && (
                  <Text style={styles.text}>
                    GEO: {guiaFormData.predio_origen?.georreferencia.latitude},
                    {guiaFormData.predio_origen?.georreferencia.longitude}
                  </Text>
                )}
                {guiaFormData.predio_origen?.rol && (
                  <Text style={styles.text}>
                    Plan de Manejo o Uso Suelo:{' '}
                    {guiaFormData.predio_origen.plan_de_manejo}
                  </Text>
                )}
              </View>
            </View>
            {guiaFormData.predio_origen?.rol && (
              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  Cert. Proveedor: {guiaFormData.predio_origen.certificado}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.section, { height: 250 }]}>
            <Text style={styles.sectionTitle}> Cliente </Text>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  placeholderText="Razon Social"
                  styles={selectStyles}
                  animation={true}
                  options={guiaFormOptions.clientes}
                  disabled={!guiaFormData.predio_origen || !guiaFormData.proveedor}
                  defaultOption={guiaFormOptions.clientes.find(
                    (option) => option.value === guiaFormData.receptor?.rut
                  )}
                  onSelect={(option: SelectorOption) => {
                    updateField('receptor', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('receptor', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-clientes`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guiaFormData.receptor?.rut !== '' && (
                  <Text style={styles.text}>RUT: {guiaFormData.receptor?.rut}</Text>
                )}
                {guiaFormData.receptor?.rut !== '' && (
                  <Text style={styles.text}>
                    Direccion: {guiaFormData.receptor?.direccion},{' '}
                    {guiaFormData.receptor?.comuna}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  placeholderText="Direccion Despacho"
                  styles={selectStyles}
                  animation={true}
                  options={guiaFormOptions.destinos}
                  defaultOption={guiaFormOptions.destinos.find(
                    (option) => option.value === guiaFormData.destino?.nombre
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.receptor
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('destino', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('destino', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-despachos`}
                />
              </View>
            </View>
            <View />
            <View style={styles.row}>
              <View style={styles.textContainer}>
                {guiaFormData.destino?.rol && (
                  <Text style={styles.text}>
                    Rol: {guiaFormData.destino.rol} || Comuna:{' '}
                    {guiaFormData.destino.comuna}
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
                  options={guiaFormOptions.servicio_carguio_empresas}
                  defaultOption={guiaFormOptions.servicio_carguio_empresas.find(
                    (option) =>
                      option.value ===
                      guiaFormData.servicios_carguio_empresa?.empresa.rut
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.receptor ||
                    guiaFormOptions.servicio_carguio_empresas.length === 0
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('servicios_carguio_empresa', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('servicios_carguio_empresa', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-carguio`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Cosecha"
                  animation={true}
                  options={guiaFormOptions.servicio_cosecha_empresas}
                  defaultOption={guiaFormOptions.servicio_cosecha_empresas.find(
                    (option) =>
                      option.value ===
                      guiaFormData.servicios_cosecha_empresa?.empresa.rut
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.receptor ||
                    guiaFormOptions.servicio_cosecha_empresas.length === 0
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('servicios_cosecha_empresa', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('servicios_cosecha_empresa', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-cosecha`}
                />
              </View>
            </View>
          </View>
          <View style={[styles.section, { height: 250 }]}>
            <Text style={styles.sectionTitle}> Datos Despacho </Text>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Empresa Transportista"
                  animation={true}
                  options={guiaFormOptions.transporte_empresas}
                  defaultOption={guiaFormOptions.transporte_empresas.find(
                    (option) => option.value === guiaFormData.transporte_empresa?.rut
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.receptor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.destino
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('transporte_empresa', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('transporte_empresa', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-transportistas`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Select
                  styles={selectStyles}
                  placeholderText="Chofer"
                  animation={true}
                  options={guiaFormOptions.transporte_empresa_choferes}
                  defaultOption={guiaFormOptions.transporte_empresa_choferes.find(
                    (option) =>
                      option.value === guiaFormData.transporte_empresa_chofer?.rut
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.receptor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.destino ||
                    !guiaFormData.transporte_empresa
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('transporte_empresa_chofer', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('transporte_empresa_chofer', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-choferes`}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Camion"
                  animation={true}
                  options={guiaFormOptions.transporte_empresa_camiones}
                  defaultOption={guiaFormOptions.transporte_empresa_camiones.find(
                    (option) =>
                      option.value === guiaFormData.transporte_empresa_camion?.patente
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.receptor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.destino ||
                    !guiaFormData.transporte_empresa
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('transporte_empresa_camion', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('transporte_empresa_camion', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-camiones`}
                />
              </View>
              <View style={styles.container}>
                <Select
                  styles={selectStyles}
                  placeholderText="Carro"
                  animation={true}
                  options={guiaFormOptions.transporte_empresa_carros}
                  defaultOption={guiaFormOptions.transporte_empresa_carros.find(
                    (option) => option.value === guiaFormData.transporte_empresa_carro
                  )}
                  disabled={
                    !guiaFormData.proveedor ||
                    !guiaFormData.receptor ||
                    !guiaFormData.predio_origen ||
                    !guiaFormData.destino ||
                    !guiaFormData.transporte_empresa
                  }
                  onSelect={(option: SelectorOption) => {
                    updateField('transporte_empresa_carro', option?.optionObject);
                    setRenderKey(renderKey + 1);
                  }}
                  onRemove={() => {
                    updateField('transporte_empresa_carro', null);
                    setRenderKey(renderKey + 1);
                  }}
                  key={`${renderKey}-carros`}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              ...styles.section,
              height: 150 + (guiaFormData.observaciones?.length || 0) * 50,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ ...styles.sectionTitle }}>Observaciones</Text>
              <TouchableOpacity
                style={{
                  marginTop: '1%',
                  marginRight: '5%',
                }}
                onPress={() => updateObservacionField('add')}
              >
                <Icon name="add-circle-outline" size={40} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            {guiaFormData.observaciones?.map((observacion, index) => (
              <View
                style={{
                  ...styles.container,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                // key={`${renderKey}-view-${renderKey}-${index}`}
              >
                <TextInput
                  style={{ ...styles.input, width: '80%' }}
                  value={observacion}
                  placeholder={`Observacion ${index + 1}`}
                  maxLength={100}
                  // key={`${renderKey}-textinput-${renderKey}-${index}`}
                  onChangeText={(text) => {
                    updateObservacionField('update', index, text);
                  }}
                />
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    marginLeft: '2%',
                  }}
                  // key={`${renderKey}-touchable-${renderKey}-${index}`}
                  onPress={() => {
                    updateObservacionField('remove', index);
                  }}
                >
                  <Icon
                    name="remove-circle-outline"
                    size={35}
                    color={colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {/* Add an empty space */}
          <View style={{ height: 30 }} />
          <TouchableOpacity style={styles.button} onPress={() => nextStep()}>
            <Text style={styles.buttonText}> Agregar Productos </Text>
            <Icon
              name="arrow-forward"
              style={styles.icon}
              size={20}
              color={colors.white}
            />
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

  // textCertificate: {
  //   fontSize: 14,
  //   fontWeight: "normal",
  //   alignSelf: "center",
  // },
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
    flexDirection: 'row',
    width: '90%',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    flex: 3,
  },
  icon: {
    flex: 1,
    right: 0,
    textAlign: 'right',
    fontWeight: 'bold',
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
  optionsList: {
    borderColor: '#cccccc',
    marginTop: Platform.OS === 'ios' ? 0 : 51,
  },
};
