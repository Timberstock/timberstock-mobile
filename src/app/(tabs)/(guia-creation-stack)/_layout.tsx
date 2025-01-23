import { Stack } from 'expo-router';

export default function GuiaCreationStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        presentation: 'card',
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="datos-guia" />
      <Stack.Screen name="datos-producto" />
    </Stack>
  );
}
