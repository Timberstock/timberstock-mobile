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

    // @ts-ignore the segments array docs are wrong
    if (!state.user) {
      router.replace('/(auth)');
    } else if (state.user && segments[0] !== '(tabs)') {
      router.replace('/(tabs)');
    }
  }, [state.user, state.loading, segments]);

  return (
    <Loading
      errorMessage={`Verificando usuario... si no tiene conexión, puede tardar hasta 60 segundos en cargar el caché...`}
    />
  );
}
