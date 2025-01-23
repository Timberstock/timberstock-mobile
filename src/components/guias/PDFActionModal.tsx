import colors from '@/constants/colors';
import { GuiaDespachoSummary } from '@/context/app/types';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PDFViewer from './PDFViewer';

interface PDFActionModalProps {
  item: GuiaDespachoSummary | null;
  setItem: (item: GuiaDespachoSummary | null) => void;
}

export default function PDFActionModal({ item, setItem }: PDFActionModalProps) {
  const [isViewing, setIsViewing] = useState(false);

  const handleView = () => {
    if (!item?.pdf_local_uri) {
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
    setIsViewing(false);
    setItem(null);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={item !== null}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={handleClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Opciones PDF</Text>

          <TouchableOpacity
            onPress={handleView}
            style={[styles.actionButton, !item?.pdf_local_uri && styles.disabledButton]}
          >
            <Icon name="file-pdf-o" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Ver PDF Local</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !item?.pdf_url && styles.disabledButton]}
            onPress={handleWebView}
          >
            <Icon name="globe" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Ver PDF Web</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCloseButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        visible={isViewing}
        transparent={true}
      >
        <View style={styles.pdfModalContainer}>
          <PDFViewer item={item!} onClose={handleClosePDFViewer} />
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
    paddingTop: Platform.OS === 'android' ? -56 : 0,
  },
  modalView: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: Platform.OS === 'android' ? 56 : 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.white,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: colors.lightGrayButton,
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
  },
  closeButtonText: {
    color: colors.darkGray,
    fontSize: 16,
  },
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenContainer: {
    flex: 1,
    ...Platform.select({
      android: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        elevation: 999,
      },
    }),
  },
});
