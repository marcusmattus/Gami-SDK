import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/hooks/useAuth';
import { GamiSDKProvider } from './src/hooks/useGamiSDK';
import { PointsProvider } from './src/hooks/usePoints';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <GamiSDKProvider>
          <PointsProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </PointsProvider>
        </GamiSDKProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}