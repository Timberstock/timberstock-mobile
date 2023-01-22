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
import { GuiaDespachoProps, GuiasScreenProps } from '../interfaces/guias';
import { formatDate } from '../functions/logic';
import { readGuias } from '../functions/firebase';

export default function Guias(props: GuiasScreenProps) {
  const { navigation, GlobalState } = props;
  const { guias, setGuias, rutEmpresa } = GlobalState;
  let loading = false;

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    loading = true;
    console.log('REFRESHING');
    const newGuias = await readGuias(rutEmpresa);
    setGuias(newGuias || []);
    console.log('DONE');
    loading = false;
  };

  const renderItem = ({ item }: { item: GuiaDespachoProps }) => {
    const guia = item;
    return (
      <TouchableOpacity style={styles.guia}>
        <Text> Folio: {guia.folio}</Text>
        <Text> Estado: {guia.estado}</Text>
        <Text> Monto: {guia.monto}</Text>
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
