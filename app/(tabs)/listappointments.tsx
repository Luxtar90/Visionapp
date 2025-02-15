import { useState, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, RefreshControl 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "expo-router";
import API_URL from "../../src/constants/config";

const ListAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchUserDataAndAppointments();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserDataAndAppointments().finally(() => setRefreshing(false));
  }, []);

  const fetchUserDataAndAppointments = async () => {
    try {
      const userIdString = await AsyncStorage.getItem("userId");
      const userRoleString = await AsyncStorage.getItem("userRole");
      
      if (!userIdString || !userRoleString) {
        throw new Error("No se encontró información del usuario");
      }
      
      const currentUserId = Number(userIdString);
      setUserId(currentUserId);
      setUserRole(userRoleString);
      
      console.log("👤 ID del usuario actual:", currentUserId);
      console.log("🎭 Rol del usuario:", userRoleString);
      
      await fetchAppointments(currentUserId, userRoleString);
    } catch (error) {
      console.error("❌ Error al obtener datos del usuario:", error);
      Alert.alert("Error", "No se pudo obtener la información del usuario.");
    }
  };

  const fetchAppointments = async (currentUserId: number, role: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      console.log("🔍 Buscando citas para usuario ID:", currentUserId);

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          clientId: currentUserId
        }
      });

      // Log detallado de todas las citas
      console.log("📅 Datos completos de las citas:", JSON.stringify(response.data, null, 2));

      const filteredAppointments = response.data.filter((appointment: any) => {
        // Log detallado de cada cita
        console.log("🔍 Analizando cita:", {
          id: appointment.id,
          completeData: appointment,
          keys: Object.keys(appointment)
        });

        // Intentar encontrar el ID del cliente en la estructura
        const clientId = appointment.client_id || // Intentar con snake_case
                        appointment.clientId ||   // Intentar con camelCase
                        appointment.client?.id || // Intentar con objeto anidado
                        appointment.Client?.id;   // Intentar con mayúscula inicial

        console.log("👤 ID del cliente encontrado:", clientId);

        return Number(clientId) === Number(currentUserId);
      });

      console.log("📊 Citas filtradas:", filteredAppointments.length);

      const formattedAppointments = await Promise.all(filteredAppointments.map(async (appointment: any) => {
        let employeeName = "Sin nombre";
        
        try {
          if (appointment.employee?.id) {
            const employeeResponse = await axios.get(
              `${API_URL}/users/${appointment.employee.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (employeeResponse.data) {
              employeeName = employeeResponse.data.name || "Sin nombre";
            }
          }
        } catch (error) {
          console.error("❌ Error al obtener datos del empleado:", error);
        }

        return {
          id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          employeeName: employeeName,
          serviceName: appointment.service?.name || "Servicio no especificado",
          status: appointment.status || 'pending'
        };
      }));

      console.log("✅ Citas formateadas:", formattedAppointments.length);
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("❌ Error al cargar citas:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      }
      Alert.alert("Error", "No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      const appointment = appointments.find(a => a.id === id);
      if (!appointment) {
        throw new Error("Cita no encontrada");
      }

      await axios.delete(`${API_URL}/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Éxito", "Cita cancelada correctamente.");
      fetchAppointments(userId!, userRole!);
    } catch (error) {
      Alert.alert("Error", "No se pudo cancelar la cita.");
    }
  };

  const editAppointment = (appointment: Appointment) => {
    navigation.navigate({
      pathname: "/(tabs)/Citas",
      params: { appointment: JSON.stringify(appointment) },
    } as never);
  };

  interface Appointment {
    id: number;
    date: string;
    time: string;
    employeeName: string;
    status: string;
    serviceName: string;
  }

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <Ionicons name="calendar-outline" size={24} color="#6B46C1" />
      <View style={styles.appointmentInfo}>
        <Text style={styles.dateText}>{item.date} - {item.time}</Text>
        <Text style={styles.employeeText}>Profesional: {item.employeeName}</Text>
        <Text style={styles.serviceText}>Servicio: {item.serviceName}</Text>
        <Text style={[
          styles.statusText,
          item.status === 'pending' ? styles.pendingStatus :
          item.status === 'confirmed' ? styles.confirmedStatus :
          styles.cancelledStatus
        ]}>
          {item.status === 'pending' ? 'Pendiente' :
           item.status === 'confirmed' ? 'Confirmada' :
           'Cancelada'}
        </Text>
      </View>
      {item.status !== 'cancelled' && (
        <>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => cancelAppointment(item.id)}
          >
            <Ionicons name="close-circle" size={24} color="#E53E3E" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => editAppointment(item)}
          >
            <Ionicons name="create-outline" size={24} color="#3182CE" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mis Citas Agendadas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAppointment}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6B46C1"]}
              tintColor="#6B46C1"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tienes citas agendadas.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5FF",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 16,
    textAlign: "center",
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentInfo: {
    marginLeft: 15,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  employeeText: {
    fontSize: 14,
    color: "#4A5568",
  },
  serviceText: {
    fontSize: 14,
    color: "#4A5568",
    marginTop: 2,
  },
  cancelButton: {
    marginLeft: 10,
  },
  editButton: {
    marginLeft: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#718096",
    marginTop: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pendingStatus: {
    backgroundColor: "#FEF9C3",
    color: "#854D0E",
  },
  confirmedStatus: {
    backgroundColor: "#DEF7EC",
    color: "#03543F",
  },
  cancelledStatus: {
    backgroundColor: "#FEE2E2",
    color: "#9B1C1C",
  },
});

export default ListAppointmentsScreen;
