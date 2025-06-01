import { AppProvider } from '@/context/app/AppContext';
import { FolioProvider } from '@/context/folio/FolioContext';
import { NetworkProvider } from '@/context/network/NetworkContext';
import { UserProvider } from '@/context/user/UserContext';
import { theme } from '@/theme';
import '@react-native-firebase/app';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

// if (__DEV__) {
//   try {
//     console.log('🔥 Connecting to Firebase emulators...');
//     // Change to "10.0.2.2" for Android
//     firestore().useEmulator('localhost', 8080);
//     firebase.app().functions('us-central1').useEmulator('localhost', 5001);
//     console.log('✅ Connected to Firebase emulators');
//   } catch (error) {
//     console.error('❌ Failed to connect to emulators:', error);
//   }
// }

// This component handles the auth flow and protected routes
function AuthLayout() {
  return <Slot />;
}

// Root layout sets up providers
export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <NetworkProvider>
        <UserProvider>
          <FolioProvider>
            <AppProvider>
              <AuthLayout />
            </AppProvider>
          </FolioProvider>
        </UserProvider>
      </NetworkProvider>
    </PaperProvider>
  );
}
