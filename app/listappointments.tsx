import { useState, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, 
  TouchableOpacity, RefreshControl, Modal, Pressable, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "expo-router";
import API_URL from "../config/api";

const ListAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
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
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📅 Datos completos de las citas:", JSON.stringify(response.data, null, 2));

      // Filtrar las citas donde el id_user del cliente coincide con el usuario actual
      const filteredAppointments = response.data.filter((appointment: any) => {
        const clientUserId = appointment.client?.id_user;
        console.log("🔍 Analizando cita:", {
          appointmentId: appointment.id,
          clientUserId,
          currentUserId,
          matches: Number(clientUserId) === Number(currentUserId)
        });
        return Number(clientUserId) === Number(currentUserId);
      });

      console.log("📊 Citas filtradas para el usuario:", filteredAppointments.length);

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
          date: new Date(appointment.date).toISOString(),
          time: appointment.time,
          employeeName: employeeName,
          serviceName: appointment.service?.name || "Servicio no especificado",
          status: appointment.status || 'pending',
          employeeId: appointment.employee?.id,
          serviceId: appointment.service?.id
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
    employeeId: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    serviceName: string;
    serviceId: number;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Convertir el formato 24h a 12h
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity 
      style={styles.appointmentCard}
      onPress={() => handleAppointmentPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="calendar-outline" size={24} color="#6B46C1" />
      <View style={styles.appointmentInfo}>
        <Text style={styles.dateText}>
          {formatDate(item.date)}
        </Text>
        <Text style={styles.timeText}>
          {formatTime(item.time)}
        </Text>
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mis Citas Agendadas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" />
      ) : (
        <>
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

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal}
            statusBarTranslucent
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={handleCloseModal}
            >
              <Pressable 
                style={styles.modalContent}
                onPress={(e) => e.stopPropagation()}
              >
                {selectedAppointment && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Detalles de la Cita</Text>
                      <TouchableOpacity
                        onPress={handleCloseModal}
                        style={styles.closeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close" size={24} color="#4A5568" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                      <View style={styles.modalRow}>
                        <Ionicons name="calendar" size={24} color="#6B46C1" />
                        <Text style={styles.modalLabel}>Fecha y Hora:</Text>
                        <Text style={styles.modalText}>
                          {formatDate(selectedAppointment.date)} - {formatTime(selectedAppointment.time)}
                        </Text>
                      </View>

                      <View style={styles.modalRow}>
                        <Ionicons name="person" size={24} color="#6B46C1" />
                        <Text style={styles.modalLabel}>Profesional:</Text>
                        <Text style={styles.modalText}>{selectedAppointment.employeeName}</Text>
                      </View>

                      <View style={styles.modalRow}>
                        <Ionicons name="medical" size={24} color="#6B46C1" />
                        <Text style={styles.modalLabel}>Servicio:</Text>
                        <Text style={styles.modalText}>{selectedAppointment.serviceName}</Text>
                      </View>

                      <View style={styles.modalRow}>
                        <Ionicons name="information-circle" size={24} color="#6B46C1" />
                        <Text style={styles.modalLabel}>Estado:</Text>
                        <Text style={[
                          styles.modalStatusText,
                          selectedAppointment.status === 'pending' ? styles.pendingStatus :
                          selectedAppointment.status === 'confirmed' ? styles.confirmedStatus :
                          styles.cancelledStatus
                        ]}>
                          {selectedAppointment.status === 'pending' ? 'Pendiente' :
                           selectedAppointment.status === 'confirmed' ? 'Confirmada' :
                           'Cancelada'}
                        </Text>
                      </View>
                    </View>

                    {selectedAppointment.status !== 'cancelled' && (
                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          style={styles.modalEditButton}
                          onPress={() => {
                            handleCloseModal();
                            editAppointment(selectedAppointment);
                          }}
                        >
                          <Ionicons name="create" size={20} color="#FFFFFF" />
                          <Text style={styles.modalButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.modalCancelButton}
                          onPress={() => {
                            handleCloseModal();
                            cancelAppointment(selectedAppointment.id);
                          }}
                        >
                          <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                          <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 20,
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.1)",
  },
  appointmentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  dateText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 15,
    color: "#4A5568",
    marginBottom: 6,
    fontWeight: "500",
  },
  employeeText: {
    fontSize: 15,
    color: "#4A5568",
    marginBottom: 2,
    fontWeight: "500",
  },
  serviceText: {
    fontSize: 15,
    color: "#4A5568",
    marginBottom: 6,
    fontWeight: "500",
  },
  cancelButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: "rgba(229, 62, 62, 0.1)",
    borderRadius: 12,
  },
  editButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: "rgba(49, 130, 206, 0.1)",
    borderRadius: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#718096",
    marginTop: 32,
    lineHeight: 24,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: Platform.OS === 'ios' ? 400 : '95%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginLeft: 10,
    marginRight: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#2D3748',
    flex: 1,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3182CE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  modalCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ListAppointmentsScreen;
