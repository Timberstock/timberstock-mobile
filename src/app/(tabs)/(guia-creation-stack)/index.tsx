import { GuiaDespachoCardItem } from '@/components/guias/Card';
import PDFActionModal from '@/components/guias/PDFActionModal';
import colors from '@/constants/colors';
import { useApp } from '@/context/app/AppContext';
import { GuiaDespachoState } from '@/context/app/types';
import { useGuiaForm } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { useUser } from '@/context/user/UserContext';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
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
  const { resetForm } = useGuiaForm();
  const [pdfItem, setPdfItem] = useState<GuiaDespachoState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);
  const [fadeAnim, setFadeAnim] = useState(1);
  const [slideAnim, setSlideAnim] = useState(0);

  const handleCreateGuia = async () => {
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
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchAllEmpresaData();
    setRefreshing(false);
  };

  const renderGuiaItem = useCallback(
    ({ item, index }: { item: GuiaDespachoState; index: number }) => {
      return (
        <Animated.View>
          <GuiaDespachoCardItem item={item} setPdfItem={setPdfItem} />
        </Animated.View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: GuiaDespachoState) => {
    if (!item.id) {
      console.warn('Missing id for item:', item);
      return `${item.identificacion.folio}-${item.identificacion.fecha}-${item.receptor.rut}`;
    }
    return item.id;
  }, []);

  const EmptyList = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
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
        onPress={handleCreateGuia}
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
