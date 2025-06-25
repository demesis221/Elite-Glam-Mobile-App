import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { NetworkProvider } from '../contexts/NetworkContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ProductsProvider } from '../contexts/ProductsContext';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LoadingScreen from '../components/LoadingScreen';
import SyncStatusIndicator from '../components/SyncStatusIndicator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    // Add any custom fonts here
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Prepare app resources, fonts, etc.
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate loading time
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NetworkProvider>
          <NotificationProvider>
            <ProductsProvider>
              <CartProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(freelancer)" options={{ headerShown: false }} />
                  <Stack.Screen name="(renter)" options={{ headerShown: false }} />
                  <Stack.Screen name="appointments" options={{ title: 'My Appointments' }} />
                </Stack>
                <SyncStatusIndicator />
              </CartProvider>
            </ProductsProvider>
          </NotificationProvider>
        </NetworkProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
