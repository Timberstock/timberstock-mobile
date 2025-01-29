import colors from '@/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Surface } from 'react-native-paper';

interface Props {
  loading: boolean;
}

const OverlayLoading: React.FC<Props> = ({ loading }) => {
  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <Surface style={styles.loadingContainer} elevation={5}>
        <ActivityIndicator size="large" color={colors.white} />
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(33, 33, 33, 0.9)',
    borderRadius: 12,
    padding: 24,
  },
});

export default OverlayLoading;
