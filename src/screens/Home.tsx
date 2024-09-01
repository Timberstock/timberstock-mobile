import React, { useEffect, useContext, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { AppContext } from '@/context/AppContext';
import { UserContext } from '@/context/UserContext';

import colors from '@/resources/Colors';
import Header from '@/components/Header';
import FoliosRequestModal from '@/components/FoliosRequestModal';
import { requestReservarFolios } from '@/functions/firebase/cloud_functions';
import {
  _createGuiaTest,
  fetchGuiasDocs,
} from '@/functions/firebase/firestore/guias';
import { GuiaDespachoSummaryProps } from '@/interfaces/screens/home';

export default function Home(props: any) {
  const { navigation } = props;
  const { user, updateUserReservedFolios } = useContext(UserContext);
  const { guiasSummary, updateGuiasSummary } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [foliosRequestLoading, setFoliosRequestLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // console.log(guiasSummary);
  console.log("ENTRAMOS A HOME");

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleGetFolios = async (numFolios: number) => {
    // TODO: Fix the Loading icon to not make the size of the Modal change

    // Call the function to reserve the folios
    if (user === null || user.firebaseAuth === null || numFolios <= 0) return;

    setFoliosRequestLoading(true);

    const response = await requestReservarFolios(
      user.firebaseAuth.uid,
      numFolios
    );

    console.log('REQUEST RESERVAR FOLIOS RESPONSE:', response);

    if (response.message.includes('No such object')) {
      Alert.alert('Error', 'No se pudo encontrar un archivo CAF valido para solicitar folios');
      setFoliosRequestLoading(false);
      return;
    }

    // Update the user's folios locally
    await updateUserReservedFolios(response.folios_reservados, response.cafs);

    // Close the modal after successful action
    setFoliosRequestLoading(false);
    setModalVisible(false);
  };

  const handleRefresh = async () => {
    // THIS SHOULD ONLY BE RUN IF WE ARE LOGGED IN
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
        <Text> Folio: {guia.folio}</Text>
        <Text> Fecha: {guia.fecha}</Text>
        <Text> Estado: {guia.estado}</Text>
        <Text> Receptor: {guia.receptor.razon_social}</Text>
        {/* Agregar volumen */}
        <Text> Monto: {guia.monto_total_guia}</Text>
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
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}> Solicitar Folios </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            user?.folios_reservados.length === 0 && styles.disabledButton,
          ]}
          onPress={() => navigation.push('CreateGuia')}
          disabled={
            // TESTING:
            user?.folios_reservados?.length && user.folios_reservados.length > 0
              ? false
              : true
          }
          // Just for testing
          // style={styles.button}
          // onPress={async () => {
          //   const testFolio = 4;
          //   const testCAFNumber = Math.floor((testFolio - 1) / 5);
          //   const testGuia = await _createGuiaTest(testFolio);
          //   const date = new Date();
          //   if (user && user.cafs) {
          //     await generatePDF(
          //       testGuia,
          //       date.toISOString(),
          //       user.cafs[testCAFNumber]
          //     );
          //   }
          // }}
        >
          <Text style={styles.buttonText}> Crear Nueva Guía de Despacho </Text>
        </TouchableOpacity>
      </View>
      <FoliosRequestModal
        foliosRequestLoading={foliosRequestLoading}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
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
    flex: 8,
    width: '100%',
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  buttonsContainer: {
    flex: 2,
    width: '100%',
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  guia: {
    backgroundColor: '#b1ab2f',
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
  box: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
});
