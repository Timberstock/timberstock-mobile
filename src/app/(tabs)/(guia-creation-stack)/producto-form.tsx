import CustomDropdown from '@/components/CustomDropdown';
import Aserrable from '@/components/productos/Aserrable';
import PreviewModal from '@/components/productos/PreviewModal';
import Pulpable from '@/components/productos/Pulpable';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { theme } from '@/theme';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Surface, Text } from 'react-native-paper';

export default function ProductoForm() {
  const {
    state: { guia: guiaFormData },
  } = useGuiaForm();

  const {
    state: { productoForm: productoFormData, options: productoFormOptions },
    isFormValid,
    updateTipo,
    updateProductoInfo,
  } = useProductoForm();

  const [modalVisible, setModalVisible] = useState(false);

  const onOpenModalButtonPress = () => {
    const allowOpen = isFormValid();
    setModalVisible(allowOpen);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contract Codes Section */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Códigos Contrato Venta
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Código FSC: {guiaFormData.codigo_fsc || 'Sin Código'}
              </Text>
              <Text style={styles.infoText}>
                Código Contrato Externo:{' '}
                {guiaFormData.codigo_contrato_externo || 'Sin Código'}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Product Selection Section */}
        <Surface style={styles.section} mode="elevated" elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Producto
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.sectionContent}>
            <CustomDropdown
              placeholder="Tipo Producto"
              value={productoFormData.tipo}
              data={productoFormOptions.tipos}
              labelField="label"
              valueField="object"
              onChange={(item) => updateTipo(item.object)}
              onClear={() => updateTipo(null)}
            />
            <CustomDropdown
              placeholder="Producto"
              value={productoFormData.info?.codigo || null}
              data={productoFormOptions.productos}
              labelField="label"
              valueField="info.codigo"
              onChange={(item) => updateProductoInfo(item)}
              onClear={() => updateProductoInfo(null)}
              disabled={
                !productoFormData.tipo || productoFormOptions.productos.length === 0
              }
            />
          </View>
        </Surface>

        {/* Dynamic Product Detail Section */}
        {productoFormData.info?.codigo && (
          <Surface style={styles.section} mode="elevated" elevation={1}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Detalle
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.sectionContent}>
              {productoFormData.tipo === 'Aserrable' && <Aserrable />}
              {productoFormData.tipo === 'Pulpable' && <Pulpable />}
            </View>
          </Surface>
        )}
      </ScrollView>

      <Button
        mode="contained"
        onPress={onOpenModalButtonPress}
        disabled={!productoFormData.info?.codigo}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Crear Guía Despacho
      </Button>
      {modalVisible && (
        <PreviewModal
          guiaForm={guiaFormData}
          productoForm={productoFormData}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      )}
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
  infoCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  infoText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  button: {
    margin: 16,
    borderRadius: 100,
    height: 56,
  },
  buttonContent: {
    height: 56,
  },
});
