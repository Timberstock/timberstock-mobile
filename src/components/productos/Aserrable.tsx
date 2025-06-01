import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { theme } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text, TextInput } from 'react-native-paper';

export default function Aserrable() {
  const {
    state: { productoForm },
    updateClasesDiametricas,
  } = useProductoForm();

  const { clases_diametricas_guia } = productoForm;

  return (
    <View style={styles.container}>
      {clases_diametricas_guia!.map((claseDiametrica, index) => (
        <Surface key={index} style={styles.rowContainer} mode="flat">
          <ClaseDiametricaRow
            clase={claseDiametrica.clase}
            cantidad={claseDiametrica.cantidad_emitida || 0}
          />
        </Surface>
      ))}
      <Button
        mode="contained-tonal"
        onPress={() => updateClasesDiametricas()}
        style={styles.addButton}
        icon="plus"
      >
        Agregar Clase Diametrica
      </Button>
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
      <Text variant="bodyLarge" style={styles.text}>
        {clase}
      </Text>
      <View style={styles.counterContainer}>
        <IconButton
          icon="minus"
          mode="contained"
          size={24}
          disabled={cantidad <= 0}
          onPress={() => updateClasesDiametricas(clase, cantidad - 1)}
          style={styles.iconButton}
          containerColor={theme.colors.errorContainer}
          iconColor={theme.colors.onErrorContainer}
        />
        <TextInput
          mode="outlined"
          value={cantidad.toString()}
          keyboardType="numeric"
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineStyle={styles.inputOutline}
        />
        <IconButton
          icon="plus"
          mode="contained"
          size={24}
          onPress={() => updateClasesDiametricas(clase, cantidad + 1)}
          style={styles.iconButton}
          iconColor={theme.colors.onPrimary}
          containerColor={theme.colors.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  rowContainer: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: theme.colors.onSurface,
    flex: 1,
    marginLeft: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    height: 48,
    width: 80,
    textAlign: 'center',
  },
  inputContent: {
    textAlign: 'center',
  },
  inputOutline: {
    borderRadius: 8,
  },
  iconButton: {
    margin: 0,
    width: 48,
    height: 48,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 100,
  },
});
