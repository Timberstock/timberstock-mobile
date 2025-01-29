import Loading from '@/components/Loading';
import colors from '@/constants/colors';
import { useUser } from '@/context/user/UserContext';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function Login() {
  const { state, login } = useUser();
  const theme = useTheme();
  // const [email, setEmail] = useState('mateo@timberstock.cl');
  const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('Lumber157');
  const [password, setPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    await login(email, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text
              variant="displaySmall"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              TimberStock
            </Text>

            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              disabled={state.loading}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              mode="outlined"
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              disabled={state.loading}
              left={<TextInput.Icon icon="lock" />}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={state.loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              loading={state.loading}
            >
              Iniciar Sesión
            </Button>

            {state.error && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.errorMessage}>{state.error}</Text>
              </Animated.View>
            )}

            {state.loading && (
              <View style={styles.loadingContainer}>
                <Loading errorMessage="Intentando iniciar sesión..." />
              </View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  errorMessage: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
});
