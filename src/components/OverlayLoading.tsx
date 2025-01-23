import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  loading: boolean;
}

const OverlayLoading: React.FC<Props> = ({ loading }) => {
  return (
    <>
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </View>
      )}
    </>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 25,
  },
});

export default OverlayLoading;
