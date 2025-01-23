import Loading from '@/components/Loading';
import colors from '@/constants/colors';
import { useUser } from '@/context/user/UserContext';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const { state, login } = useUser();

  // const [email, setEmail] = useState('');
  const [email, setEmail] = useState('mateo@timberstock.cl');
  // const [password, setPassword] = useState('');
  const [password, setPassword] = useState('Lumber157');

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>TimberStock</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text.toLowerCase())}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={state.loading}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      {state.error && <Text style={styles.errorMessage}>{state.error}</Text>}
      <View style={styles.loadingContainer}>
        {state.loading && <Loading errorMessage="Intentando iniciar sesión..." />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: '10%',
  },
  input: {
    height: '5%',
    width: '80%',
    margin: '3%',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
  },

  errorMessage: {
    color: 'red',
    marginTop: '5%',
  },
  button: {
    backgroundColor: colors.secondary,
    padding: '2%',
    borderRadius: 12,
    width: '60%',
    alignItems: 'center',
    marginTop: '5%',
  },
  buttonText: {
    color: colors.white,
    fontSize: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: '75%',
  },
});
