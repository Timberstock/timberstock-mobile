import Loading from '@/components/Loading';
import { useUser } from '@/context/user/UserContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function AppIndex() {
  const { state } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (state.loading) return;
    console.log('[segments]', segments);

    // @ts-ignore the segments array docs are wrong
    if (!state.user) {
      console.log('👋 [User not found, redirecting to auth]');
      router.replace('/(auth)');
    } else if (state.user) {
      console.log('👋 [User found, redirecting to tabs]');
      router.replace('/(tabs)');
    }
  }, [state.user, state.loading, segments]);

  return <Loading errorMessage="Verificando usuario..." />;
}
