import Loading from '@/components/Loading';
import { authenticateUser } from '@/functions/firebase/auth';
import colors from '@/resources/Colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState(''); //SACAR EL VALOR POR DEFECTO
  const [password, setPassword] = useState(''); //SACAR EL VALOR POR DEFECTO
  //   const [email, setEmail] = useState('mateo@timberstock.cl'); //SACAR EL VALOR POR DEFECTO
  //   const [password, setPassword] = useState('Lumber157'); //SACAR EL VALOR POR DEFECTO
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const authResponseMessage = await authenticateUser(email, password);
    if (authResponseMessage !== 'Sesión iniciada') {
      setLoading(false);
      setErrorMessage(authResponseMessage);
      return;
    }
    // No need to navigate manually, _layout.tsx will handle redirection
    setErrorMessage(null);
    setLoading(false);
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <View style={styles.loadingContainer}>{loading && <Loading errorMessage="Intentando iniciar sesión..." />}</View>
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
