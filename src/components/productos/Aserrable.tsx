import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import colors from "@/resources/Colors";
import { ClaseDiametricaGuia } from "@/interfaces/firestore/guia";

export default function Aserrable({
  clasesDiametricas,
  updateClaseDiametricaValue,
  increaseNumberOfClasesDiametricas,
}: {
  clasesDiametricas: ClaseDiametricaGuia[];
  updateClaseDiametricaValue: (clase: string, cantidad: number) => void;
  increaseNumberOfClasesDiametricas: () => void;
}) {
  return (
    <View style={styles.container}>
      {clasesDiametricas.map((claseDiametrica, index) => (
        <ClaseDiametricaRow
          key={index}
          clase={claseDiametrica.clase}
          cantidad={claseDiametrica.cantidad_emitida || 0}
          // TODO: prop drilling bad practice
          updateClaseDiametricaValue={updateClaseDiametricaValue}
        />
      ))}
      <View style={styles.row}>
        <TouchableOpacity
          style={{ ...styles.button, ...styles.button.claseDiametrica }}
          onPress={increaseNumberOfClasesDiametricas}
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
  clase,
  cantidad,
  updateClaseDiametricaValue,
}: {
  clase: string;
  cantidad: number;
  updateClaseDiametricaValue: (clase: string, cantidad: number) => void;
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{clase}</Text>
      <TouchableOpacity
        disabled={cantidad <= 0}
        style={styles.button}
        // Decrease the cantidad by 1
        onPress={() => updateClaseDiametricaValue(clase, cantidad - 1)}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={cantidad.toString()}
        keyboardType="numeric"
        // onChangeText={(text) => updateClaseDiametricaValue(clase, parseInt(text))}
      />
      <TouchableOpacity
        style={styles.button}
        // Increase the cantidad by 1
        onPress={() => updateClaseDiametricaValue(clase, cantidad + 1)}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  input: {
    borderWidth: 2,
    height: 35,
    backgroundColor: colors.white,
    padding: 7,
    borderColor: "#cccccc",
    borderRadius: 13,
    alignSelf: "center",
    width: "30%",
    textAlign: "center",
    marginVertical: 7,
  },
  text: {
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "left",
    margin: 5,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 10,
    alignItems: "center",
    width: 30,
    claseDiametrica: {
      marginTop: 15,
      width: "50%",
      justifySelf: "center",
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
