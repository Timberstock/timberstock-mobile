import FoliosRequestModal from '@/components/FoliosRequestModal';
import colors from '@/constants/colors';
import { useApp } from '@/context/app/AppContext';
import { useFolio } from '@/context/folio/FolioContext';
import { useUser } from '@/context/user/UserContext';
import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import { Alert, Animated, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

export default function User() {
  const theme = useTheme();
  const { handleUpdateAvailable } = useApp();
  const { liberarFolios } = useFolio();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const {
    state: { user },
    logout,
  } = useUser();

  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDevolverFolios = () => {
    Alert.alert('Devolver folios', '¿Estás seguro de devolver todos los folios?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Devolver folios',
        onPress: async () => {
          const success = await liberarFolios();
          if (success) {
            Alert.alert('Folios devueltos', 'Se han devuelto todos los folios');
          } else {
            Alert.alert('Error', 'No se pudieron devolver los folios');
          }
        },
      },
    ]);
  };

  const handleCheckForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        handleUpdateAvailable();
      } else {
        Alert.alert('No hay actualizaciones', 'La aplicación ya está actualizada');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo comprobar si hay actualizaciones disponibles');
      console.error(error);
    }
  };

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon
              size={80}
              icon="account"
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.primary}
            />
            <Text variant="headlineSmall" style={styles.name}>
              {user?.nombre}
            </Text>
            <Text variant="titleMedium" style={styles.rut}>
              {user?.rut}
            </Text>
            <View style={styles.foliosContainer}>
              <Icon
                name="documents-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.foliosIcon}
              />
              <Text variant="titleMedium" style={styles.folios}>
                {user?.folios_reservados.length} folios activos
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={() => setModalVisible(true)}
            icon="file-plus-outline"
            style={styles.actionButton}
          >
            Reservar Folios
          </Button>

          <Button
            mode="contained-tonal"
            onPress={handleDevolverFolios}
            icon="file-remove-outline"
            style={styles.actionButton}
            disabled={user?.folios_reservados.length === 0}
          >
            Devolver Folios
          </Button>

          <Button
            mode="outlined"
            onPress={handleCheckForUpdates}
            icon="update"
            style={styles.actionButton}
          >
            Buscar Actualizaciones
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={logout}
          icon="logout"
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        >
          Cerrar Sesión
        </Button>

        <Text variant="labelSmall" style={styles.version}>
          Última actualización:{' '}
          {Updates.createdAt
            ? `${Updates.createdAt?.getUTCDate()}/${Updates.createdAt?.getUTCMonth() + 1}/${Updates.createdAt?.getUTCFullYear()}`
            : '07/01/2025'}
        </Text>
      </Animated.View>

      <FoliosRequestModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 24,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    marginTop: 16,
    fontWeight: '600',
  },
  rut: {
    marginTop: 4,
    opacity: 0.7,
  },
  foliosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  foliosIcon: {
    marginRight: 8,
  },
  folios: {
    color: colors.secondary,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 8,
  },
  logoutButton: {
    borderRadius: 8,
    marginTop: 'auto',
  },
  version: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.5,
  },
});
