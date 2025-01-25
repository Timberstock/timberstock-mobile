import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function Pulpable() {
  const {
    state: { productoForm },
  } = useProductoForm();

  console.log(productoForm);
  const bancos = productoForm.bancos;

  return (
    <View style={styles.container}>
      {/* Banco reference is done by string `banco${index + 1}`  */}
      {bancos!.map((banco, index) => (
        <BancoRow key={index} bancoIndex={index} />
      ))}
    </View>
  );
}

const BancoRow = ({ bancoIndex }: { bancoIndex: number }) => {
  const {
    state: {
      productoForm: { bancos },
    },
    updateBancos,
  } = useProductoForm();

  const onChangeTextHandlerGenerator = (dimension: 'altura1' | 'altura2' | 'ancho') => {
    return (text: string) => {
      if (isNaN(parseInt(text))) {
        updateBancos(bancoIndex, dimension, 0);
      } else {
        updateBancos(bancoIndex, dimension, parseInt(text));
      }
    };
  };

  return (
    <View style={styles.row}>
      <Text style={styles.bancoLabel}> Banco{(bancoIndex + 1).toString()} </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Altura 1</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          // TODO: this is a hacky solution to show no value when the value is 0
          value={
            bancos![bancoIndex].altura1 !== 0
              ? bancos![bancoIndex].altura1.toString()
              : undefined
          }
          placeholder={'cm'}
          onChangeText={onChangeTextHandlerGenerator('altura1')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Altura 2</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={
            bancos![bancoIndex].altura2 !== 0
              ? bancos![bancoIndex].altura2.toString()
              : undefined
          }
          placeholder={'cm'}
          onChangeText={onChangeTextHandlerGenerator('altura2')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ancho</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={
            bancos![bancoIndex].ancho !== 0
              ? bancos![bancoIndex].ancho.toString()
              : undefined
          }
          placeholder={'cm'}
          onChangeText={onChangeTextHandlerGenerator('ancho')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%', // Ensures it takes up the full height of its parent
    width: '100%', // Ensures it takes up the full width of its parent
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: '5%',
    marginVertical: 5, // Reduced the vertical margin for better fit
  },
  inputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bancoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    height: 30,
    backgroundColor: 'white',
    padding: 7,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '90%',
  },
});
