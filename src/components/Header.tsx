import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  // Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
// import Constants from "expo-constants";

import colors from "@/resources/Colors";

interface HeaderProps {
  screenName?: string;
  navigation?: any;
  empresa?: string;
}

export default function Header(props: HeaderProps) {
  const { empresa, screenName, navigation } = props;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require("../../assets/header_gradient.png")} // Put your gradient image here
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {screenName !== "Home" && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
        )}
        <Text style={styles.titleText}>{empresa || "TimberStock"}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop: Platform.OS === "ios" ? Constants.statusBarHeight : 40,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  titleText: {
    flex: 1,
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
});
