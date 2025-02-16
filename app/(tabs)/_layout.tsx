import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Animated, View } from "react-native";
import { useCallback, useRef } from "react";

type IconName = "home" | "calendar" | "person";

interface CustomTabBarIconProps {
  name: IconName;
  color: string;
  size: number;
  focused: boolean;
}

export default function TabsLayout() {
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 65;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const CustomTabBarIcon = useCallback(({ name, color, size, focused }: CustomTabBarIconProps) => {
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
          alignItems: 'center',
        }}
      >
        <Ionicons 
          name={focused ? name : `${name}-outline`}
          size={size} 
          color={color}
        />
        {focused && (
          <View 
            style={{ 
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#FFD700',
              marginTop: 4,
            }} 
          />
        )}
      </Animated.View>
    );
  }, [scaleAnim, fadeAnim]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: tabBarHeight,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#718096',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#2D3748',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="shop"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon 
              name="home"
              color={color}
              size={size}
              focused={focused}
            />
          ),
          tabBarAccessibilityLabel: "Inicio",
        }}
      />
      <Tabs.Screen
        name="Citas"
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon 
              name="calendar"
              color={color}
              size={size}
              focused={focused}
            />
          ),
          tabBarAccessibilityLabel: "Gestionar citas",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon 
              name="person"
              color={color}
              size={size}
              focused={focused}
            />
          ),
          tabBarAccessibilityLabel: "Perfil de usuario",
        }}
      />
    </Tabs>
  );
}
