import { GuiaDespachoCardItem } from '@/components/guias/Card';
import PDFActionModal from '@/components/guias/PDFActionModal';
import colors from '@/constants/colors';
import { useApp } from '@/context/app/AppContext';
import { GuiaDespachoSummary } from '@/context/app/types';
import { useUser } from '@/context/user/UserContext';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GuiasHome() {
  const {
    state: { guiasSummary, loading, lastSync },
    fetchAllEmpresaData,
  } = useApp();
  const {
    state: { user },
  } = useUser();
  const router = useRouter();
  const [pdfItem, setPdfItem] = useState<GuiaDespachoSummary | null>(null);

  const handleCreateGuia = () => {
    if (user?.folios_reservados.length === 0 || !user?.folios_reservados) {
      Alert.alert('No tienes folios reservados');
    } else {
      router.push('/(tabs)/(guia-creation-stack)/datos-guia');
    }
  };

  const renderGuiaItem = useCallback(({ item }: { item: GuiaDespachoSummary }) => {
    return <GuiaDespachoCardItem item={item} setPdfItem={setPdfItem} />;
  }, []);

  const keyExtractor = useCallback((item: GuiaDespachoSummary) => {
    if (!item.id) {
      console.warn('Missing id for item:', item);
      // Fallback to composite key if id is missing
      return `${item.folio}-${item.fecha}-${item.receptor.rut}`;
    }
    return item.id;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.lastSync}>
            Última actualización:{' '}
            {lastSync?.toLocaleString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} />
        ) : (
          <FlatList
            data={guiasSummary}
            renderItem={renderGuiaItem}
            refreshing={loading}
            onRefresh={async () => await fetchAllEmpresaData()}
            keyExtractor={keyExtractor}
          />
        )}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              user?.folios_reservados.length === 0 && styles.disabledButton,
            ]}
            onPress={handleCreateGuia}
          >
            <Text
              style={[
                styles.buttonText,
                user?.folios_reservados.length === 0 && styles.disabledButtonText,
              ]}
            >
              Crear Nueva Guía
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <PDFActionModal item={pdfItem} setItem={setPdfItem} />
    </View>
  );
}

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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 7,
  },
  icon: {
    flex: 1,
    alignItems: 'flex-end',
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
});
