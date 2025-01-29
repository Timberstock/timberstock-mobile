import { useFolio } from '@/context/folio/FolioContext';
import { useNetwork } from '@/context/network/NetworkContext';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const FoliosRequestModal = ({ modalVisible, setModalVisible }: Props) => {
  const theme = useTheme();
  const {
    state: { loading },
    reserveFolios,
  } = useFolio();
  const [numFolios, setNumFolios] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  const { networkStatus } = useNetwork();

  React.useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setNumFolios('');
    }
  }, [modalVisible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const handleRequest = async () => {
    Keyboard.dismiss();
    const num = parseInt(numFolios, 10);
    
    if (isNaN(num) || num <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Por favor ingrese un número válido');
      return;
    }

    if (!networkStatus?.isConnected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Sin conexión',
        'Se requiere conexión a internet para reservar folios'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await reserveFolios(num);
    
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.foliosReservados?.length === num) {
        Alert.alert(
          'Folios reservados',
          `Se han reservado los ${num} folios solicitados`
        );
      } else {
        Alert.alert(
          `Folios reservados (${result.foliosReservados?.length}/${num})`,
          `Se han reservado ${result.foliosReservados?.length} folios de los ${num} solicitados. Folios agotados de la empresa, revisar los CAFs y los folios reservados sin ocupar.`
        );
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudieron reservar los folios');
    }
    handleClose();
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <View style={styles.header}>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Reservar Folios
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleClose}
                  style={styles.closeButton}
                />
              </View>

              <Text variant="bodyMedium" style={styles.subtitle}>
                Ingrese la cantidad de folios que desea reservar
              </Text>

              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={numFolios}
                onChangeText={setNumFolios}
                style={styles.input}
                placeholder="Ej: 10"
                right={<TextInput.Icon icon="file-document-outline" />}
                disabled={loading}
              />

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleRequest}
                  loading={loading}
                  disabled={loading || !numFolios}
                  style={styles.button}
                  icon="check"
                >
                  Solicitar
                </Button>
              </View>

              {!networkStatus?.isConnected && (
                <View style={styles.networkWarning}>
                  <Icon name="wifi-off" size={20} color={theme.colors.error} />
                  <Text
                    variant="bodySmall"
                    style={[styles.warningText, { color: theme.colors.error }]}
                  >
                    Sin conexión a internet
                  </Text>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    margin: -8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 24,
  },
  buttonContainer: {
    alignItems: 'stretch',
  },
  button: {
    borderRadius: 12,
    height: 48,
  },
  networkWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    textAlign: 'center',
  },
});

export default FoliosRequestModal;
