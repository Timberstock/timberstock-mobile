import colors from '@/constants/colors';
import { useApp } from '@/context/app/AppContext';
import { GuiaDespachoSummary } from '@/context/app/types';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/FontAwesome';

interface PDFViewerProps {
  item: GuiaDespachoSummary;
  onClose: () => void;
}

export default function PDFViewer({ item, onClose }: PDFViewerProps) {
  const { shareGuiaPDF } = useApp();
  const source = { uri: item.pdf_local_uri, cache: true };

  const handleShare = async () => {
    if (item) {
      await shareGuiaPDF(item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.pdfContainer}>
        <Pdf
          source={source}
          style={styles.pdf}
          enablePaging={true}
          scale={1.0}
          maxScale={3.0}
        />
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="times" size={24} color={colors.white} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Icon name="share-alt" size={36} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pdfContainer: {
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  pdf: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
    margin: 5,
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
  },
  shareButton: {
    position: 'absolute',
    bottom: '25%',
    zIndex: 999,
    alignSelf: 'center',
    width: 80,
    height: 80,
    backgroundColor: colors.secondary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
