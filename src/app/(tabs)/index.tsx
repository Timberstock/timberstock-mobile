import Loading from '@/components/Loading';
import { useApp } from '@/context/app/AppContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function TabsIndex() {
  const {
    state: { loading },
  } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // @ts-ignore the segments array docs are wrong
    if (!loading && segments[0] === '(tabs)' && !segments[1]) {
      console.log('REDIRECTING TO GUIA CREATION STACK');
      router.replace('/(tabs)/(guia-creation-stack)');
    }
  }, [loading, segments]);

  return <Loading errorMessage="Cargando datos de la empresa..." />;
}
