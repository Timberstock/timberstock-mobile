import PDFViewer from '@/components/guias/PDFViewer';
import { useApp } from '@/context/app/AppContext';
import { MetaDataUsuario } from '@/context/app/types/guia';
import { useGuiaCreation } from '@/context/guia-creation/creation/CreationContext';
import { PDFService } from '@/context/guia-creation/creation/services/pdf';
import { GuiaFormData } from '@/context/guia-creation/guia-form/types';
import { ProductoFormData } from '@/context/guia-creation/producto-form/types';
import { theme } from '@/theme';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, FAB, Surface, Text, TextInput } from 'react-native-paper';
import { GuiaDespachoCardItem } from '../guias/Card';

const PrecioModal = ({
  guiaForm,
  productoForm,
  modalVisible,
  setModalVisible,
}: {
  guiaForm: GuiaFormData;
  productoForm: ProductoFormData;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}) => {
  const {
    state: { empresa },
  } = useApp();
  const {
    state: { isSubmitting },
    submitGuia,
    combineGuiaProductoForms,
  } = useGuiaCreation();

  const [precio, setPrecio] = useState('');
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handlePreviewPDF = async () => {
    if (!precio) return;

    setIsLoading(true);
    try {
      setLoadingMessage('Preparando datos de la guía...');
      const tempGuia = combineGuiaProductoForms(Number(precio), guiaForm, productoForm);

      try {
        const uri = await PDFService.generatePreviewPDF(
          empresa,
          tempGuia,
          new Date().toISOString(),
          setLoadingMessage
        );
        setPdfUri(uri);
        setShowPDFPreview(true);
      } catch (printError) {
        console.error('Error in PDF generation:', printError);
        Alert.alert(
          'Error',
          'No se pudo generar el PDF después de varios intentos. Por favor, inténtelo de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error generating preview PDF:', error);
      Alert.alert('Error', 'No se pudo generar la vista previa del PDF');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSubmitGuia = async () => {
    try {
      setSubmissionStatus('Preparando guía para envío...');
      const guiaToSubmit = combineGuiaProductoForms(
        Number(precio),
        guiaForm,
        productoForm
      );
      await submitGuia(guiaToSubmit, (status: string) => {
        setSubmissionStatus(status);
      });
    } catch (error) {
      console.error('Error submitting guia:', error);
      setSubmissionStatus('');
    }
  };

  const previewGuia = combineGuiaProductoForms(Number(0), guiaForm, productoForm);

  return (
    <Modal visible={modalVisible} animationType="fade" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.modalView}>
              <Surface style={styles.container} elevation={5}>
                <Text variant="headlineSmall" style={styles.title}>
                  Resumen Guía Despacho
                </Text>

                <View style={styles.previewContainer}>
                  <View style={styles.cardContainer}>
                    <GuiaDespachoCardItem
                      cardItem={{
                        ...previewGuia,
                        id: 'PREVIEW_GUIA',
                        estado: 'pendiente',
                        _caf_id: '',
                        usuario_metadata: {} as MetaDataUsuario,
                        pdf_url: '',
                      }}
                      setPdfItem={() => {}}
                      preview={true}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text variant="titleMedium" style={styles.inputLabel}>
                    Precio Unitario Guía
                  </Text>
                  <TextInput
                    mode="outlined"
                    keyboardType="numeric"
                    value={precio}
                    onChangeText={setPrecio}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    right={<TextInput.Affix text="CLP" />}
                    onSubmitEditing={Keyboard.dismiss}
                    blurOnSubmit={true}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Keyboard.dismiss();
                      setModalVisible(false);
                    }}
                    style={styles.button}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Keyboard.dismiss();
                      handlePreviewPDF();
                    }}
                    disabled={!precio}
                    style={styles.button}
                    loading={isLoading}
                  >
                    Ver PDF
                  </Button>
                </View>
                {isLoading && loadingMessage && (
                  <Text variant="bodyMedium" style={styles.loadingMessage}>
                    {loadingMessage}
                  </Text>
                )}
                <Text variant="bodySmall" style={styles.disclaimer}>
                  * La vista previa del PDF se mostrará sin código de barras
                </Text>
              </Surface>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        transparent={true}
        visible={showPDFPreview}
      >
        <View style={styles.pdfModalContainer}>
          <PDFViewer
            item={{
              folio: guiaForm.identificacion_folio!,
              empresaId: empresa.id,
              pdfLocalUri: pdfUri || '',
            }}
            onClose={() => {
              setShowPDFPreview(false);
              if (pdfUri) {
                FileSystem.deleteAsync(pdfUri, { idempotent: true });
              }
            }}
            preview={true}
          />
        </View>
        <View style={styles.confirmationContainer}>
          {submissionStatus ? (
            <Text style={styles.submissionStatus}>{submissionStatus}</Text>
          ) : null}
          <FAB
            icon="check"
            label={isSubmitting ? 'PROCESANDO...' : 'CONFIRMAR CREACIÓN'}
            style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
            color={theme.colors.onPrimary}
            onPress={handleSubmitGuia}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    gap: 20,
  },
  title: {
    color: theme.colors.onSurface,
    textAlign: 'center',
    fontWeight: '500',
  },
  previewContainer: {
    marginHorizontal: -16,
    backgroundColor: theme.colors.surface,
  },
  cardContainer: {
    minHeight: 160,
    padding: 16,
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
  confirmButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderColor: 'black',
    borderWidth: 2,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  disclaimer: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    fontStyle: 'italic',
  },
  pdfModalContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingMessage: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginTop: 8,
  },
  confirmationContainer: {
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  submissionStatus: {
    color: theme.colors.onPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
});

export default PrecioModal;
