import React from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import colors from '../resources/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

interface HeaderProps {
  screenName?: string;
  navigation?: any;
}

export default function Header(props: HeaderProps) {
  const { screenName, navigation } = props;

  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        {screenName !== 'Guias' && (
          <TouchableOpacity style={styles.back} onPress={() => handleBack()}>
            <Icon name="arrow-back" size={38} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.text}> TimberStock</Text>
      <View style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    flexDirection: 'row',
    zIndex: 1,
  },
  text: {
    flex: 8,
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  box: {
    flex: 1,
  },
  back: {
    paddingLeft: 5,
  },
});
