import { useEffect, useState } from 'react';
import { Alert, Animated, Linking, Modal, StyleSheet, View } from 'react-native';
import {
  Button,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import PDFViewer, { PDFViewerItem } from './PDFViewer';
interface PDFActionModalProps {
  item: PDFActionModalItem | null;
  setItem: (item: PDFActionModalItem | null) => void;
}

export interface PDFActionModalItem extends PDFViewerItem {
  id: string;
  pdf_url: string;
}

export default function PDFActionModal({ item, setItem }: PDFActionModalProps) {
  const [isViewing, setIsViewing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const theme = useTheme();

  useEffect(() => {
    if (item) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [item]);

  const handleView = () => {
    if (!item?.pdfLocalUri) {
      _handleAlertNoPDF('local');
      return;
    }
    setIsViewing(true);
  };

  const handleWebView = () => {
    if (!item?.pdf_url) {
      _handleAlertNoPDF('web');
      return;
    }
    Linking.openURL(item.pdf_url);
  };

  const _handleAlertNoPDF = (where: 'local' | 'web') => {
    Alert.alert('Error', `No se encontró ningún PDF ${where} asociado a esta guía`);
  };

  const handleClosePDFViewer = () => {
    setIsViewing(false);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsViewing(false);
      setItem(null);
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={item !== null}
      statusBarTranslucent={true}
    >
      <TouchableRipple style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalView,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                Opciones PDF
              </Text>
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Guía #{item?.folio}
              </Text>
            </View>
            <IconButton
              icon="close"
              mode="contained-tonal"
              size={20}
              onPress={handleClose}
              style={styles.closeIcon}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleView}
            disabled={!item?.pdfLocalUri}
            icon={({ size, color }) => (
              <Icon name="file-pdf-o" size={size} color={color} />
            )}
            style={[
              styles.actionButton,
              {
                backgroundColor: !item?.pdfLocalUri
                  ? theme.colors.onSurfaceDisabled
                  : theme.colors.primary,
              },
            ]}
            labelStyle={styles.actionButtonText}
          >
            Ver PDF Local
          </Button>

          <Button
            mode="contained"
            onPress={handleWebView}
            disabled={!item?.pdf_url}
            icon={({ size, color }) => <Icon name="globe" size={size} color={color} />}
            style={[
              styles.actionButton,
              {
                backgroundColor: !item?.pdf_url
                  ? theme.colors.onSurfaceDisabled
                  : theme.colors.primary,
              },
            ]}
            labelStyle={styles.actionButtonText}
          >
            Ver PDF Web
          </Button>
        </Animated.View>
      </TouchableRipple>

      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        transparent={true}
        visible={isViewing}
      >
        <View style={styles.pdfModalContainer}>
          <PDFViewer item={item} onClose={handleClosePDFViewer} />
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    borderRadius: 28,
    padding: 24,
    width: '85%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  closeIcon: {
    margin: -8,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pdfModalContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});
