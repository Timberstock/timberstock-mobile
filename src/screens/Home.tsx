import React, { useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import { Emisor, GuiaDespachoSummaryProps } from '../interfaces/guias';
import { HomeScreenProps } from '../interfaces/screens';
import { handleFetchFirebase } from '../functions/screenFunctions';
import { formatDate } from '../functions/helpers';
import { Alert } from 'react-native';

import { AppContext } from '../context/AppContext';

export default function Home(props: HomeScreenProps) {
  const { navigation, GlobalState } = props;
  const { user, rutEmpresa } = GlobalState;
  const { guias, updateGuias, updateEmisor, updateRetrievedData } =
    useContext(AppContext);

  let loading = false;

  useEffect(() => {
    handleRefresh();
  }, [rutEmpresa]);

  const handleRefresh = async () => {
    // THIS ONLY WILL BE RUN IF WE ARE LOGGED IN
    user ? console.log(user.uid) : null;
    if (rutEmpresa) {
      try {
        loading = true;
        console.log('REFRESHING');
        const { empresaInfo, empresaData, empresaGuias } =
          await handleFetchFirebase(rutEmpresa);
        updateGuias(empresaGuias || []);
        updateEmisor(empresaInfo as Emisor);
        updateRetrievedData(empresaData);
        loading = false;
        console.log('DONE');
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la información de la empresa');
      }
    }
  };

  const renderItem = ({ item }: { item: GuiaDespachoSummaryProps }) => {
    const guia = item;
    return (
      <TouchableOpacity style={styles.guia}>
        <Text> Folio: {guia.folio}</Text>
        <Text> Estado: {guia.estado}</Text>
        <Text> Monto: {guia.total}</Text>
        <Text> Receptor: {guia.receptor.razon_social}</Text>
        <Text> Fecha: {formatDate(guia.fecha)}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.screen}>
      <Header screenName="Home" {...props} />
      <View style={styles.body}>
        <FlatList
          data={guias}
          renderItem={renderItem}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CreateGuia')}
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
});
