import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from "@/resources/Colors";

interface HeaderProps {
  screenName?: string;
  navigation?: any;
  empresa?: string;
}

export default function Header(props: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { empresa, screenName, navigation } = props;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ImageBackground
        source={require("../../assets/header_gradient.png")}
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
          }
        ]}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
