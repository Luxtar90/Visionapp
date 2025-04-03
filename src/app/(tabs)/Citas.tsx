import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Modal, Platform 
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import api, { handleApiError, BASE_URL } from '../../utils/api';
import { useState, useEffect, SetStateAction } from "react";
import { useAlert } from '../../hooks/useAlert';
import { AxiosError } from 'axios';

const CitasScreen = () => {
  const { showAlert, showSuccess, showError } = useAlert();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [reservedHours, setReservedHours] = useState<string[]>([]);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [loadingHours, setLoadingHours] = useState<boolean>(false);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [savingReservation, setSavingReservation] = useState<boolean>(false);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [employeesData, setEmployeesData] = useState<{ [key: string]: any }>({});
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [showCanceledAppointments, setShowCanceledAppointments] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      console.log("🔍 Iniciando búsqueda de empleados...");
      const response = await api.get('/employees');
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
        showError('Formato de datos inesperado al cargar empleados');
      }
    } catch (error) {
      console.error("❌ Error al cargar empleados:", error);
      showError('No se pudieron cargar los empleados');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const [clientId, setClientId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userIdString = await AsyncStorage.getItem("userId");
        const clientIdString = await AsyncStorage.getItem("clientId");
        
        if (!userIdString) {
          console.error("❌ No se encontró el ID del usuario logueado");
          showError('No se encontró el ID del usuario');
          return;
        }

        // Usamos el mismo ID para usuario y cliente
        const id = Number(userIdString);
        setClientId(id);
        console.log("✅ ID del usuario/cliente logueado:", id);

        // Si no existe el clientId en AsyncStorage, lo guardamos
        if (!clientIdString) {
          await AsyncStorage.setItem("clientId", id.toString());
          console.log("✅ ID de cliente guardado en AsyncStorage");
        }
      } catch (error) {
        console.error("❌ Error al obtener el ID del usuario/cliente:", error);
        showError('Error al obtener información del usuario');
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchUserAppointments();
    }
  }, [clientId]);

  useEffect(() => {
    if (modalVisible) {
      fetchUserAppointments();
    }
  }, [modalVisible]);

  const fetchUserAppointments = async () => {
    if (!clientId) return;
    
    setLoadingAppointments(true);
    try {
      console.log("🔍 Obteniendo citas del usuario...");
      const response = await api.get('/appointments');

      if (!Array.isArray(response.data)) {
        console.error("❌ La respuesta no es un array:", response.data);
        return;
      }

      // Filtrar las citas del usuario actual
      const filteredAppointments = response.data.filter((appointment: any) => {
        const clientUserId = appointment.client?.id_user;
        return Number(clientUserId) === Number(clientId);
      });

      // Ordenar las citas por fecha y hora
      const sortedAppointments = filteredAppointments.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      setUserAppointments(sortedAppointments);

      // Obtener datos de empleados para todas las citas
      const employeeIds = new Set(sortedAppointments.map(app => app.employee?.id).filter(Boolean));
      console.log("🔍 IDs de empleados a buscar:", Array.from(employeeIds));

      const employeePromises = Array.from(employeeIds).map(id => fetchEmployeeData(id));
      await Promise.all(employeePromises);

    } catch (error) {
      console.error("❌ Error al obtener las citas:", error);
      handleApiError(error as AxiosError);
      showError('No se pudieron cargar tus citas');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchAvailableHours = async (date: string, employeeId: number) => {
    setLoadingHours(true);
    try {
      console.log(`🔍 Buscando disponibilidad para empleado ${employeeId} en fecha ${date}...`);
      const response = await api.get('/availability', {
        params: { date, employeeId }
      });
      
      console.log("📅 Respuesta de disponibilidad:", JSON.stringify(response.data, null, 2));

      if (Array.isArray(response.data)) {
        console.log("✅ Horas disponibles:", response.data);
        setAvailableHours(response.data);
        
        // Filtramos las citas del usuario para esta fecha y empleado
        const reservedForDate = userAppointments
          .filter(app => 
            app.date === date && 
            app.employeeId === employeeId
          )
          .map(app => app.time);
        
        setReservedHours(reservedForDate);
      } 
      else if (response.data?.availableSlots && response.data?.reservedSlots) {
        console.log("✅ Horas disponibles:", response.data.availableSlots);
        console.log("❌ Horas reservadas:", response.data.reservedSlots);
        setAvailableHours(response.data.availableSlots);
        setReservedHours(response.data.reservedSlots);
      }
      else {
        console.warn("⚠️ Formato de datos inesperado:", response.data);
        setAvailableHours([]);
        setReservedHours([]);
        showError('Formato de datos inesperado al cargar horarios');
      }
    } catch (error) {
      console.error("❌ Error al cargar horarios:", error);
      handleApiError(error as AxiosError);
      showError('No se pudieron cargar los horarios disponibles');
      setAvailableHours([]);
      setReservedHours([]);
    } finally {
      setLoadingHours(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedHour || !selectedEmployee) {
      console.warn("⚠️ Faltan datos para la reserva");
      showError('Seleccione fecha, hora y empleado');
      return;
    }

    setSavingReservation(true);
    try {
      const reservationData = {
        employeeId: selectedEmployee,
        clientId: clientId,
        date: selectedDate,
        time: selectedHour,
        status: "pending",
        serviceId: 1
      };

      console.log("📝 Datos de la reserva:", reservationData);

      const response = await api.post('/appointments', reservationData);

      console.log("✅ Respuesta del servidor:", response.data);
      
      if (response.status === 201 || response.status === 200) {
        showSuccess('Tu cita ha sido agendada correctamente');
        
        setReservedHours(prev => [...prev, selectedHour]);
        setAvailableHours(prev => prev.filter(hour => hour !== selectedHour));
        setSelectedHour(null);
        
        fetchAvailableHours(selectedDate, selectedEmployee);
      }
      
    } catch (error) {
      console.error("❌ Error al guardar la reserva:", error);
      handleApiError(error as AxiosError);
      showError('No se pudo completar la reserva. Por favor, intenta de nuevo.');
    } finally {
      setSavingReservation(false);
    }
  };

  const fetchEmployeeData = async (employeeId: number) => {
    try {
      console.log(`🔍 Obteniendo datos del empleado ${employeeId}...`);
      const response = await api.get(`/employees/${employeeId}`);

      if (response.data) {
        const employeeData = {
          ...response.data,
          name: response.data.user?.name || response.data.name || "Sin nombre"
        };
        setEmployeesData(prev => ({
          ...prev,
          [employeeId]: employeeData
        }));
        return employeeData;
      }
    } catch (error) {
      console.error(`❌ Error al obtener datos del empleado ${employeeId}:`, error);
      handleApiError(error as AxiosError);
    }
    return null;
  };

  const getEmployeeName = (employeeId: number) => {
    if (employeesData[employeeId]) {
      return employeesData[employeeId].name;
    }
    // Si no tenemos los datos del empleado, los obtenemos
    fetchEmployeeData(employeeId);
    return "Cargando...";
  };

  const handleAppointmentPress = (appointment: any) => {
    // Aquí puedes implementar la lógica cuando se presiona una cita
    console.log('Cita seleccionada:', appointment);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      console.log("🗑️ Cancelando cita:", appointmentId);
      const response = await api.put(
        `/appointments/${appointmentId}`,
        { status: "cancelled" }
      );

      if (response.status === 200) {
        showSuccess('La cita ha sido cancelada');
        fetchUserAppointments(); // Recargar las citas
      }
    } catch (error) {
      console.error("❌ Error al cancelar la cita:", error);
      handleApiError(error as AxiosError);
      showError('No se pudo cancelar la cita');
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSelectedDate(appointment.date);
    setSelectedEmployee(appointment.employee?.id);
    setSelectedHour(appointment.time);
    setIsEditModalVisible(true);
  };

  const handleEmployeeSelect = (employeeId: number) => {
    console.log("🔄 Cambiando empleado seleccionado:", {
      empleadoAnterior: selectedEmployee,
      nuevoEmpleado: employeeId
    });
    
    setSelectedEmployee(employeeId);
    setSelectedHour(null);
    
    if (selectedDate) {
      console.log("📅 Buscando disponibilidad para nuevo empleado:", {
        empleadoId: employeeId,
        fecha: selectedDate
      });
      fetchAvailableHours(selectedDate, employeeId);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment || !selectedDate || !selectedHour || !selectedEmployee) {
      showError('Seleccione fecha, hora y empleado');
      return;
    }

    setSavingReservation(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró el token");

      // Estructura completa que coincide con la respuesta del servidor
      const updateData = {
        id: selectedAppointment.id,
        client: {
          id_user: selectedAppointment.client?.id_user,
          createdAt: selectedAppointment.client?.createdAt
        },
        clientId: selectedAppointment.client?.id_user,
        employee: {
          id: Number(selectedEmployee)
        },
        employeeId: Number(selectedEmployee),
        service: selectedAppointment.service,
        serviceId: selectedAppointment.service?.id,
        date: selectedDate,
        time: selectedHour,
        status: "pending",
        shiftAssigned: false
      };

      console.log("✏️ Datos de actualización de cita:", {
        citaId: selectedAppointment.id,
        datosAnteriores: {
          empleadoId: selectedAppointment.employee?.id,
          fecha: selectedAppointment.date,
          hora: selectedAppointment.time
        },
        nuevosData: updateData
      });

      // Verificar disponibilidad primero
      const availabilityCheck = await api.get('/availability', {
        params: { 
          date: selectedDate, 
          employeeId: selectedEmployee 
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!availabilityCheck.data.includes(selectedHour)) {
        throw new Error("El horario seleccionado ya no está disponible");
      }

      // Realizar la actualización usando PUT con la estructura completa
      const response = await api.put(
        `/appointments/${selectedAppointment.id}`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Respuesta del servidor al actualizar:", {
        status: response.status,
        data: response.data
      });

      if (response.status === 200) {
        // Verificar el estado final de la cita
        const verificationResponse = await api.get(
          `/appointments/${selectedAppointment.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedEmployeeId = verificationResponse.data.employee?.id;
        const employeeUpdatedSuccessfully = Number(updatedEmployeeId) === Number(selectedEmployee);

        console.log("🔍 Verificación final de la cita:", {
          appointmentId: selectedAppointment.id,
          empleadoActual: updatedEmployeeId,
          empleadoEsperado: selectedEmployee,
          actualizado: employeeUpdatedSuccessfully
        });

        if (employeeUpdatedSuccessfully) {
          showSuccess('La cita ha sido actualizada correctamente');
        } else {
          console.error("❌ La actualización del empleado no se reflejó correctamente:", {
            originalEmployee: selectedAppointment.employeeId,
            updatedEmployee: selectedEmployee,
            verificationResponse: verificationResponse.data
          });
          
          showError('La cita se actualizó pero hubo un problema con el cambio de empleado');
        }

        setIsEditModalVisible(false);
        await fetchUserAppointments();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar la cita';
      showError(errorMessage);
    } finally {
      setSavingReservation(false);
    }
  };

  const filterAppointments = (appointments: any[]) => {
    const now = new Date();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
      const isNotCanceled = showCanceledAppointments || appointment.status !== "cancelled";
      const isUpcoming = appointmentDate >= now;
      return isNotCanceled && isUpcoming;
    });
  };

  const sortAppointments = (appointments: any[]) => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const processAppointments = (appointments: any[]) => {
    return sortAppointments(filterAppointments(appointments));
  };

  const renderAppointment = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.appointmentCard}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dayText}>
            {new Date(item.date).getDate()}
          </Text>
          <Text style={styles.monthText}>
            {new Date(item.date).toLocaleDateString('es-ES', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={styles.timeText}>
            <Ionicons name="time-outline" size={16} color="#4A5568" /> {item.time.substring(0, 5)}
          </Text>
          <Text style={styles.serviceText}>
            <Ionicons name="cut-outline" size={16} color="#4A5568" /> {item.service?.name || 'Servicio no especificado'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estilista:</Text>
          <Text style={styles.detailValue}>
            <Ionicons name="person-outline" size={16} color="#4A5568" /> {
              getEmployeeName(item.employee?.id)
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Precio:</Text>
          <Text style={styles.detailValue}>
            <Ionicons name="cash-outline" size={16} color="#4A5568" /> $ {
              item.service?.price || '0.00'
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duración:</Text>
          <Text style={styles.detailValue}>
            <Ionicons name="time-outline" size={16} color="#4A5568" /> {
              item.service?.duration || '0'
            } min
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.appointmentActions}>
        <View style={styles.statusContainer}>
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
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditAppointment(item)}
            >
              <Ionicons name="create-outline" size={20} color="#6B46C1" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelAppointment(item.id)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#E53E3E" />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAppointmentModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mis Citas</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[
                  styles.filterButton,
                  !showCanceledAppointments && styles.filterButtonActive
                ]}
                onPress={() => setShowCanceledAppointments(!showCanceledAppointments)}
              >
                <Ionicons 
                  name={showCanceledAppointments ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={showCanceledAppointments ? "#718096" : "#6B46C1"} 
                />
                <Text style={[
                  styles.filterButtonText,
                  !showCanceledAppointments && styles.filterButtonTextActive
                ]}>
                  {showCanceledAppointments ? "Ocultar canceladas" : "Mostrar canceladas"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-outline" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>
          </View>

          {loadingAppointments ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#6B46C1" />
              <Text style={styles.emptyStateText}>Cargando citas...</Text>
            </View>
          ) : userAppointments.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={64} color="#718096" />
              <Text style={styles.emptyStateText}>
                {showCanceledAppointments 
                  ? "No tienes citas canceladas"
                  : "No tienes citas programadas"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={processAppointments([...userAppointments])}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAppointment}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.appointmentsList}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isEditModalVisible}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Cita</Text>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#4A5568" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fecha</Text>
              <Calendar
                style={styles.calendar}
                onDayPress={(day: { dateString: SetStateAction<string>; }) => setSelectedDate(day.dateString)}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: '#6B46C1' }
                }}
                theme={{
                  todayTextColor: '#6B46C1',
                  selectedDayBackgroundColor: '#6B46C1',
                  arrowColor: '#6B46C1',
                }}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estilista</Text>
              <View style={styles.employeesContainer}>
                {employees.map((employee) => (
                  <TouchableOpacity
                    key={employee.id}
                    style={[
                      styles.employeeCard,
                      selectedEmployee === employee.id && styles.selectedEmployeeCard
                    ]}
                    onPress={() => handleEmployeeSelect(employee.id)}
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
                    >
                      {employee.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedDate && selectedEmployee && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Horario</Text>
                {loadingHours ? (
                  <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
                ) : (
                  <View style={styles.hoursContainer}>
                    {availableHours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.hourButton,
                          selectedHour === hour && styles.selectedHour
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text 
                          style={[
                            styles.hourText,
                            selectedHour === hour && styles.selectedHourText
                          ]}
                        >
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedDate || !selectedHour || !selectedEmployee) && styles.disabledButton
            ]}
            onPress={handleUpdateAppointment}
            disabled={!selectedDate || !selectedHour || !selectedEmployee || savingReservation}
          >
            {savingReservation ? (
              <ActivityIndicator color="#FFFFFF" style={styles.buttonIcon} />
            ) : (
              <Ionicons name="save-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            )}
            <Text style={styles.confirmText}>
              {savingReservation ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    if (selectedDate && selectedEmployee) {
      fetchAvailableHours(selectedDate, selectedEmployee);
    } else {
      setAvailableHours([]);
      setReservedHours([]);
    }
  }, [selectedDate, selectedEmployee]);

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#F7FAFC' 
    },
    header: {
      backgroundColor: '#6B46C1',
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    subtitle: {
      fontSize: 18,
      color: '#E9D8FD',
      letterSpacing: 0.5,
      opacity: 0.9,
    },
    scrollView: { 
      flex: 1,
    },
    content: { 
      padding: 20,
      paddingTop: 10,
    },
    section: { 
      marginBottom: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 16,
      elevation: 4,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: 16,
      letterSpacing: 0.5,
    },
    calendarContainer: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    calendar: {
      borderRadius: 16,
    },
    employeesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 4,
    },
    employeeCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      width: '48%',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    selectedEmployeeCard: {
      backgroundColor: '#6B46C1',
      borderColor: '#553C9A',
    },
    employeeIcon: {
      marginBottom: 12,
      backgroundColor: '#F3E8FF',
      borderRadius: 30,
      padding: 8,
    },
    employeeText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2D3748',
      textAlign: 'center',
    },
    selectedEmployeeText: {
      color: '#FFFFFF',
    },
    appointmentsButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      margin: 20,
      marginTop: -20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    appointmentsButtonText: {
      color: '#6B46C1',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    hoursContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
      paddingHorizontal: 4,
    },
    hourButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      width: '31%',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    reservedHour: {
      backgroundColor: '#EDF2F7',
      borderColor: '#CBD5E0',
    },
    selectedHour: {
      backgroundColor: '#6B46C1',
      borderColor: '#553C9A',
    },
    hourText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#2D3748',
    },
    reservedHourText: {
      color: '#A0AEC0',
    },
    selectedHourText: {
      color: '#FFFFFF',
    },
    reservedBadge: {
      marginTop: 6,
      padding: 4,
      borderRadius: 6,
      backgroundColor: '#CBD5E0',
    },
    reservedBadgeText: {
      fontSize: 10,
      fontWeight: '500',
      color: '#4A5568',
    },
    footer: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    confirmButton: {
      backgroundColor: '#6B46C1',
      borderRadius: 16,
      padding: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    disabledButton: {
      backgroundColor: '#CBD5E0',
    },
    buttonIcon: {
      marginRight: 10,
    },
    confirmText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    loader: {
      marginVertical: 24,
    },
    noHoursText: {
      textAlign: 'center',
      color: '#718096',
      fontSize: 16,
      marginVertical: 24,
    },
    appointmentCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    appointmentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateContainer: {
      backgroundColor: '#6B46C1',
      borderRadius: 8,
      padding: 8,
      alignItems: 'center',
      minWidth: 60,
    },
    dayText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    monthText: {
      color: 'white',
      fontSize: 12,
      textTransform: 'uppercase',
    },
    appointmentInfo: {
      marginLeft: 12,
      flex: 1,
    },
    timeText: {
      fontSize: 16,
      color: '#1A202C',
      marginBottom: 4,
      fontWeight: '500',
    },
    serviceText: {
      fontSize: 14,
      color: '#4A5568',
      marginBottom: 4,
    },
    divider: {
      height: 1,
      backgroundColor: '#E2E8F0',
      marginVertical: 12,
    },
    detailsContainer: {
      gap: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 14,
      color: '#718096',
      fontWeight: '500',
    },
    detailValue: {
      fontSize: 14,
      color: '#4A5568',
      fontWeight: '500',
    },
    statusContainer: {
      alignItems: 'flex-end',
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    pendingStatus: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    confirmedStatus: {
      backgroundColor: '#C6F6D5',
      color: '#22543D',
    },
    cancelledStatus: {
      backgroundColor: '#FED7D7',
      color: '#822727',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    },
    modalActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2D3748',
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#F7FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    filterButtonActive: {
      backgroundColor: '#F3EEFF',
      borderColor: '#6B46C1',
    },
    filterButtonText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#718096',
    },
    filterButtonTextActive: {
      color: '#6B46C1',
      fontWeight: '500',
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#F7FAFC',
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyStateText: {
      marginTop: 16,
      fontSize: 16,
      color: '#718096',
      textAlign: 'center',
    },
    appointmentsList: {
      paddingVertical: 10,
    },
    appointmentActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionButtonText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '500',
    },
    editButton: {
      borderColor: '#6B46C1',
      backgroundColor: '#F3EEFF',
    },
    cancelButton: {
      borderColor: '#E53E3E',
      backgroundColor: '#FFF5F5',
    },
    cancelButtonText: {
      color: '#E53E3E',
    },
    appointmentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 10,
    },
  });

  const handleOpenAppointments = () => {
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservas</Text>
        <Text style={styles.subtitle}>Agenda tu cita en el estudio</Text>
      </View>

      <TouchableOpacity 
        style={styles.appointmentsButton}
        onPress={handleOpenAppointments}
      >
        <Ionicons name="calendar" size={24} color="#6B46C1" />
        <Text style={styles.appointmentsButtonText}>Ver Mis Citas</Text>
      </TouchableOpacity>

      {renderAppointmentModal()}

      {renderEditModal()}

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
                      onPress={() => handleEmployeeSelect(employee.id)}
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

export default CitasScreen;