import React from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import { Banco } from '@/interfaces/screens/emision/productos';

export default function Pulpable({
  bancosPulpable,
  updateBancoPulpableValue,
}: {
  bancosPulpable: Banco[];
  updateBancoPulpableValue: (
    bancoIndex: number,
    dimension: keyof Banco,
    value: number
  ) => void;
}) {
  return (
    <View style={styles.container}>
      {/* Banco reference is done by string `banco${index + 1}`  */}
      {bancosPulpable.map((banco, index) => (
        <BancoRow
          key={index}
          bancoIndex={index}
          altura1={banco.altura1}
          altura2={banco.altura2}
          ancho={banco.ancho}
          updateBancoPulpableValue={updateBancoPulpableValue}
        />
      ))}
    </View>
  );
}

const BancoRow = ({
  bancoIndex,
  altura1,
  altura2,
  ancho,
  updateBancoPulpableValue,
}: {
  bancoIndex: number;
  altura1: number;
  altura2: number;
  ancho: number;
  updateBancoPulpableValue: (
    bancoIndex: number,
    dimension: keyof Banco,
    value: number
  ) => void;
}) => {
  // Function that generates the onChangeText handler according to the dimension (to avoid repeating code)
  // TODO: will the returned functions be re created every time the component re renders?
  const onChangeTextHandlerGenerator = (dimension: keyof Banco) => {
    return (text: string) => {
      if (isNaN(parseInt(text))) {
        updateBancoPulpableValue(bancoIndex, dimension, 0);
      } else {
        updateBancoPulpableValue(bancoIndex, dimension, parseInt(text));
      }
    };
  };

  return (
    <View style={styles.row}>
      <Text style={styles.bancoLabel}>
        {' '}
        Banco{(bancoIndex + 1).toString()}{' '}
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Altura 1</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          // TODO: this is a hacky solution to show no value when the value is 0
          value={altura1 !== 0 ? altura1.toString() : undefined}
          placeholder={'cm'}
          onChangeText={onChangeTextHandlerGenerator('altura1')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Altura 2</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={altura2 !== 0 ? altura2.toString() : undefined}
          placeholder={'cm'}
          onChangeText={onChangeTextHandlerGenerator('altura2')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ancho</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={ancho !== 0 ? ancho.toString() : undefined}
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
