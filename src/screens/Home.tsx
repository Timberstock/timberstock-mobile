import React, { useEffect, useContext, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import { Emisor, GuiaDespachoSummaryProps } from '../interfaces/guias';
import { HomeScreenProps } from '../interfaces/screens';
import { handleFetchFirebase } from '../functions/screenFunctions';
import { Alert } from 'react-native';

import { AppContext } from '../context/AppContext';

import { UserContext } from '../context/UserContext';
import customHelpers from '../functions/helpers';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Home(props: HomeScreenProps) {
  const { navigation } = props;
  const { user } = useContext(UserContext);
  const {
    guiasSummary,
    updateGuiasSummary,
    updateEmisor,
    updateRetrievedData,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);

  //   useFocusEffect(
  // TODO: we will have to use useMemo because eventually, we are going
  // to load things faster and from before the screen visited again
  // we can check if the data is already loaded and if it is, we don't
  // have to load it again nor show the loading icon.
  //   handleRefresh
  //   );

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    // THIS ONLY WILL BE RUN IF WE ARE LOGGED IN
    if (user === null) return;
    if (user.empresa_id) {
      try {
        console.log('REFRESHING');
        const { empresaInfo, empresaData, empresaGuias }: any =
          await handleFetchFirebase(user.empresa_id);
        updateGuiasSummary(empresaGuias || []);
        updateEmisor(empresaInfo as Emisor);
        updateRetrievedData(empresaData);
        setLoading(false);
        console.log('DONE');
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la información de la empresa');
      }
    } else {
      Alert.alert('Error', 'No se pudo obtener la información de la empresa');
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
        <Text> Fecha: {customHelpers.formatDate(guia.fecha)}</Text>
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.push('CreateGuia')}
        >
          <Text style={styles.buttonText}> Crear Nueva Guía de Despacho </Text>
        </TouchableOpacity>
      </View>
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
    flex: 9,
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
    borderRadius: 12,
    padding: 15,
    margin: 10,
    marginBottom: '5%',
    alignItems: 'center',
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
