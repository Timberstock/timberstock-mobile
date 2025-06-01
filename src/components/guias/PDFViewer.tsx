import { LocalFilesService } from '@/services/LocalFilesService';
import { theme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/FontAwesome';

interface PDFViewerProps {
  item: PDFViewerItem | null;
  onClose: () => void;
  preview?: boolean;
}

export interface PDFViewerItem {
  folio: number;
  empresaId: string;
  pdfLocalUri: string | null;
}

export default function PDFViewer({ item, onClose, preview = false }: PDFViewerProps) {
  const source = { uri: item?.pdfLocalUri ?? '' };
  console.log('🔍 [PDFViewer] source:', source);

  const handleShare = async () => {
    if (item) {
      await LocalFilesService.shareGuiaPDF(item.folio.toString(), item.empresaId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerText}>
          Guía #{item?.folio ?? ''}
        </Text>
      </View>

      <View style={styles.pdfContainer}>
        <Pdf
          source={source}
          style={styles.pdf}
          enablePaging={true}
          scale={1.0}
          maxScale={3.0}
        />
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Icon name="times" size={24} color={theme.colors.onPrimary} />
      </TouchableOpacity>

      {!preview && (
        <FAB
          icon="share-variant"
          style={styles.shareButton}
          onPress={handleShare}
          animated={true}
          rippleColor={theme.colors.primary}
          color={theme.colors.onPrimary}
          size="large"
          customSize={75}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    zIndex: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: theme.colors.onPrimary,
    textAlign: 'center',
  },
  pdfContainer: {
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    margin: 0,
    padding: 0,
    paddingHorizontal: 10,
  },
  pdf: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  closeButton: {
    position: 'absolute',
    top: '20%',
    zIndex: 999,
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    bottom: '25%',
    right: '5%',
    zIndex: 999,
    color: theme.colors.onPrimary,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
  },
});
