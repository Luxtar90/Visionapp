import { useState, useEffect } from "react";
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import API_URL from "../../src/constants/config";

const ListAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📅 Citas recibidas:", response.data); 

      // Extraer el nombre del empleado directamente
      const formattedAppointments: Appointment[] = response.data.map((appointment: any): Appointment => ({
        ...appointment,
        employeeName: appointment.employee?.user?.name || appointment.employee?.name || "Sin nombre"
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("❌ Error al cargar citas:", error);
      Alert.alert("Error", "No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      await axios.delete(`${API_URL}/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Éxito", "Cita cancelada correctamente.");
      fetchAppointments();
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
  }

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <Ionicons name="calendar-outline" size={24} color="#6B46C1" />
      <View style={styles.appointmentInfo}>
        <Text style={styles.dateText}>{item.date} - {item.time}</Text>
        <Text style={styles.employeeText}>Empleado: {item.employeeName}</Text>
      </View>
      <TouchableOpacity style={styles.cancelButton} onPress={() => cancelAppointment(item.id)}>
        <Ionicons name="close-circle" size={24} color="#E53E3E" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={() => editAppointment(item)}>
        <Ionicons name="create-outline" size={24} color="#3182CE" />
      </TouchableOpacity>
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
          ListEmptyComponent={<Text style={styles.emptyText}>No tienes citas agendadas.</Text>}
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
});

export default ListAppointmentsScreen;
