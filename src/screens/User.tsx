import React, { useContext, useState } from "react";
import colors from "@/resources/Colors";
import Header from "@/components/Header";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { UserContext } from "@/context/UserContext";
import FoliosRequestModal from "@/components/FoliosRequestModal";
import { requestReservarFolios } from "@/functions/firebase/cloud_functions";
import { logoutUser } from "@/functions/firebase/auth";
import * as Updates from "expo-updates";
import { AppContext } from "@/context/AppContext";

export default function User(props: any) {
  const { navigation } = props;
  const { user, updateUserReservedFolios, devolverFolios } =
    useContext(UserContext);

  const { handleUpdateAvailable } = useContext(AppContext);

  const [foliosRequestLoading, setFoliosRequestLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleGetFolios = async (numFolios: number) => {
    // TODO: Fix the Loading icon to not make the size of the Modal change

    // Call the function to reserve the folios
    if (user === null || user.firebaseAuth === null || numFolios <= 0) return;

    setFoliosRequestLoading(true);

    const response = await requestReservarFolios(
      user.firebaseAuth.uid,
      numFolios,
    );

    console.log("REQUEST RESERVAR FOLIOS RESPONSE:", response);

    if (response.message.includes("No such object")) {
      Alert.alert(
        "Error",
        "No se pudo encontrar un archivo CAF valido para solicitar folios",
      );
      setFoliosRequestLoading(false);
      return;
    }

    // Update the user's folios locally
    await updateUserReservedFolios(response.folios_reservados, response.cafs);

    // Close the modal after successful action
    setFoliosRequestLoading(false);
    setModalVisible(false);
  };

  // Confirm the user wants to devolver folios
  const handleDevolverFolios = () => {
    Alert.alert(
      "Devolver folios",
      "¿Estás seguro de devolver todos los folios?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Devolver folios",
          onPress: async () => {
            await devolverFolios();
            Alert.alert("Folios devueltos", "Se han devuelto todos los folios");
          },
        },
      ],
    );
  };

  // Confirm the user wants to logout
  const handleLogoutUser = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        onPress: () => {
          logoutUser();
        },
      },
    ]);
  };

  const handleCheckForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        handleUpdateAvailable();
      } else {
        Alert.alert(
          "No hay actualizaciones",
          "La aplicación ya está actualizada",
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo comprobar si hay actualizaciones disponibles",
      );
      console.error(error);
    }
  };

  return (
    <View style={styles.screen}>
      <Header screenName="Home" {...props} />
      <View style={styles.body}>
        <View style={styles.profileContent}>
          <Icon name="person" size={70} color={colors.secondary} />
          <Text style={styles.name}>{user?.nombre}</Text>
          <Text style={styles.rut}>{user?.rut}</Text>
          <Text style={styles.folios}>
            Cantidad de folios actual: {user?.folios_reservados.length}
          </Text>
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setModalVisible(true);
              }}
            >
              <Icon
                name="file-tray-full"
                style={styles.icon}
                size={20}
                color={colors.white}
              />
              <Text style={styles.buttonText}>Reservar Folios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              disabled={!((user?.folios_reservados.length || 0) > 0)}
              onPress={handleDevolverFolios}
            >
              <Icon
                name="file-tray"
                style={styles.icon}
                size={20}
                color={colors.white}
              />
              <Text style={styles.buttonText}>Devolver Folios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updatesButton}
              onPress={handleCheckForUpdates}
            >
              <Icon
                name="cloud-download-outline"
                style={styles.icon}
                size={20}
                color={colors.white}
              />
              <Text style={styles.buttonText}>Buscar Actualizaciones</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoutButtonContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogoutUser}
            >
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.version}>
          Última actualización app:{" "}
          {Updates.createdAt
            ? `${Updates.createdAt?.getUTCDate()}/${Updates.createdAt?.getUTCMonth() + 1}/${Updates.createdAt?.getUTCFullYear()}`
            : "07/01/2025"}
        </Text>
      </View>
      <FoliosRequestModal
        foliosRequestLoading={foliosRequestLoading}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleGetFolios={handleGetFolios}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 10,
    width: "100%",
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  profileContent: {
    flex: 3,
    padding: 30,
    alignItems: "center",
  },
  name: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "600",
  },
  rut: {
    marginTop: 10,
    fontSize: 16,
    color: colors.accent,
  },
  version: {
    // marginTop: 10,
    fontSize: 16,
    color: colors.gray,
  },
  folios: {
    marginTop: 10,
    fontSize: 16,
    color: colors.secondary,
  },
  bodyContent: {
    flex: 7,
    alignItems: "center",
    padding: 30,
    marginTop: 40,
  },
  buttonsContainer: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    top: 0,
    marginTop: 40,
    position: "absolute",
    width: "100%",
  },
  logoutButtonContainer: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
    position: "absolute",
    bottom: 10,
    width: "50%",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
  },
  updatesButton: {
    backgroundColor: colors.brown,
    borderRadius: 15,
    padding: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
  },
  logoutButton: {
    backgroundColor: colors.darkRed,
    borderRadius: 25,
    padding: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    flex: 3,
  },
  icon: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "bold",
  },
});
