import { useNetwork } from '@/context/network/NetworkContext';
import { theme } from '@/theme';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// Base height without insets
const BASE_HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [fadeAnim] = React.useState(new Animated.Value(1));
  const [slideAnim] = React.useState(new Animated.Value(0));

  // Calculate total header height including safe area
  const headerHeight =
    BASE_HEADER_HEIGHT +
    (Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0);

  const shouldShowBackButton =
    pathname.includes('guia-form') || pathname.includes('producto-form');

  const title = {
    '/guia-form': 'Datos de la Guía',
    '/producto-form': 'Producto de la Guía',
    '/user': 'Usuario',
    '/': 'TimberBiz',
  };

  React.useEffect(() => {
    slideAnim.setValue(-2);
    fadeAnim.setValue(0.95);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [pathname]);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View
        style={[
          headerStyles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            height: headerHeight,
            paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
          },
        ]}
      >
        <View style={headerStyles.innerContainer}>
          <View style={headerStyles.contentContainer}>
            <View style={headerStyles.backButtonContainer}>
              {shouldShowBackButton && (
                <IconButton
                  icon="arrow-left"
                  iconColor={theme.colors.onPrimary}
                  size={28}
                  onPress={() => router.back()}
                  style={headerStyles.backButton}
                  animated={true}
                />
              )}
            </View>

            <Animated.Text style={[headerStyles.titleText, { opacity: fadeAnim }]}>
              {title[pathname as keyof typeof title]}
            </Animated.Text>

            <View style={headerStyles.backButtonContainer}>
              <NetworkIndicator />
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

function NetworkIndicator() {
  const { networkStatus } = useNetwork();
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (!networkStatus?.isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [networkStatus?.isConnected]);

  const getStatusConfig = () => {
    if (!networkStatus?.isConnected) {
      return {
        icon: 'cloud-offline-outline',
        color: theme.colors.error,
      };
    }
    if (!networkStatus?.isInternetReachable) {
      return {
        icon: 'wifi-outline',
        color: theme.colors.warning,
      };
    }
    return {
      icon: 'wifi-outline',
      color: theme.colors.success,
    };
  };

  const config = getStatusConfig();

  return (
    <Animated.View style={{ opacity: pulseAnim }}>
      <Icon name={config.icon} size={28} color={config.color} />
    </Animated.View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: BASE_HEADER_HEIGHT,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButton: {
    margin: 0,
  },
  titleText: {
    flex: 1,
    color: theme.colors.onPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
