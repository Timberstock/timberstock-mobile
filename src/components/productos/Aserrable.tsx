import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import colors from '../../resources/Colors';
import { AserrableType } from '../../interfaces/productos';

export default function Aserrable({
  clasesDiametricas,
  updateClaseDiametricaValue,
  increaseNumberOfClasesDiametricas,
}: AserrableType) {
  return (
    <View style={styles.container}>
      {
        // For each [label, value] pair in the clasesDiametricas object, create a ClaseDiametricaRow component with the label and value as props
        Object.entries(clasesDiametricas).map((entry, index) => (
          <ClaseDiametricaRow
            key={index}
            label={entry[0]}
            value={entry[1]}
            // TODO: prop drilling bad practice
            updateClaseDiametricaValue={updateClaseDiametricaValue}
          />
        ))
      }
      <View style={styles.row}>
        <TouchableOpacity
          style={{ ...styles.button, ...styles.button.claseDiametrica }}
          onPress={() => increaseNumberOfClasesDiametricas()}
        >
          <Text style={styles.claseDiametricaButtonText}>
            + Clase Diametrica
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ClaseDiametricaRow = ({
  label,
  value,
  updateClaseDiametricaValue,
}: any) => {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{label}</Text>
      <TouchableOpacity
        disabled={value <= 0}
        style={styles.button}
        // Decrease the value by 1
        onPress={() => updateClaseDiametricaValue(label, value - 1)}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={value.toString()}
        keyboardType="numeric"
        // onChangeText={(text) => updateClaseDiametricaValue(label, parseInt(text))}
      />
      <TouchableOpacity
        style={styles.button}
        // Increase the value by 1
        onPress={() => updateClaseDiametricaValue(label, value + 1)}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 2,
    height: 35,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: '#cccccc',
    borderRadius: 13,
    alignSelf: 'center',
    width: '30%',
    textAlign: 'center',
    marginVertical: 7,
  },
  text: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    margin: 5,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    width: 30,
    claseDiametrica: {
      marginTop: 15,
      width: '50%',
      justifySelf: 'center',
    },
  },
  buttonText: {
    color: colors.white,
    fontSize: 20,
  },
  claseDiametricaButtonText: {
    color: colors.white,
    fontSize: 12,
  },
});
