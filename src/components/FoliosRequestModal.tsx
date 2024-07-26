import { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';
import colors from '@/resources/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

// TODO: fix types
const FoliosRequestModal = (props: any) => {
  const {
    foliosRequestLoading,
    modalVisible,
    setModalVisible,
    handleGetFolios,
  } = props;
  const [numFolios, setNumFolios] = useState('');

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
            <Text style={styles.modalTitle}>Cuántos Folios a reservar?</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={numFolios}
              onChangeText={setNumFolios}
              placeholder="Número de folios"
            />
            <TouchableOpacity
              style={styles.acceptButton}
              // Error handling for empty input (disable the button)
              onPress={() => handleGetFolios(numFolios)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            {foliosRequestLoading && (
              <ActivityIndicator size="large" color="#4E4E4E" />
            )}
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
});

export default FoliosRequestModal;
