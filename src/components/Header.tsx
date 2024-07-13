import React from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { logoutUser } from '@/functions/firebase/auth';
import colors from '@/resources/Colors';

interface HeaderProps {
  screenName?: string;
  navigation?: any;
  empresa?: string;
}

export default function Header(props: HeaderProps) {
  const { empresa, screenName, navigation } = props;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        {screenName !== 'Home' && (
          <TouchableOpacity style={styles.back} onPress={() => handleBack()}>
            <Icon name="arrow-back" size={38} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.text}> {empresa ? empresa : 'TimberStock'}</Text>
      <View style={styles.box}>
        <TouchableOpacity onPress={() => handleLogout()}>
          <Icon name="close-outline" size={30} color={colors.secondary} />
        </TouchableOpacity>
      </View>
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
