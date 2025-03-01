import { GuiaDespachoCardItem } from '@/components/guias/Card';
import PDFActionModal, { PDFActionModalItem } from '@/components/guias/PDFActionModal';
import { useApp } from '@/context/app/AppContext';
import { GuiaDespachoFirestore } from '@/context/app/types/guia';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useUser } from '@/context/user/UserContext';
import colors from '@/theme/colors';
import * as Haptics from 'expo-haptics';
import { router, useSegments } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function GuiasIndex() {
  const theme = useTheme();
  const {
    state: { guias, loading, lastSync, isLoadingMore },
    fetchAllEmpresaData,
    loadMoreGuias,
  } = useApp();
  const {
    state: { user },
  } = useUser();
  const segments = useSegments();
  const { resetForm } = useGuiaForm();
  const [pdfItem, setPdfItem] = useState<PDFActionModalItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    Updates.checkForUpdateAsync();
  }, [segments]);

  const handleStartGuiaForm = async () => {
    if (user?.folios_reservados.length === 0 || !user?.folios_reservados) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('No tienes folios reservados');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      resetForm();
      router.push('/(tabs)/(guia-creation-stack)/guia-form');
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Dev builds throw error
      try {
        await Updates.checkForUpdateAsync();
      } catch (error) {
        console.error('Error checking for update:', error);
      }
      await fetchAllEmpresaData(false); // Pass false to not trigger additional loading state
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderGuiaItem = useCallback(
    ({ item, index }: { item: GuiaDespachoFirestore; index: number }) => {
      return (
        <Animated.View>
          <GuiaDespachoCardItem cardItem={item} setPdfItem={setPdfItem} />
        </Animated.View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: GuiaDespachoFirestore) => {
    if (!item.id) {
      console.warn('Missing id for item:', item.identificacion.folio);
      return `${item.identificacion.folio}-${item.identificacion.fecha}-${item.receptor.rut}`;
    }
    return item.id;
  }, []);

  const EmptyList = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: 1,
          transform: [{ translateY: 0 }],
        },
      ]}
    >
      <Icon
        name="package-variant"
        size={100}
        color={theme.colors.primary}
        style={styles.emptyIcon}
      />
      <Text variant="titleMedium" style={styles.emptyText}>
        Aún se están cargando las guías o no hay guías disponibles.
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        De todas maneras puedes crear una nueva guía.
      </Text>
    </Animated.View>
  );

  const HeaderComponent = () => (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [-100, 0, 100],
                outputRange: [25, 0, -25],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.lastSync}>
        Última actualización:{' '}
        {lastSync?.toLocaleString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={listRef}
        data={guias}
        renderItem={renderGuiaItem}
        keyExtractor={keyExtractor}
        initialNumToRender={15} // More conservative number
        maxToRenderPerBatch={10}
        windowSize={7} // Slightly larger window
        removeClippedSubviews={Platform.OS === 'android'} // Only on Android
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? EmptyList : null}
        ListHeaderComponent={HeaderComponent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
        onEndReached={loadMoreGuias}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary },
          user?.folios_reservados.length === 0 && styles.disabledFab,
        ]}
        color={theme.colors.onPrimary}
        onPress={handleStartGuiaForm}
        disabled={user?.folios_reservados.length === 0}
        label="CREAR NUEVA GUÍA"
      />

      <PDFActionModal item={pdfItem} setItem={setPdfItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  header: {
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    marginBottom: 8,
    borderRadius: 8,
  },
  lastSync: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  disabledFab: {
    backgroundColor: colors.lightGrayButton,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 16,
    color: colors.darkGray,
  },
  emptySubtext: {
    marginTop: 8,
    color: colors.gray,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
