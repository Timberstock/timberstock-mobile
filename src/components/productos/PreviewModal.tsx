import PDFViewer from '@/components/guias/PDFViewer';
import { useApp } from '@/context/app/AppContext';
import { MetaDataUsuario } from '@/context/app/types/guia';
import { useGuiaCreation } from '@/context/guia-creation/creation/CreationContext';
import { PDFService } from '@/context/guia-creation/creation/services/pdf';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { theme } from '@/theme';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import { Button, FAB, Surface, Text, TextInput } from 'react-native-paper';
import { GuiaDespachoCardItem } from '../guias/Card';

const PrecioModal = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}) => {
  const {
    state: { empresa, localFiles },
  } = useApp();
  const {
    state: { isSubmitting },
    submitGuia,
    combineGuiaProductoForms,
  } = useGuiaCreation();

  const {
    state: { guia: guiaForm },
  } = useGuiaForm();

  const {
    state: { productoForm },
  } = useProductoForm();

  const guiaIncomplete = combineGuiaProductoForms(Number(0), guiaForm, productoForm);
  const guiaItem = {
    ...guiaIncomplete,
    estado: 'pendiente',
    pdf_local_checked_uri: '',
    pdf_url: '',
    _caf_id: '',
    usuario_metadata: {} as MetaDataUsuario,
  };

  const [precio, setPrecio] = useState('');
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const handlePreviewPDF = async () => {
    if (!precio) return;

    try {
      // Find logo file
      const logoFile = localFiles.find((file) => file.name === 'logo.png');
      let logoBase64: string | undefined;

      if (logoFile) {
        // Read the file and convert to base64
        const base64 = await FileSystem.readAsStringAsync(logoFile.path, {
          encoding: FileSystem.EncodingType.Base64,
        });
        logoBase64 = `data:image/png;base64,${base64}`;
      }

      // Create temporary guia with precio
      const tempGuia = combineGuiaProductoForms(Number(precio), guiaForm, productoForm);

      // Generate PDF HTML with logo
      const html = await PDFService.createPDFHTMLString(
        empresa,
        tempGuia,
        new Date().toISOString(),
        { uri: '', width: 0, height: 0 }, // Empty barcode
        logoBase64 // Pass the base64 logo
      );

      // Create temporary PDF
      const { uri } = await Print.printToFileAsync({ html });
      setPdfUri(uri);
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Error generating preview PDF:', error);
      Alert.alert('Error', 'No se pudo generar la vista previa del PDF');
    }
  };

  return (
    <Modal visible={modalVisible} animationType="fade" transparent>
      {!showPDFPreview ? (
        <View style={styles.overlay}>
          <Surface style={styles.container} elevation={5}>
            <Text variant="headlineSmall" style={styles.title}>
              Resumen Guía Despacho
            </Text>

            {modalVisible && (
              <View style={styles.previewContainer}>
                <GuiaDespachoCardItem
                  item={guiaItem}
                  setPdfItem={() => {}}
                  preview={true}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text variant="titleMedium" style={styles.inputLabel}>
                Precio Unitario
              </Text>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={precio}
                onChangeText={setPrecio}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                right={<TextInput.Affix text="CLP" />}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.button}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handlePreviewPDF}
                disabled={!precio}
                style={styles.button}
              >
                Ver PDF
              </Button>
            </View>
            <Text variant="bodySmall" style={styles.disclaimer}>
              * La vista previa del PDF se mostrará sin código de barras
            </Text>
          </Surface>
        </View>
      ) : (
        <View style={styles.pdfPreviewContainer}>
          {pdfUri && (
            <PDFViewer
              item={{
                ...guiaItem,
                pdf_local_checked_uri: pdfUri,
              }}
              onClose={() => {
                setShowPDFPreview(false);
                // Clean up temporary PDF
                FileSystem.deleteAsync(pdfUri, { idempotent: true });
              }}
              preview={true}
            />
          )}
          <FAB
            icon="check"
            label="CONFIRMAR"
            style={styles.confirmButton}
            color={theme.colors.onPrimary}
            onPress={() =>
              submitGuia(
                combineGuiaProductoForms(Number(precio), guiaForm, productoForm)
              )
            }
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    gap: 24,
  },
  title: {
    color: theme.colors.onSurface,
    textAlign: 'center',
    fontWeight: '500',
  },
  previewContainer: {
    marginHorizontal: -16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    color: theme.colors.onSurface,
  },
  input: {
    backgroundColor: theme.colors.surface,
    height: 56,
  },
  inputOutline: {
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 100,
    height: 48,
    padding: 0,
  },
  pdfPreviewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  confirmButton: {
    position: 'absolute',
    bottom: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    color: theme.colors.onPrimary,
  },
  confirmButtonLabel: {
    color: theme.colors.onPrimary,
  },
  disclaimer: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default PrecioModal;
