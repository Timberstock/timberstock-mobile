import Header from '@/components/Header';
import { theme } from '@/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.outline,
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
            />
          ),
          tabBarLabelStyle: styles.label,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="(guia-creation-stack)"
          options={{
            title: 'Guías',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="clipboard-list" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'Usuario',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="circle-user" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: theme.colors.surfaceContainer,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.surfaceVariant,
    elevation: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
  },
});
