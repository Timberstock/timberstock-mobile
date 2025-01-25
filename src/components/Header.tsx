import colors from '@/constants/colors';
import { useNetwork } from '@/context/network/NetworkContext';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const HEADER_HEIGHT = 80;

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const shouldShowBackButton =
    pathname.includes('guia-form') || pathname.includes('producto-form');

  const title = {
    '/guia-form': 'Datos de la Guía',
    '/producto-form': 'Producto de la Guía',
    '/user': 'Usuario',
    '/': 'TimberStock',
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/header_gradient.png')}
        style={[
          headerStyles.container,
          {
            height: HEADER_HEIGHT,
          },
        ]}
      >
        <View
          style={[
            headerStyles.innerContainer,
            {
              paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
            },
          ]}
        >
          <View style={headerStyles.contentContainer}>
            {/* Always render a View for the back button space to maintain layout */}
            <View style={headerStyles.backButtonContainer}>
              {shouldShowBackButton && (
                <TouchableOpacity
                  style={headerStyles.backButton}
                  onPress={() => router.back()}
                >
                  <Icon name="arrow-back" size={25} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={headerStyles.titleText}>
              {title[pathname as keyof typeof title]}
            </Text>

            {/* Placeholder to maintain symmetry */}
            <View style={headerStyles.backButtonContainer}>
              <NetworkIndicator />
            </View>
          </View>
        </View>
      </ImageBackground>
    </>
  );
}

const headerStyles = StyleSheet.create({
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

function NetworkIndicator() {
  const { networkStatus } = useNetwork();

  const getStatusConfig = () => {
    if (!networkStatus?.isConnected) {
      return {
        icon: 'cloud-offline-outline',
        color: colors.error,
      };
    }
    if (!networkStatus?.isInternetReachable) {
      return {
        icon: 'wifi-outline',
        color: colors.warning,
      };
    }
    return {
      icon: 'wifi-outline',
      color: colors.success,
    };
  };

  const config = getStatusConfig();

  return (
    <View style={netIndicatorStyles.container}>
      <Icon name={config.icon} size={28} color={config.color} />
    </View>
  );
}

const netIndicatorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
