import colors from '@/constants/colors';
import { GuiaDespachoSummary } from '@/context/app/types';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface GuiaDespachoCardItemProps {
  item: GuiaDespachoSummary;
  setPdfItem: (item: GuiaDespachoSummary) => void;
}

export const GuiaDespachoCardItem = React.memo(
  ({ item, setPdfItem }: GuiaDespachoCardItemProps) => {
    const isPdfAvailable = () => {
      return item.pdf_local_uri || item.pdf_url;
    };

    const getPdfStatusStyle = () => {
      if (!item.pdf_local_uri && !item.pdf_url) {
        return styles.iconDisabled;
      }
      if (item.pdf_local_uri && item.pdf_url) {
        return styles.iconBoth;
      }
      if (item.pdf_local_uri) {
        return styles.iconLocal;
      }
      return styles.iconWeb;
    };

    const getPdfIconColor = () => {
      if (!item.pdf_local_uri && !item.pdf_url) {
        return colors.gray;
      }
      return colors.white;
    };

    const getPdfStatusLabel = () => {
      if (item.pdf_local_uri && !item.pdf_url) {
        return '(Solo local)';
      }
      if (!item.pdf_local_uri && item.pdf_url) {
        return '(Solo web)';
      }
      return '(Local y web)';
    };

    const handlePdfPress = () => {
      if (!isPdfAvailable()) {
        Alert.alert('Error', 'No se encontró ningún PDF asociado a esta guía');
        return;
      }
      setPdfItem(item);
    };

    return (
      <View style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>Folio: {item.folio}</Text>
            <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
            <Text style={styles.cardText}>Estado: {item.estado}</Text>
            <Text style={styles.cardText}>Receptor: {item.receptor.razon_social}</Text>
            <Text style={styles.cardText}>Monto: {item.monto_total_guia}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.iconContainer,
              getPdfStatusStyle(),
              pressed && !isPdfAvailable() && styles.disabledPressed,
              pressed && isPdfAvailable() && styles.iconPressed,
            ]}
            onPress={() => handlePdfPress()}
          >
            <Icon name="file-pdf-o" size={40} color={getPdfIconColor()} />
            {getPdfStatusLabel() && (
              <Text style={styles.statusLabel}>{getPdfStatusLabel()}</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  body: {
    flex: 9,
    padding: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    borderRadius: 30,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconDisabled: {
    backgroundColor: '#f0f0f0',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  iconLocal: {
    backgroundColor: '#1976D2', // Nice blue
  },
  iconWeb: {
    backgroundColor: '#FFA000', // Warm amber color
  },
  iconBoth: {
    backgroundColor: '#43A047', // Pleasant green
  },
  iconPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  disabledPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardText: {
    fontSize: 14,
    color: colors.darkGray,
    marginVertical: 2,
  },
  buttonsContainer: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    position: 'absolute',
    bottom: 25,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.lightGrayButton, // Set a lighter color or gray tone for disabled state
    borderColor: colors.darkGrayButton, // Optional border color for contrast
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: colors.gray, // Use a lighter text color to indicate it's disabled
  },
  header: {
    paddingBottom: 2,
    backgroundColor: '#f5f5f5',
  },
  lastSync: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statusLabel: {
    position: 'absolute',
    bottom: -18,
    fontSize: 10,
    color: colors.darkGray,
    width: 70,
    textAlign: 'center',
  },
});
