import colors from '@/constants/colors';
import { useApp } from '@/context/app/AppContext';
import { GuiaDespachoState } from '@/context/app/types';
import { PDFService } from '@/context/guia-creation/creation/services/pdf';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { theme } from '@/theme';
import { Timestamp } from '@react-native-firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
interface GuiaDespachoCardItemProps {
  item: GuiaDespachoState;
  setPdfItem: (item: GuiaDespachoState) => void;
  preview?: boolean;
}

export function GuiaDespachoCardItem({
  item,
  setPdfItem,
  preview = false,
}: GuiaDespachoCardItemProps) {
  const theme = useTheme();
  const router = useRouter();

  const {
    state: { empresa },
  } = useApp();

  const { repetirGuia } = useGuiaForm();

  const isPdfAvailable = () => {
    return item.pdf_local_checked_uri || item.pdf_url;
  };

  const getStatusColor = () => {
    const estado = item.estado.toLowerCase();
    if (estado === 'pendiente') {
      return theme.colors.tertiary; // Local only status
    }
    if (estado === 'emitida' || estado.includes('sobre_dte_emitido')) {
      // @ts-ignore
      return theme.colors.warning; // In process
    }
    if (estado === 'rechazado' || estado === 'error' || estado.includes('error')) {
      return theme.colors.error; // Error states
    }
    if (estado === 'aceptado' || estado === 'aceptado-reparo') {
      // @ts-ignore
      return theme.colors.success; // Success states
    }
    return theme.colors.secondary; // Default fallback
  };

  const getPdfStatusStyle = () => {
    if (!item.pdf_local_checked_uri && !item.pdf_url) {
      return { backgroundColor: colors.lightGray };
    }
    if (item.pdf_local_checked_uri && item.pdf_url) {
      return { backgroundColor: theme.colors.primary };
    }
    if (item.pdf_local_checked_uri) {
      return { backgroundColor: theme.colors.secondary };
    }
    return { backgroundColor: theme.colors.tertiary };
  };

  const getPdfStatusLabel = () => {
    if (item.pdf_local_checked_uri && !item.pdf_url) {
      return 'Local';
    }
    if (!item.pdf_local_checked_uri && item.pdf_url) {
      return 'Web';
    }
    if (item.pdf_local_checked_uri && item.pdf_url) {
      return 'Local+Web';
    }
    return '';
  };

  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatVolume = (volume: number, unit: string) => {
    return `${volume.toLocaleString('es-CL')} ${unit}`;
  };

  const handlePdfPress = async () => {
    if (!isPdfAvailable()) {
      Alert.alert('Error', 'No se encontró ningún PDF asociado a esta guía');
      return;
    }

    const html = await PDFService.createPDFHTMLString(
      empresa,
      item,
      formatDate((item.identificacion.fecha as Timestamp).toDate()),
      { uri: '', width: 100, height: 100 }
    );
    const { uri } = await Print.printToFileAsync({ html });
    item.pdf_local_checked_uri = uri;

    setPdfItem(item);
  };

  const handleCopyPress = async () => {
    const success = repetirGuia(item);
    if (success) {
      router.push('/(tabs)/(guia-creation-stack)/guia-form');
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <Surface style={styles.card} mode="elevated" elevation={1}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <Text variant="titleLarge" style={styles.folioText}>
                #{item.identificacion.folio}
              </Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
                textStyle={styles.statusChipText}
              >
                {item.estado}
              </Chip>
            </View>
            {!preview && (
              <Button
                icon="content-copy"
                mode="contained-tonal"
                onPress={handleCopyPress}
                style={styles.copyButton}
                labelStyle={styles.copyButtonLabel}
                compact
                elevation={2}
              >
                Repetir datos
              </Button>
            )}
          </View>
          <View style={styles.bodyContainer}>
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <IconButton
                  icon="calendar"
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.detailIcon}
                />
                <Text variant="bodyMedium">
                  {preview
                    ? formatDate(item.identificacion.fecha as Date)
                    : formatDate((item.identificacion.fecha as Timestamp).toDate())}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <IconButton
                  icon="account"
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.detailIcon}
                />
                <Text variant="bodyMedium" style={styles.receptorText}>
                  {item.receptor.razon_social}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <IconButton
                  icon="map-marker-path"
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.detailIcon}
                />
                <Text variant="bodyMedium" style={styles.routeText}>
                  {item.predio_origen?.nombre || ''}
                  <Text style={styles.arrowText}> → </Text>
                  {item.destino?.nombre || ''}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <IconButton
                  icon="pine-tree"
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.detailIcon}
                />
                <Text variant="bodyMedium">
                  {formatVolume(item.volumen_total_emitido, item.producto.unidad)}
                </Text>
              </View>
            </View>
            <View style={styles.pdfContainer}>
              <Surface
                style={[styles.iconContainer, getPdfStatusStyle()]}
                elevation={3}
              >
                <IconButton
                  icon="file-pdf-box"
                  size={32}
                  iconColor={isPdfAvailable() ? colors.white : colors.gray}
                  onPress={handlePdfPress}
                  disabled={!isPdfAvailable()}
                />
              </Surface>
              {isPdfAvailable() && (
                <Text variant="labelSmall" style={styles.pdfStatusLabel}>
                  {getPdfStatusLabel()}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 8,
    borderRadius: 16, // Same as card
  },
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  folioText: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
    maxWidth: 100,
  },
  statusChipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  bodyContainer: {
    flex: 5,
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
  },
  detailsContainer: {
    marginLeft: 2,
    flex: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    margin: 0,
    marginRight: 4,
  },
  receptorText: {
    flex: 1,
  },
  routeText: {
    flex: 1,
    fontSize: 13, // Slightly smaller for route text
  },
  arrowText: {
    color: colors.darkGray,
    fontWeight: '500',
  },
  montoText: {
    fontWeight: '500',
  },
  pdfContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  pdfStatusLabel: {
    textAlign: 'center',
    color: colors.darkGray,
    marginTop: 2,
    fontSize: 12,
  },
  copyButton: {
    margin: 0,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryContainer,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  copyButtonLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
