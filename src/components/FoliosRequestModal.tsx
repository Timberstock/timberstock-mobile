import colors from '@/constants/colors';
import { useFolio } from '@/context/folio/FolioContext';
import { useNetwork } from '@/context/network/NetworkContext';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const FoliosRequestModal = ({ modalVisible, setModalVisible }: Props) => {
  const {
    state: { loading },
    reserveFolios,
  } = useFolio();
  const [numFolios, setNumFolios] = useState('');

  const { networkStatus } = useNetwork();

  const handleRequest = async () => {
    const num = parseInt(numFolios, 10);
    if (isNaN(num) || num <= 0) return;

    if (!networkStatus?.isConnected) {
      Alert.alert(
        'Sin conexión',
        'Se requiere conexión a internet para reservar folios'
      );
      return;
    }

    const result = await reserveFolios(num);
    if (result.success && result.foliosReservados?.length === num) {
      Alert.alert(
        'Folios reservados',
        `Se han reservado los ${num} folios solicitados`
      );
    } else if (result.success && result.foliosReservados?.length !== num) {
      Alert.alert(
        `Folios reservados (${result.foliosReservados?.length}/${num})`,
        `Se han reservado ${result.foliosReservados?.length} folios de los ${num} solicitados. Folios agotados de la empresa, revisar los CAFs y los folios reservados sin ocupar.`
      );
    } else {
      Alert.alert('Error', 'No se pudieron reservar los folios');
    }
    setModalVisible(false);
  };

  return (
    <View>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close-circle" size={25} color="grey" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Ingrese número de folios a reservar</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={numFolios}
              onChangeText={setNumFolios}
              placeholder="Número de folios"
            />

            <TouchableOpacity
              style={[styles.acceptButton, loading && styles.disabledButton]}
              disabled={loading}
              onPress={handleRequest}
            >
              <Text style={styles.acceptButtonText}>Solicitar</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#4E4E4E" />}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openModalButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  openModalButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: 100,
  },
  acceptButton: {
    backgroundColor: colors.secondary,
    borderRadius: 15,
    padding: 15,
    margin: 5,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  disabledButton: {
    backgroundColor: colors.gray,
  },
});

export default FoliosRequestModal;
