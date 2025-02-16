import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";

// URL de la API
const API_URL = 'http://192.168.100.129:3000';

export default function EditProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();

  const [user, setUser] = useState({
    name: "",
    email: "",
    telefono: "",
    role: { id: 0, nombre: "" }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(" Intentando obtener datos del usuario:", id);
        console.log(" Token:", token);
        console.log(" URL:", `${API_URL}/users/${id}`);
        
        if (!token) {
          console.error(" No hay token de autenticación");
          Alert.alert('Error', 'No hay sesión activa. Por favor, inicia sesión nuevamente.');
          router.replace("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/users/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(" Respuesta del servidor:", response.data);
        const userData = response.data;
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          telefono: userData.telefono || "",
          role: userData.role || { id: 2, nombre: "client" }
        });
      } catch (error: any) {
        console.error(' Error fetching user data:', error);
        console.error(' Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        if (!error.response) {
          Alert.alert(
            'Error de conexión', 
            'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.'
          );
        } else {
          Alert.alert(
            'Error', 
            'No se pudo cargar la información del usuario.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    } else {
      console.error(' No se proporcionó ID de usuario');
      Alert.alert('Error', 'No se pudo identificar el usuario a editar');
      router.back();
    }
  }, [id]);

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa. Por favor, inicia sesión nuevamente.');
        router.replace("/login");
        return;
      }

      const updateData = {
        name: user.name,
        email: user.email,
        telefono: user.telefono
      };
      
      await axios.put(`${API_URL}/users/${id}`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.back();
    } catch (error: any) {
      console.error(' Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={user.name}
            onChangeText={(text) => setUser({ ...user, name: text })}
            placeholder="Nombre"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            placeholder="Email"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={user.telefono}
            onChangeText={(text) => setUser({ ...user, telefono: text })}
            placeholder="Teléfono"
            placeholderTextColor="#A0AEC0"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdateProfile}
        >
          <Text style={styles.updateButtonText}>Actualizar Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6B46C1"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#6B46C1"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: "600",
    color: "white"
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  updateButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});
