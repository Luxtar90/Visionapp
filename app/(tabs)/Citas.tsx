import { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, SafeAreaView, ScrollView 
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../src/constants/config";

const CitasScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [reservedHours, setReservedHours] = useState<string[]>([]);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [loadingHours, setLoadingHours] = useState<boolean>(false);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [savingReservation, setSavingReservation] = useState<boolean>(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      console.log("🔍 Iniciando búsqueda de empleados...");
      const response = await axios.get(`${API_URL}/employees`);
      console.log("✅ Empleados recibidos:", JSON.stringify(response.data, null, 2));
      
      if (response.data && Array.isArray(response.data)) {
        const formattedEmployees = response.data.map(emp => ({
          id: emp.id,
          name: emp.user?.name || emp.name || "Sin nombre"
        }));
        console.log("👥 Empleados formateados:", formattedEmployees);
        setEmployees(formattedEmployees);
      } else {
        console.warn("⚠️ Formato de datos inesperado:", response.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar empleados:", error);
      Alert.alert("Error", "No se pudieron cargar los empleados.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const [clientId, setClientId] = useState<number | null>(null);

useEffect(() => {
  const fetchUserId = async () => {
    try {
      const userIdString = await AsyncStorage.getItem("userId");
      if (!userIdString) {
        console.error("❌ No se encontró el ID del usuario logueado");
        Alert.alert("Error", "No se encontró el ID del usuario logueado.");
        return;
      }
      setClientId(Number(userIdString)); // Guarda el ID en el estado
      console.log("✅ ID del usuario logueado:", Number(userIdString));
    } catch (error) {
      console.error("❌ Error al obtener el ID del usuario logueado:", error);
    }
  };

  fetchUserId();
}, []);

  useEffect(() => {
    if (selectedDate && selectedEmployee) {
      fetchAvailableHours(selectedDate, selectedEmployee);
    } else {
      setAvailableHours([]);
      setReservedHours([]);
    }
  }, [selectedDate, selectedEmployee]);

  const fetchAvailableHours = async (date: string, employeeId: number) => {
    setLoadingHours(true);
    try {
      console.log(`🔍 Buscando disponibilidad para empleado ${employeeId} en fecha ${date}...`);
      const response = await axios.get(`${API_URL}/availability`, {
        params: { date, employeeId }
      });
      
      console.log("📅 Respuesta de disponibilidad:", JSON.stringify(response.data, null, 2));

      // Ajuste para manejar la respuesta del backend
      if (Array.isArray(response.data)) {
        // Si es un array, son todas las horas disponibles
        console.log("✅ Horas disponibles:", response.data);
        setAvailableHours(response.data);
        setReservedHours([]); // Limpiar horas reservadas
      } 
      else if (response.data?.availableSlots && response.data?.reservedSlots) {
        // Si es un objeto con ambos arrays
        console.log("✅ Horas disponibles:", response.data.availableSlots);
        console.log("❌ Horas reservadas:", response.data.reservedSlots);
        setAvailableHours(response.data.availableSlots);
        setReservedHours(response.data.reservedSlots);
      }
      else {
        console.warn("⚠️ Formato de datos inesperado:", response.data);
        setAvailableHours([]);
        setReservedHours([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar horarios:", error);
      Alert.alert("Error", "No se pudieron cargar los horarios disponibles.");
      setAvailableHours([]);
      setReservedHours([]);
    } finally {
      setLoadingHours(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedHour || !selectedEmployee) {
      console.warn("⚠️ Faltan datos para la reserva");
      Alert.alert("Error", "Seleccione fecha, hora y empleado.");
      return;
    }

    setSavingReservation(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const userIdString = await AsyncStorage.getItem("userId");
      
      if (!token || !userIdString) {
        throw new Error("No se encontró token o userId");
      }

      const userId = Number(userIdString);
      
      // Asegurarnos que el clientId sea igual al userId
      const reservationData = {
        employeeId: selectedEmployee,
        clientId: Number(userId), // Asegurarnos que sea número
        date: selectedDate,
        time: selectedHour,
        status: "pending",
        serviceId: 1
      };

      console.log("📝 Datos de la reserva:", reservationData);

      const response = await axios.post(`${API_URL}/appointments`, reservationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Respuesta del servidor:", response.data);
      
      if (response.status === 201 || response.status === 200) {
        Alert.alert("Éxito", "Tu cita ha sido agendada correctamente.");
        
        // Actualizar las listas de horas
        setReservedHours(prev => [...prev, selectedHour]);
        setAvailableHours(prev => prev.filter(hour => hour !== selectedHour));
        setSelectedHour(null);
        
        // Recargar los horarios disponibles
        fetchAvailableHours(selectedDate, selectedEmployee);
      }
      
    } catch (error: any) {
      console.error("❌ Error al guardar la reserva:", error);
      console.error("❌ Detalles del error:", error.response?.data);
      
      let errorMessage = "No se pudo completar la reserva. Por favor, intenta de nuevo.";
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 404) {
        errorMessage = "No se encontró tu información de cliente. Por favor, contacta al soporte.";
      } else if (error.response?.status === 403) {
        errorMessage = "No tienes permisos para realizar esta acción.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setSavingReservation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservas</Text>
        <Text style={styles.subtitle}>Agenda tu cita en el estudio</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
            <View style={styles.calendarContainer}>
              <Calendar
                style={styles.calendar}
                theme={{
                  todayTextColor: '#6B46C1',
                  selectedDayBackgroundColor: '#6B46C1',
                  arrowColor: '#6B46C1',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: '#6B46C1' } }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecciona un profesional</Text>
            {loadingEmployees ? (
              <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.employeesContainer}>
                  {employees.map((employee) => (
                    <TouchableOpacity
                      key={employee.id}
                      style={[
                        styles.employeeCard,
                        selectedEmployee === employee.id && styles.selectedEmployeeCard
                      ]}
                      onPress={() => setSelectedEmployee(employee.id)}
                    >
                      <View style={styles.employeeIcon}>
                        <Ionicons 
                          name="person-circle-outline" 
                          size={40} 
                          color={selectedEmployee === employee.id ? "#FFFFFF" : "#6B46C1"} 
                        />
                      </View>
                      <Text 
                        style={[
                          styles.employeeText,
                          selectedEmployee === employee.id && styles.selectedEmployeeText
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {employee.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horarios disponibles</Text>
            {loadingHours ? (
              <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
            ) : availableHours.length === 0 ? (
              <Text style={styles.noHoursText}>No hay horarios disponibles</Text>
            ) : (
              <View style={styles.hoursContainer}>
                {availableHours.map((hour) => {
                  const isReserved = reservedHours.includes(hour);
                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.hourButton,
                        isReserved && styles.reservedHour,
                        selectedHour === hour && styles.selectedHour
                      ]}
                      onPress={() => !isReserved && setSelectedHour(hour)}
                      disabled={isReserved}
                    >
                      <Text 
                        style={[
                          styles.hourText,
                          isReserved && styles.reservedHourText,
                          selectedHour === hour && styles.selectedHourText
                        ]}
                      >
                        {hour}
                      </Text>
                      {isReserved && (
                        <View style={styles.reservedBadge}>
                          <Text style={styles.reservedBadgeText}>Ocupado</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedHour || !selectedEmployee) && styles.disabledButton
          ]}
          onPress={handleConfirmReservation}
          disabled={!selectedDate || !selectedHour || !selectedEmployee || savingReservation}
        >
          {savingReservation ? (
            <ActivityIndicator color="#FFFFFF" style={styles.buttonIcon} />
          ) : (
            <Ionicons name="calendar-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
          )}
          <Text style={styles.confirmText}>
            {savingReservation ? 'Guardando...' : 'Confirmar Reserva'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },
  header: {
    backgroundColor: '#6B46C1',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E9D8FD',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 12,
  },
  employeesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 120,
    minHeight: 100,  // Asegurar altura mínima
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
  },
  selectedEmployeeCard: {
    backgroundColor: '#6B46C1',
  },
  employeeIcon: {
    marginBottom: 8,
  },
  employeeText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  selectedEmployeeText: {
    color: '#FFFFFF',
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 10,
  },
  hourButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedHour: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  reservedHour: {
    backgroundColor: '#FED7D7',
    borderColor: '#FEB2B2',
    opacity: 0.8,
  },
  hourText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  selectedHourText: {
    color: '#FFFFFF',
  },
  reservedHourText: {
    color: '#E53E3E',
  },
  noHoursText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginVertical: 20,
  },
  reservedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E53E3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reservedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  confirmButton: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});

export default CitasScreen;