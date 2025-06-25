import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

type Props = {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<Props> = ({
  children,
  requiredRole,
  redirectTo = '/(auth)/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo as any);
      } else if (requiredRole && user?.role !== requiredRole) {
        router.replace('/(auth)/unauthorized' as any);
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, user?.role, router, redirectTo]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If not authenticated or wrong role, show loading (navigation happens in useEffect)
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};
