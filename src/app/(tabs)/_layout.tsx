import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Header from '@/components/Header';

export default function TabLayout() {
  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="(guia-creation-stack)"
          options={{
            title: 'Guias',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="table" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'Usuario',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="user" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
