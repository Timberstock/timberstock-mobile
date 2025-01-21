import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function Loading({ errorMessage }: { errorMessage: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4E4E4E" />
      <Text style={styles.errorMessage}>{errorMessage}</Text>
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
