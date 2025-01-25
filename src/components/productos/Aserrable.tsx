import colors from '@/constants/colors';
import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Aserrable() {
  const {
    state: { productoForm },
    updateClasesDiametricas,
  } = useProductoForm();

  const { clases_diametricas_guia } = productoForm;

  return (
    <View style={styles.container}>
      {clases_diametricas_guia!.map((claseDiametrica, index) => (
        <ClaseDiametricaRow
          key={index}
          clase={claseDiametrica.clase}
          cantidad={claseDiametrica.cantidad_emitida || 0}
        />
      ))}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              marginTop: 15,
              width: '50%',
              alignSelf: 'center',
              // justifySelf: 'center',
            },
          ]}
          onPress={() => updateClasesDiametricas()}
        >
          <Text style={styles.claseDiametricaButtonText}>+ Clase Diametrica</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ClaseDiametricaRow = ({
  clase,
  cantidad,
}: {
  clase: string;
  cantidad: number;
}) => {
  const { updateClasesDiametricas } = useProductoForm();
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{clase}</Text>
      <TouchableOpacity
        disabled={cantidad <= 0}
        style={styles.button}
        // Decrease the cantidad by 1
        onPress={() => updateClasesDiametricas(clase, cantidad - 1)}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={cantidad.toString()}
        keyboardType="numeric"
        // onChangeText={(text) => updateClasesDiametricas(clase, parseInt(text))}
      />
      <TouchableOpacity
        style={styles.button}
        // Increase the cantidad by 1
        onPress={() => updateClasesDiametricas(clase, cantidad + 1)}
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
