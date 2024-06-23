import { useState } from 'react';
import colors from '../../resources/Colors';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// TODO: fix types
const PrecioModal = (props: any) => {
  const { createGuiaLoading, modalVisible, setModalVisible, handleCreateGuia } =
    props;
  const [totalGuia, setTotalGuia] = useState('');

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
            <Text style={styles.modalTitle}>
              Valor Total de la Guía de Despacho
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={totalGuia}
              onChangeText={setTotalGuia}
            />
            <TouchableOpacity
              style={styles.acceptButton}
              // Error handling for empty input (disable the button)
              onPress={() => {
                handleCreateGuia(parseInt(totalGuia));
              }}
            >
              <Text style={styles.acceptButtonText}>Crear</Text>
            </TouchableOpacity>
            {createGuiaLoading && (
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
    paddingTop: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
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
});

export default PrecioModal;
