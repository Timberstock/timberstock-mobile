import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { authenticateUser } from '../functions/firebase/auth';
import colors from '../resources/Colors';

export default function Login() {
  const [email, setEmail] = useState('mateo@timberstock.cl'); //SACAR EL VALOR POR DEFECTO
  const [password, setPassword] = useState('Lumber157'); //SACAR EL VALOR POR DEFECTO
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleLogin = async (email: string, password: string) => {
    const authResponseMessage = await authenticateUser(email, password);
    if (authResponseMessage !== 'Sesión iniciada') {
      setErrorMessage(authResponseMessage);
    }
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
        onPress={() => handleLogin(email, password)}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
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
});
