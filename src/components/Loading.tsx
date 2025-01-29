import colors from '@/constants/colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';

function Loading({ errorMessage }: { errorMessage: string }) {
  return (
    <Surface style={styles.container} elevation={0}>
      <ActivityIndicator size="large" color={colors.secondary} />
      <Text variant="bodyLarge" style={styles.errorMessage}>
        {errorMessage}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorMessage: {
    marginTop: 20,
    color: colors.secondary,
  },
});

export default Loading;
