import FoliosRequestModal from '@/components/FoliosRequestModal';
import { useApp } from '@/context/app/AppContext';
import { useFolio } from '@/context/folio/FolioContext';
import { useUser } from '@/context/user/UserContext';
import { LocalFilesService } from '@/services/LocalFilesService';
import colors from '@/theme/colors';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert, Animated, Image, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

export default function User() {
  const theme = useTheme();
  const { liberarFolios } = useFolio();
  const { resetFirestoreAndReloadApp } = useApp();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const {
    state: { user },
    logout,
  } = useUser();

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const loadLogo = async () => {
      if (user?.empresa_id) {
        try {
          const base64 = await LocalFilesService.getLogoFileBase64(user.empresa_id);
          setLogoBase64(base64);
        } catch (error) {
          console.error('Error loading logo:', error);
        }
      }
    };
    loadLogo();
  }, [user?.empresa_id]);

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

  const handleReiniciarApp = async () => {
    try {
      // Confirmar reinicar la app y reiniciar la app
      Alert.alert(
        'Reiniciando datos de la aplicación.',
        '¿Estás seguro de reiniciar la aplicación?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Reiniciar',
            onPress: async () => {
              // Reiniciar la app
              await resetFirestoreAndReloadApp();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error checking for update:', error);
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
            {logoBase64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${logoBase64}` }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <Avatar.Icon
                size={80}
                icon="account"
                style={{ backgroundColor: theme.colors.primaryContainer }}
                color={theme.colors.primary}
              />
            )}
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
            onPress={handleReiniciarApp}
            icon="update"
            style={styles.actionButton}
          >
            Reiniciar Aplicación (Conservando Usuario)
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
          Última actualización app:{' '}
          {Updates.createdAt
            ? `${Updates.createdAt?.toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })} ${Updates.createdAt?.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : '05/02/2025 10:08'}
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
  logo: {
    width: 120,
    height: 80,
    marginBottom: 8,
  },
});
