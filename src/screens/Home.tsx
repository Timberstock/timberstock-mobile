import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import colors from '../resources/Colors';
import Header from '../components/Header';
import {
  GuiaDespachoProps,
  GuiaDespachoSummaryProps,
} from '../interfaces/guias';
import { HomeScreenProps } from '../interfaces/screens';
import { formatDate } from '../functions/helpers';
import { readGuias } from '../functions/firebase/guias';

export default function Home(props: HomeScreenProps) {
  const { navigation, GlobalState } = props;
  const { user, guias, setGuias, rutEmpresa } = GlobalState;

  let loading = false;

  useEffect(() => {
    handleRefresh();
  }, [rutEmpresa]);

  const handleRefresh = async () => {
    // THIS ONLY WILL BE RUN IF WE ARE LOGGED IN
    user ? console.log(user.uid) : null;
    if (rutEmpresa) {
      loading = true;
      console.log('REFRESHING');
      const newGuias = await readGuias(rutEmpresa);
      setGuias(newGuias || []);
      console.log('DONE');
      loading = false;
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
      <Header screenName="Guias" {...props} />
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
