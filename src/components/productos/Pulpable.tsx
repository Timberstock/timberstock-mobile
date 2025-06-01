import { useProductoForm } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { theme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Surface, TextInput } from 'react-native-paper';

export default function Pulpable() {
  const {
    state: { productoForm },
  } = useProductoForm();

  const bancos = productoForm.bancos;

  return (
    <View style={styles.container}>
      {bancos!.map((banco, index) => (
        <Surface key={index} style={styles.bancoContainer} mode="flat">
          <BancoRow bancoIndex={index} />
        </Surface>
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
      <Text style={styles.bancoLabel}>Banco {(bancoIndex + 1).toString()}</Text>
      <View style={styles.inputsContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Altura 1</Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            keyboardType="numeric"
            value={
              bancos![bancoIndex].altura1 !== 0
                ? bancos![bancoIndex].altura1.toString()
                : undefined
            }
            placeholder="cm"
            onChangeText={onChangeTextHandlerGenerator('altura1')}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Altura 2</Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            keyboardType="numeric"
            value={
              bancos![bancoIndex].altura2 !== 0
                ? bancos![bancoIndex].altura2.toString()
                : undefined
            }
            placeholder="cm"
            onChangeText={onChangeTextHandlerGenerator('altura2')}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Ancho</Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            keyboardType="numeric"
            value={
              bancos![bancoIndex].ancho !== 0
                ? bancos![bancoIndex].ancho.toString()
                : undefined
            }
            placeholder="cm"
            onChangeText={onChangeTextHandlerGenerator('ancho')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  bancoContainer: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  row: {
    gap: 8,
  },
  bancoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    height: 56, // THICC input for them field fingers
    width: '100%',
  },
  inputContent: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputOutline: {
    borderRadius: 12,
  },
});
