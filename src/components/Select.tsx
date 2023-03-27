import { Select } from '@mobile-reality/react-native-select-pro';
import React from 'react';
import colors from '../resources/Colors';
import { StyleSheet } from 'react-native';

export default function StyledSelect(props: any) {
  return (
    <Select
      selectContainerStyle={styles.selectContainerStyle}
      selectControlStyle={styles.input}
      selectControlArrowImageStyle={{ tintColor: colors.secondary }}
      placeholderText="Nº Folio"
      options={[{ value: 'somevalue', label: 'somelabel' }]}
    />
  );
}

const styles = StyleSheet.create({
  selectContainerStyle: {
    flex: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: '#cccccc',
    padding: 7,
    fontSize: 14,
    borderRadius: 13,
    textShadow: '0 0px 0px rgba(42,42,42,.75)',
    fontWeight: 'normal',
    fontStyle: 'none',
    textAlign: 'left',
    borderStyle: 'solid',
    boxShadow: '0px 0px 0px 0px rgba(42,42,42,.26)',
  },
});
