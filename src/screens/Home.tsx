import React, { useEffect, useContext, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
  Modal,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import FoliosRequestModal from '../components/FoliosRequestModal';
import { requestReservarFolios } from '../functions/firebase/cloud_functions';
import { GuiaDespachoSummaryProps } from '../interfaces/guias';
import { HomeScreenProps } from '../interfaces/screens';
import { Alert } from 'react-native';

import { AppContext } from '../context/AppContext';

import { UserContext } from '../context/UserContext';
import customHelpers from '../functions/helpers';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  _createGuiaTest,
  fetchGuiasDocs,
} from '../functions/firebase/firestore/guias';

import { generatePDF } from '../functions/screenFunctions';

export default function Home(props: HomeScreenProps) {
  const { navigation } = props;
  const { user, updateUserReservedFolios } = useContext(UserContext);
  const { empresa, guiasSummary, updateGuiasSummary, updateFoliosDisp } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleGetFolios = async (numFolios: number) => {
    //TODO: Loading icon

    // Call the function to reserve the folios
    if (user === null || user.firebaseAuth === null || numFolios <= 0) return;

    const response = await requestReservarFolios(
      user.firebaseAuth.uid,
      numFolios
    );

    // Update the user's folios locally
    await updateUserReservedFolios(response.folios_reservados, response.cafs);

    // Close the modal after successful action
    setModalVisible(false);
  };

  const handleRefresh = async () => {
    // THIS ONLY WILL BE RUN IF WE ARE LOGGED IN
    if (user === null) return;
    if (user.empresa_id) {
      try {
        console.log('REFRESHING');
        const empresaGuias = await fetchGuiasDocs(user.empresa_id);
        // updateFoliosDisp(empresaGuias, empresa.caf_n);
        updateGuiasSummary(empresaGuias);

        setLoading(false);
        console.log('DONE');
      } catch (error) {
        Alert.alert(
          'Error al cargar guías',
          'No se pudo obtener la información de la empresa'
        );
      }
    } else {
      Alert.alert('Error', 'Error al cargar empresa_id del usuario');
    }
  };

  const renderItem = ({ item }: { item: GuiaDespachoSummaryProps }) => {
    const guia = item;

    const handleLinkClick = () => {
      // The idea is this to be the PDF afterwards
      item.url
        ? Linking.openURL(item.url)
        : Alert.alert(
            'No link',
            'Todavía no se ha generado el link de esta guía o se ha producido un error'
          );
    };
    return (
      <TouchableOpacity style={styles.guia}>
        <Text> Fecha: {guia.fecha}</Text>
        <Text> Estado: {guia.estado}</Text>
        <Text> Folio: {guia.folio}</Text>
        <Text> Receptor: {guia.receptor.razon_social}</Text>
        <Text> Monto: {guia.total}</Text>
        <Icon
          name="external-link"
          size={30}
          color="blue"
          onPress={handleLinkClick}
          style={styles.linkIcon}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.screen}>
      <Header screenName="Home" {...props} />
      <View style={styles.body}>
        <FlatList
          data={guiasSummary}
          renderItem={renderItem}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}> Solicitar Folios </Text>
          </TouchableOpacity>
          <TouchableOpacity
            // style={styles.button}
            style={[
              styles.button,
              user?.folios_reservados.length === 0 && styles.disabledButton,
            ]}
            onPress={() => navigation.push('CreateGuia')}
            disabled={
              user?.folios_reservados?.length &&
              user.folios_reservados.length > 0
                ? false
                : true
            }
            // Just for testing
            // onPress={async () => {
            // await _createGuiaTest(2);
            // await generatePDF();
            // }}
          >
            <Text style={styles.buttonText}>
              {' '}
              Crear Nueva Guía de Despacho{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FoliosRequestModal
        modalVisible={modalVisible}
        handleGetFolios={handleGetFolios}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 9.5,
    width: '100%',
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  buttonsContainer: {
    flex: 0.5,
    width: '100%',
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  guia: {
    backgroundColor: 'grey',
    borderRadius: 12,
    padding: '2.5%',
    marginHorizontal: '2.5%',
    marginVertical: '1.5%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 15,
    padding: 15,
    margin: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: colors.white,
  },
  linkIcon: {
    position: 'absolute',
    top: '50%',
    right: '5%',
  },
});
