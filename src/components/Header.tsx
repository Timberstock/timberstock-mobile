import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import colors from '@/resources/Colors';

const HEADER_HEIGHT = 80;

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const shouldShowBackButton =
    pathname.includes('datos-guia') || pathname.includes('datos-producto');

  const title = {
    '/datos-guia': 'Datos de la Guía',
    '/datos-producto': 'Datos del Producto de la Guía',
    '/user': 'TimberStock',
    '/': 'TimberStock',
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/header_gradient.png')}
        style={[
          styles.container,
          {
            height: HEADER_HEIGHT,
          },
        ]}
      >
        <View
          style={[
            styles.innerContainer,
            {
              paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
            },
          ]}
        >
          <View style={styles.contentContainer}>
            {/* Always render a View for the back button space to maintain layout */}
            <View style={styles.backButtonContainer}>
              {shouldShowBackButton && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Icon name="arrow-back" size={25} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.titleText}>
              {title[pathname as keyof typeof title]}
            </Text>

            {/* Placeholder to maintain symmetry */}
            <View style={styles.backButtonContainer} />
          </View>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
  },
  titleText: {
    flex: 1,
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
