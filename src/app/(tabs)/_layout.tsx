import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { LoadingScreen } from '../../components/ui';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: string;
  icon: IconName;
}

const TabBarIcon = (props: { name: IconName; color: string }) => {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
};

export default function TabLayout() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading || !user || !role) {
    return <LoadingScreen />;
  }

  const getTabsForRole = (userRole: string): Record<string, TabConfig> => {
    const normalizedRole = userRole.toLowerCase();
    
    // Tabs comunes para todos los roles
    const commonTabs: Record<string, TabConfig> = {
      profile: {
        name: "Perfil",
        icon: "person-outline" as IconName
      }
    };

    switch (normalizedRole) {
      case 'admin':
        return {
          ...commonTabs,
          'admin-dashboard': {
            name: "Dashboard",
            icon: "grid-outline" as IconName
          },
          appointments: {
            name: "Citas",
            icon: "calendar-outline" as IconName
          },
          shop: {
            name: "Tienda",
            icon: "cart-outline" as IconName
          }
        };
      case 'employee':
        return {
          ...commonTabs,
          appointments: {
            name: "Gestión Citas",
            icon: "calendar-sharp" as IconName
          }
        };
      case 'client':
        return {
          ...commonTabs,
          appointments: {
            name: "Mis Citas",
            icon: "calendar-outline" as IconName
          },
          shop: {
            name: "Tienda",
            icon: "cart-outline" as IconName
          },
          Citas: {
            name: "Agendar",
            icon: "add-circle-outline" as IconName
          }
        };
      default:
        return commonTabs;
    }
  };

  const tabs = getTabsForRole(role);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: '#e5e5e5',
        }
      }}>
      {Object.entries(tabs).map(([route, config]) => (
        <Tabs.Screen
          key={route}
          name={route}
          options={{
            title: config.name,
            tabBarIcon: ({ color }) => <TabBarIcon name={config.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
