import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4E4E4E" />
      <Text style={styles.errorMessage}>
        Intendando conectarse al servidor o buscando datos en cache{' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'blue',
    marginTop: '5%',
  },
});

export default Loading;
