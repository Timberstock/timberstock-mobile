import React from "react";
import "expo-dev-client";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SelectProvider } from "@mobile-reality/react-native-select-pro";
import firestore from "@react-native-firebase/firestore";
import { StyleSheet, TouchableOpacity, View, Text, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import UserContextProvider from "@/context/UserContext";
import AuthWrapper from "@/AuthWrapper";
import Home from "@/screens/Home";
import User from "@/screens/User";
import { logoutUser } from "@/functions/firebase/auth";
import CreateGuia from "@/screens/emision/Create";
import CreateGuiaProductos from "@/screens/emision/Productos";
import * as Updates from "expo-updates";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// For the day when we use more screens https://medium.com/@jacrplante/react-native-screens-multiple-stacks-da112a94ad24

// DEV
// To use local also go to src/functions/firebase/cloud_functions.ts
// firestore().useEmulator("localhost", 8080);

export default function App() {
  console.log("APP STARTED");
  const deleteCache = async (): Promise<number> => {
    try {
      await logoutUser();
      await firestore().terminate();
      await firestore().clearPersistence();
      Alert.alert("Persistence cleared");
      return 200;
    } catch (error: any) {
      console.error("Could not enable persistence:", error);
      Alert.alert("Could not clear cache: ", error.code);
      return 400;
    }
  };
  const [clearCache, setClearCache] = React.useState(false);
  const [loadApp, setLoadApp] = React.useState(false);

  const handleLoadApp = () => {
    console.log("Loading the app...");
    setLoadApp(true);
    // TODO: arreglar los re renders y cosas entre medio que hacen que se vea feo
  };

  const handleClearCache = async () => {
    console.log("Clearing cache...");
    setClearCache(true);
    const result: number = await deleteCache();
    if (result === 200) {
      setClearCache(true);
      return;
    } else {
      setClearCache(false);
      return;
    }
  };

  if (!clearCache && !loadApp) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleLoadApp}>
          <Text style={styles.buttonText}>Iniciar App</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Limpiar Cache</Text>
        </TouchableOpacity>
        <Text>
          Última actualización app:{" "}
          {Updates.createdAt
            ? `${Updates.createdAt?.getUTCDate()}/${Updates.createdAt?.getUTCMonth() + 1}/${Updates.createdAt?.getUTCFullYear()}`
            : "07/01/2025"}
        </Text>
      </View>
    );
  }

  if (clearCache) {
    return null;
  }

  return (
    <SelectProvider>
      <UserContextProvider>
        <AuthWrapper>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                options={{ headerShown: false }}
                component={Guias}
              />
              <Stack.Screen
                name="CreateGuia"
                options={{ headerShown: false }}
                component={CreateGuia}
              />
              <Stack.Screen
                name="CreateGuiaProductos"
                options={{ headerShown: false }}
                component={CreateGuiaProductos}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthWrapper>
      </UserContextProvider>
    </SelectProvider>
  );
}

function Guias() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = "";

          if (route.name === "Guias") {
            iconName = focused ? "albums-sharp" : "albums-outline";
          } else if (route.name === "Usuario") {
            iconName = focused
              ? "person-circle-sharp"
              : "person-circle-outline";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Guias"
        options={{ headerShown: false }}
        component={Home}
      />
      <Tab.Screen
        name="Usuario"
        options={{ headerShown: false }}
        component={User}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
