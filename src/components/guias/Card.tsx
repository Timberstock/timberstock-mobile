import { GuiaDespachoFirestore } from '@/context/app/types/guia';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useUser } from '@/context/user/UserContext';
import { LocalFilesService } from '@/services/LocalFilesService';
import { theme } from '@/theme';
import colors from '@/theme/colors';
import { Timestamp } from '@react-native-firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { memo, useEffect, useState } from 'react';
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
import { PDFActionModalItem } from './PDFActionModal';

interface GuiaDespachoCardItemProps {
  cardItem: GuiaDespachoFirestore;
  setPdfItem: (pdfActionItem: PDFActionModalItem) => void;
  preview?: boolean;
}

export const GuiaDespachoCardItem = memo(
  function GuiaDespachoCardItem({
    cardItem,
    setPdfItem,
    preview = false,
  }: GuiaDespachoCardItemProps) {
    const theme = useTheme();
    const router = useRouter();
    const {
      state: { user },
    } = useUser();
    const { repetirGuia } = useGuiaForm();

    const [localPDF, setLocalPDF] = useState<string | null>(null);

    useEffect(() => {
      if (!user?.empresa_id || !cardItem.identificacion.folio || preview) return;

      console.log('PDF check effect running for guia:', cardItem.identificacion.folio);
      let mounted = true;
      const checkLocalPdf = async () => {
        const filePath = await LocalFilesService.fileExistsPath(
          user.empresa_id!,
          `GD_${cardItem.identificacion.folio}.pdf`
        );
        if (mounted) {
          setLocalPDF(filePath);
        }
      };

      checkLocalPdf();
      return () => {
        mounted = false;
      };
    }, [
      user?.empresa_id,
      cardItem.identificacion.folio,
      cardItem.estado, // Keep this for safety
      cardItem.usuario_metadata.pdf_local_uri, // Keep this for safety
    ]);

    const getStatusColor = () => {
      if (preview) return;

      const estado = cardItem.estado.toLowerCase();
      if (estado === 'pendiente') return theme.colors.tertiary;
      if (estado === 'emitida' || estado.includes('sobre_dte_emitido'))
        return colors.warning;
      if (estado === 'rechazado' || estado === 'error' || estado.includes('error'))
        return theme.colors.error;
      if (estado === 'aceptado' || estado === 'aceptado-reparo') return colors.success;
      return theme.colors.secondary;
    };

    const getPdfStatusStyle = () => {
      if (!localPDF && !cardItem.pdf_url) return { backgroundColor: colors.lightGray };
      if (localPDF && cardItem.pdf_url)
        return { backgroundColor: theme.colors.primary };
      if (localPDF) return { backgroundColor: theme.colors.secondary };
      return { backgroundColor: theme.colors.tertiary };
    };

    const getPdfStatusLabel = () => {
      if (localPDF && !cardItem.pdf_url) return 'Local';
      if (!localPDF && cardItem.pdf_url) return 'Web';
      if (localPDF && cardItem.pdf_url) return 'Local+Web';
      return '';
    };

    const formatDate = (date: Date) => {
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    };

    const formatVolume = (volume: number, unit: string) => {
      return `${volume.toLocaleString('es-CL')} ${unit}`;
    };

    const handlePdfPress = async () => {
      if (!localPDF && !cardItem.pdf_url) {
        Alert.alert('Error', 'No se encontró ningún PDF asociado a esta guía');
        return;
      }
      // const html = await PDFService.createPDFHTMLString(
      //   empresa,
      //   cardItem,
      //   formatDate((cardItem.identificacion.fecha as Timestamp).toDate()),
      //   { uri: '', width: 100, height: 100 }
      // );
      // console.log(html);
      // const { uri } = await Print.printToFileAsync({ html });
      // cardItem.pdf_local_checked_uri = uri;
      setPdfItem({
        id: cardItem.id,
        folio: cardItem.identificacion.folio,
        empresaId: user?.empresa_id!,
        pdfLocalUri: localPDF,
        pdf_url: cardItem.pdf_url,
      });
    };

    const handleCopyPress = async () => {
      const success = repetirGuia(cardItem);
      if (success) {
        router.push('/(tabs)/(guia-creation-stack)/guia-form');
      }
    };

    return (
      <View style={styles.cardWrapper}>
        <Surface
          style={[styles.card, preview && styles.previewCard]}
          mode="elevated"
          elevation={1}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <Text variant="titleLarge" style={styles.folioText}>
                  #{cardItem.identificacion.folio}
                </Text>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
                  textStyle={styles.statusChipText}
                >
                  {preview ? '' : cardItem.estado}
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
            <View
              style={[styles.bodyContainer, preview && styles.previewBodyContainer]}
            >
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
                      ? formatDate(cardItem.identificacion.fecha as Date)
                      : formatDate(
                          (cardItem.identificacion.fecha as Timestamp).toDate()
                        )}
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
                    {cardItem.receptor.razon_social}
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
                    {cardItem.predio_origen?.nombre || ''}
                    <Text style={styles.arrowText}> → </Text>
                    {cardItem.destino?.nombre || ''}
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
                    {formatVolume(
                      cardItem.volumen_total_emitido,
                      cardItem.producto.unidad
                    )}
                  </Text>
                </View>
              </View>
              {preview ? null : (
                <View style={styles.pdfContainer}>
                  <Surface
                    style={[styles.iconContainer, getPdfStatusStyle()]}
                    elevation={3}
                  >
                    <IconButton
                      icon="file-pdf-box"
                      size={32}
                      iconColor={
                        localPDF || cardItem.pdf_url ? colors.white : colors.gray
                      }
                      onPress={handlePdfPress}
                      disabled={!(localPDF || cardItem.pdf_url)}
                    />
                  </Surface>
                  {(localPDF || cardItem.pdf_url) && (
                    <Text variant="labelSmall" style={styles.pdfStatusLabel}>
                      {getPdfStatusLabel()}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card.Content>
        </Surface>
      </View>
    );
  },
  (prevProps, nextProps) => {
    const itemChanged =
      prevProps.cardItem.id !== nextProps.cardItem.id ||
      prevProps.cardItem.estado !== nextProps.cardItem.estado ||
      prevProps.cardItem.usuario_metadata.pdf_local_uri !==
        nextProps.cardItem.usuario_metadata.pdf_local_uri ||
      prevProps.cardItem.pdf_url !== nextProps.cardItem.pdf_url ||
      prevProps.preview !== nextProps.preview;

    if (itemChanged) {
      console.log('Card re-rendering due to changes:', {
        id: prevProps.cardItem.id,
        newEstado: nextProps.cardItem.estado,
        oldEstado: prevProps.cardItem.estado,
        // ... log other changes
      });
    }

    return !itemChanged;
  }
);

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 8,
    borderRadius: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  previewCard: {
    minHeight: 140,
  },
  cardContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewBodyContainer: {
    minHeight: 100,
    paddingTop: 8,
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
