import { Stack } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';
import { TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AdminLayout() {
  const router = useRouter();
  
  return (
    <ProtectedRoute>
      <Stack 
        screenOptions={{
          headerStyle: StyleSheet.create({
            header: {
              backgroundColor: '#6B46C1',
              ...Platform.select({
                android: {
                  elevation: 4,
                },
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                },
              }),
            },
          }).header,
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
          animation: 'slide_from_right',
          headerLeft: ({ tintColor }) => (
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={tintColor} />
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            title: 'Admin Dashboard',
          }}
        />
        <Stack.Screen 
          name="Products" 
          options={{
            title: 'Productos',
          }}
        />
        <Stack.Screen 
          name="Services" 
          options={{
            title: 'Servicios',
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}