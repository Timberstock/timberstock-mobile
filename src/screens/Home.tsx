import React, { useEffect, useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { AppContext } from "@/context/AppContext";
import colors from "@/resources/Colors";
import Header from "@/components/Header";
import { fetchGuiasDocs } from "@/functions/firebase/firestore/guias";
import { GuiaDespachoSummaryProps } from "@/interfaces/screens/home";
import { UserContext } from "@/context/UserContext";

export default function Home(props: any) {
  const { navigation } = props;
  const { user, updateUserAuth } = useContext(UserContext);
  const { guiasSummary, updateGuiasSummary } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    if (user?.empresa_id) {
      try {
        const empresaGuias = await fetchGuiasDocs(user.empresa_id);
        updateGuiasSummary(empresaGuias);
        updateUserAuth(user.firebaseAuth);
        setLoading(false);
      } catch (error) {
        Alert.alert(
          "Error al cargar guías",
          "No se pudo obtener la información de la empresa",
        );
      }
    } else {
      Alert.alert("Error", "Error al cargar empresa_id del usuario");
    }
  };

  const handleCreateGuia = () => {
    if (user?.folios_reservados.length === 0 || !user?.folios_reservados) {
      Alert.alert("Error", "No tienes folios reservados");
    } else {
      navigation.push("CreateGuia");
    }
  };

  const renderItem = ({ item }: { item: GuiaDespachoSummaryProps }) => {
    const handleLinkClick = () => {
      item.pdf_url
        ? Linking.openURL(item.pdf_url)
        : Alert.alert(
            "No link",
            "Todavía no se ha generado el link de esta guía o se ha producido un error",
          );
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Folio: {item.folio}</Text>
          <Icon
            name="external-link"
            style={styles.icon}
            size={30}
            color={colors.accent}
            onPress={handleLinkClick}
          />
        </View>
        <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
        <Text style={styles.cardText}>Estado: {item.estado}</Text>
        <Text style={styles.cardText}>
          Receptor: {item.receptor.razon_social}
        </Text>
        <Text style={styles.cardText}>Monto: {item.monto_total_guia}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header screenName="Home" {...props} />
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} />
        ) : (
          <FlatList
            data={guiasSummary}
            renderItem={renderItem}
            onRefresh={handleRefresh}
            refreshing={loading}
          />
        )}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              user?.folios_reservados.length === 0 && styles.disabledButton,
            ]}
            onPress={handleCreateGuia}
          >
            <Text
              style={[
                styles.buttonText,
                user?.folios_reservados.length === 0 &&
                  styles.disabledButtonText,
              ]}
            >
              Crear Nueva Guía de Despacho
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  body: {
    flex: 9,
    padding: 15,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 7,
  },
  icon: {
    flex: 1,
    alignItems: "flex-end",
  },
  cardText: {
    fontSize: 14,
    color: colors.darkGray,
    marginVertical: 2,
  },
  buttonsContainer: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
    position: "absolute",
    bottom: 25,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.lightGrayButton, // Set a lighter color or gray tone for disabled state
    borderColor: colors.darkGrayButton, // Optional border color for contrast
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: colors.gray, // Use a lighter text color to indicate it's disabled
  },
});
