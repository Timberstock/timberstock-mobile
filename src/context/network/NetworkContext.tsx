import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

type NetworkContextType = {
  networkStatus: NetInfoState | null;
  isConnected: boolean;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [networkStatus, setNetworkStatus] = useState<NetInfoState | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      console.log('🌐 [Network Status Changed]', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
      setNetworkStatus(state);
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
      if (state.isConnected && state.isInternetReachable) {
        await firestore().enableNetwork();
      } else {
        await firestore().disableNetwork();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ networkStatus, isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
