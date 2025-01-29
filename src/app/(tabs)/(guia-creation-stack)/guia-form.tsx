// Arreglo de renderkeys para que se actualicen los selects desde https://github.com/MobileReality/react-native-select-pro/issues/237
import CustomDropdown from '@/components/CustomDropdown';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { theme } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identification */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Identificación Guía
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Nº Folio"
              value={guiaFormData.identificacion_folio}
              data={guiaFormOptions.identificacion_folios}
              labelField="label"
              valueField="value"
              onChange={(item) => updateField('identificacion_folio', item.value)}
              onClear={() => updateField('identificacion_folio', null)}
            />
            <View style={styles.row}>
              <CustomDropdown
                placeholder="Tipo Despacho"
                value={guiaFormData.identificacion_tipo_despacho}
                data={guiaFormOptions.identificacion_tipos_despacho}
                labelField="label"
                valueField="value"
                onChange={(item) =>
                  updateField('identificacion_tipo_despacho', item.value)
                }
                onClear={() => updateField('identificacion_tipo_despacho', null)}
                style={styles.flex1}
              />
              <CustomDropdown
                placeholder="Tipo Traslado"
                value={guiaFormData.identificacion_tipo_traslado}
                data={guiaFormOptions.identificacion_tipos_traslado}
                labelField="label"
                valueField="value"
                onChange={(item) =>
                  updateField('identificacion_tipo_traslado', item.value)
                }
                onClear={() => updateField('identificacion_tipo_traslado', null)}
                style={styles.flex1}
              />
            </View>
          </View>
        </Surface>

        {/* Provider */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Proveedor
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Proveedor"
              value={guiaFormData.proveedor?.rut || null}
              data={guiaFormOptions.proveedores}
              labelField="razon_social"
              valueField="rut"
              onChange={(item) => updateField('proveedor', item)}
              onClear={() => updateField('proveedor', null)}
            />
            <TextInput
              mode="outlined"
              label="Folio Proveedor (opcional)"
              value={guiaFormData.folio_guia_proveedor?.toString() || ''}
              onChangeText={(text) => updateField('folio_guia_proveedor', text)}
              keyboardType="numeric"
              outlineStyle={styles.inputOutline}
              style={styles.textInput}
            />
          </View>
        </Surface>

        {/* Origin */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Origen
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Predio"
              value={guiaFormData.faena?.rol || null}
              data={guiaFormOptions.faenas}
              labelField="nombre"
              valueField="rol"
              onChange={(item) => updateField('faena', item)}
              onClear={() => updateField('faena', null)}
              disabled={!guiaFormData.proveedor}
            />
            {guiaFormData.faena?.rol && (
              <Surface style={styles.infoCard} mode="flat">
                <Text variant="bodyMedium" style={styles.infoText}>
                  Rol: {guiaFormData.faena.rol}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  GEO: {guiaFormData.faena.georreferencia.latitude},{' '}
                  {guiaFormData.faena.georreferencia.longitude}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  Plan de Manejo: {guiaFormData.faena.plan_de_manejo}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  Cert. Proveedor: {guiaFormData.faena.certificado}
                </Text>
              </Surface>
            )}
          </View>
        </Surface>

        {/* Client */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cliente
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Receptor"
              value={guiaFormData.cliente?.rut || null}
              data={guiaFormOptions.clientes}
              labelField="razon_social"
              valueField="rut"
              onChange={(item) => updateField('cliente', item)}
              onClear={() => updateField('cliente', null)}
              disabled={!guiaFormData.faena || !guiaFormData.proveedor}
            />
            {guiaFormData.cliente?.rut && (
              <Surface style={styles.infoCard} mode="flat">
                <Text variant="bodyMedium" style={styles.infoText}>
                  RUT: {guiaFormData.cliente.rut}
                </Text>
                <Text variant="bodyMedium" style={styles.infoText}>
                  Dirección: {guiaFormData.cliente.direccion},{' '}
                  {guiaFormData.cliente.comuna}
                </Text>
              </Surface>
            )}
            <CustomDropdown
              placeholder="Dirección Despacho"
              value={guiaFormData.destino_contrato?.nombre || null}
              data={guiaFormOptions.destinos_contrato}
              labelField="nombre"
              valueField="nombre"
              onChange={(item) => updateField('destino_contrato', item)}
              onClear={() => updateField('destino_contrato', null)}
              disabled={
                !guiaFormData.proveedor || !guiaFormData.faena || !guiaFormData.cliente
              }
            />
            {guiaFormData.destino_contrato?.rol && (
              <Surface style={styles.infoCard} mode="flat">
                <Text variant="bodyMedium" style={styles.infoText}>
                  Rol: {guiaFormData.destino_contrato.rol} | Comuna:{' '}
                  {guiaFormData.destino_contrato.comuna}
                </Text>
              </Surface>
            )}
          </View>
        </Surface>

        {/* Services */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Servicios
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Servicio Carguío"
              value={guiaFormData.servicios_carguio_empresa?.empresa.rut || null}
              data={guiaFormOptions.servicios_carguio_empresas || []}
              labelField="empresa.razon_social"
              valueField="empresa.rut"
              onChange={(item) => updateField('servicios_carguio_empresa', item)}
              onClear={() => updateField('servicios_carguio_empresa', null)}
              disabled={
                !guiaFormData.proveedor ||
                !guiaFormData.faena ||
                !guiaFormData.cliente ||
                guiaFormOptions.servicios_carguio_empresas.length === 0
              }
            />
            <CustomDropdown
              placeholder="Servicio Cosecha"
              value={guiaFormData.servicios_cosecha_empresa?.empresa.rut || null}
              data={guiaFormOptions.servicios_cosecha_empresas || []}
              labelField="empresa.razon_social"
              valueField="empresa.rut"
              onChange={(item) => updateField('servicios_cosecha_empresa', item)}
              onClear={() => updateField('servicios_cosecha_empresa', null)}
              disabled={
                !guiaFormData.proveedor ||
                !guiaFormData.faena ||
                !guiaFormData.cliente ||
                guiaFormOptions.servicios_cosecha_empresas.length === 0
              }
            />
          </View>
        </Surface>

        {/* Dispatch */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Datos Despacho
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Empresa Transporte"
              value={guiaFormData.transporte_empresa?.rut || null}
              data={guiaFormOptions.transporte_empresas || []}
              labelField="razon_social"
              valueField="rut"
              onChange={(item) => updateField('transporte_empresa', item)}
              onClear={() => updateField('transporte_empresa', null)}
              disabled={
                !guiaFormData.proveedor ||
                !guiaFormData.cliente ||
                !guiaFormData.faena ||
                !guiaFormData.destino_contrato
              }
            />
            <CustomDropdown
              placeholder="Chofer"
              value={guiaFormData.transporte_empresa_chofer?.rut || null}
              data={guiaFormOptions.transporte_empresa_choferes || []}
              labelField="nombre"
              valueField="rut"
              onChange={(item) => updateField('transporte_empresa_chofer', item)}
              onClear={() => updateField('transporte_empresa_chofer', null)}
              disabled={
                !guiaFormData.proveedor ||
                !guiaFormData.cliente ||
                !guiaFormData.faena ||
                !guiaFormData.destino_contrato ||
                !guiaFormData.transporte_empresa
              }
            />
            <View style={styles.row}>
              <CustomDropdown
                placeholder="Camión"
                value={guiaFormData.transporte_empresa_camion?.patente || null}
                data={guiaFormOptions.transporte_empresa_camiones || []}
                labelField="patente"
                valueField="patente"
                onChange={(item) => updateField('transporte_empresa_camion', item)}
                onClear={() => updateField('transporte_empresa_camion', null)}
                disabled={
                  !guiaFormData.proveedor ||
                  !guiaFormData.cliente ||
                  !guiaFormData.faena ||
                  !guiaFormData.destino_contrato ||
                  !guiaFormData.transporte_empresa
                }
                style={styles.flex1}
              />
              <CustomDropdown
                placeholder="Carro"
                value={guiaFormData.transporte_empresa_carro?.patente || null}
                data={guiaFormOptions.transporte_empresa_carros || []}
                labelField="patente"
                valueField="patente"
                onChange={(item) => updateField('transporte_empresa_carro', item)}
                onClear={() => updateField('transporte_empresa_carro', null)}
                disabled={
                  !guiaFormData.proveedor ||
                  !guiaFormData.cliente ||
                  !guiaFormData.faena ||
                  !guiaFormData.destino_contrato ||
                  !guiaFormData.transporte_empresa
                }
                style={styles.flex1}
              />
            </View>
          </View>
        </Surface>

        {/* Observations */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Observaciones
            </Text>
            <IconButton
              icon="plus-circle"
              mode="contained-tonal"
              onPress={() => updateObservacionField('add')}
              style={styles.addButton}
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            {guiaFormData.observaciones?.map((obs, index) => (
              <View key={index} style={styles.observationRow}>
                <TextInput
                  mode="outlined"
                  value={obs}
                  onChangeText={(text) => updateObservacionField('update', index, text)}
                  style={styles.flex1}
                  outlineStyle={styles.inputOutline}
                />
                <IconButton
                  icon="close-circle"
                  mode="contained-tonal"
                  onPress={() => updateObservacionField('remove', index)}
                />
              </View>
            ))}
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={nextStep}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon={({ size, color }) => (
            <Icon name="arrow-forward" size={size} color={color} />
          )}
        >
          Agregar Productos
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: theme.colors.outlineVariant,
  },
  sectionContent: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  flex1: {
    flex: 1,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  inputOutline: {
    borderRadius: 8,
  },
  infoCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  infoText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  observationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    margin: 0,
  },
  button: {
    marginTop: 8,
    borderRadius: 100,
    height: 56,
  },
  buttonContent: {
    height: 56,
  },
});
