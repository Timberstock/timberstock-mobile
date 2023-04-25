import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4E4E4E" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
