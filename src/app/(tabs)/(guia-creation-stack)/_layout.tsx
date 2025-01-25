import { GuiaCreationProvider } from '@/context/guia-creation/creation/CreationContext';
import { GuiaFormProvider } from '@/context/guia-creation/guia-form/GuiaFormContext';
import { ProductoFormProvider } from '@/context/guia-creation/producto-form/ProductoFormContext';
import { Stack } from 'expo-router';

export default function GuiaCreationStackLayout() {
  return (
    <GuiaCreationProvider>
      <GuiaFormProvider>
        <ProductoFormProvider>
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
            <Stack.Screen name="guia-form" />
            <Stack.Screen name="producto-form" />
          </Stack>
        </ProductoFormProvider>
      </GuiaFormProvider>
    </GuiaCreationProvider>
  );
}
