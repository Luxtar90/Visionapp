import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import apiService from '../../utils/api';
import { useAlert } from '../../hooks/useAlert';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import ProtectedRoute from '../components/ProtectedRoute';

// Configuración del calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

interface User {
  id: number;
  name: string;
  email: string;
  telefono: string | null;
  role?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  creadoEn: string;
  deletedAt: string | null;
}

interface Client {
  id: number;
  id_user: number;
  user?: User;
}

type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  id_client: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  client?: Client;
  service?: {
    name: string;
    price: string;
    duration: number;
  };
}

interface CalendarDay {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

function EmployeeAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  
  const router = useRouter();
  const { showError } = useAlert();
  const navigation = useNavigation();

  // Verificar el rol del usuario al montar el componente
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          showError('Error de autenticación', 'Por favor, inicie sesión nuevamente');
          router.push('/login');
          return;
        }

        // Usar el servicio API centralizado que maneja errores y caché
        const userData = await apiService.get<User>(`/users/${userId}`);

        const userRole = userData.role?.nombre?.toLowerCase();
        if (userRole !== 'employee' && userRole !== 'admin') {
          showError('Acceso denegado', 'Esta página es solo para empleados y administradores');
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error al verificar el acceso:', error);
        showError('Error', 'No se pudo verificar el acceso');
        router.push('/');
      }
    };

    checkAccess();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userIdString = await AsyncStorage.getItem('userId');

      if (!token || !userIdString) {
        console.error('❌ No hay token o userId almacenado');
        showError('Error de autenticación', 'Por favor, inicie sesión nuevamente');
        router.push('/login');
        return;
      }

      const userId = Number(userIdString);

      // Obtenemos las citas usando el servicio API centralizado
      const appointmentsData = await apiService.get<Appointment[]>(`/appointments?employeeId=${userId}`);

      // Para cada cita, obtenemos los datos del usuario cliente
      const appointmentsWithUserInfo = await Promise.all(
        appointmentsData.map(async (appointment: Appointment) => {
          try {
            if (!appointment.client?.id_user) {
              return appointment;
            }

            // Usar el servicio API centralizado que maneja errores y caché
            const userData = await apiService.get<User>(`/users/${appointment.client.id_user}`);
            
            return {
              ...appointment,
              client: {
                ...appointment.client,
                user: userData
              }
            };
          } catch (error) {
            console.error(`Error al obtener datos del usuario ${appointment.client?.id_user}:`, error);
            return appointment;
          }
        })
      );

      // Filtramos y ordenamos las citas
      let filteredAppointments = appointmentsWithUserInfo.filter((appointment: Appointment) => appointment !== null);

      // Ordenamos las citas por fecha y hora
      filteredAppointments.sort((a: Appointment, b: Appointment) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      showError('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, selectedDate, statusFilter]);

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtrar por fecha
    if (selectedDate) {
      const dateStr = selectedDate;
      filtered = filtered.filter(appointment => appointment.date === dateStr);
    }

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    // Ordenar por fecha y hora
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const formatDateTime = (date: string, time: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', options);
    const formattedTime = time.substring(0, 5);
    return `${formattedDate} - ${formattedTime}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Finalizada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      // Usar el servicio API centralizado que maneja errores y caché
      await apiService.put(`/appointments/${appointmentId}`, {
        status: newStatus
      });

      // Consideramos que la operación fue exitosa si no se lanzó ninguna excepción
      // Actualizar la lista de citas localmente
      setAppointments(currentAppointments => 
        currentAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
      showError('Éxito', 'Estado de la cita actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error);
      showError('Error', 'No se pudo actualizar el estado de la cita');
    }
  };

  const renderAppointmentActions = (appointment: Appointment) => (
    <View style={styles.appointmentActions}>
      {appointment.status === 'pending' && (
        <>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateAppointmentStatus(appointment.id, 'completed')}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Finalizar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateAppointmentStatus(appointment.id, 'cancelled')}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Crear el objeto de fechas marcadas
  const markedDates = useMemo(() => {
    const dates: { [key: string]: any } = {};
    
    // Marcar todas las fechas que tienen citas
    appointments.forEach(appointment => {
      const statusColor = getStatusColor(appointment.status);
      
      if (!dates[appointment.date]) {
        dates[appointment.date] = {
          marked: true,
          dots: [{
            color: statusColor,
            selectedDotColor: 'white'
          }]
        };
      } else {
        // Si ya existe la fecha, agregamos otro punto
        dates[appointment.date].dots.push({
          color: statusColor,
          selectedDotColor: 'white'
        });
      }

      // Si la fecha está seleccionada
      if (appointment.date === selectedDate) {
        dates[appointment.date] = {
          ...dates[appointment.date],
          selected: true,
          selectedColor: '#6B46C1',
        };
      }
    });

    // Si hay una fecha seleccionada pero no tiene citas
    if (selectedDate && !dates[selectedDate]) {
      dates[selectedDate] = {
        selected: true,
        selectedColor: '#6B46C1'
      };
    }

    return dates;
  }, [appointments, selectedDate]);

  const renderStatusFilter = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
        onPress={() => setStatusFilter(null)}
      >
        <Text style={[styles.filterButtonText, !statusFilter && styles.filterButtonTextActive]}>Todas</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, statusFilter === 'pending' && styles.filterButtonActive]}
        onPress={() => setStatusFilter('pending')}
      >
        <View style={styles.filterContent}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor('pending') }]} />
          <Text style={[styles.filterButtonText, statusFilter === 'pending' && styles.filterButtonTextActive]}>Pendientes</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, statusFilter === 'completed' && styles.filterButtonActive]}
        onPress={() => setStatusFilter('completed')}
      >
        <View style={styles.filterContent}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor('completed') }]} />
          <Text style={[styles.filterButtonText, statusFilter === 'completed' && styles.filterButtonTextActive]}>Finalizadas</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, statusFilter === 'cancelled' && styles.filterButtonActive]}
        onPress={() => setStatusFilter('cancelled')}
      >
        <View style={styles.filterContent}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor('cancelled') }]} />
          <Text style={[styles.filterButtonText, statusFilter === 'cancelled' && styles.filterButtonTextActive]}>Canceladas</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderDateFilter = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowCalendar(true)}
      >
        <Ionicons name="calendar" size={24} color="#6B46C1" />
        <Text style={styles.datePickerButtonText}>
          {selectedDate ? `${new Date(selectedDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}` : 'Seleccionar fecha'}
        </Text>
        {selectedDate && (
          <TouchableOpacity
            style={styles.clearDateButton}
            onPress={() => setSelectedDate(null)}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Seleccionar Fecha</Text>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Calendar
              markedDates={markedDates}
              onDayPress={(day: CalendarDay) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markingType="multi-dot"
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#6B46C1',
                selectedDayBackgroundColor: '#6B46C1',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#6B46C1',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#FF4B4B',
                selectedDotColor: '#ffffff',
                arrowColor: '#6B46C1',
                monthTextColor: '#6B46C1',
                indicatorColor: '#6B46C1',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
              }}
            />
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                <Text style={styles.legendText}>Pendiente</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Finalizada</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>Cancelada</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.dateTime}>
            {formatDateTime(appointment.date, appointment.time)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#666" />
          <Text style={styles.clientName}>
            {appointment.client?.user?.name || 'Cliente sin nombre'}
          </Text>
        </View>

        {appointment.client?.user?.telefono && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#666" />
            <Text style={styles.infoText}>{appointment.client.user.telefono}</Text>
          </View>
        )}

        {appointment.service && (
          <View style={styles.infoRow}>
            <Ionicons name="cut" size={20} color="#666" />
            <Text style={styles.infoText}>
              {appointment.service.name} - {appointment.service.duration} min
            </Text>
          </View>
        )}

        {appointment.service?.price && (
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#666" />
            <Text style={styles.infoText}>${appointment.service.price}</Text>
          </View>
        )}
      </View>
      <View style={styles.appointmentFooterContainer}>
        {renderAppointmentActions(appointment)}
      </View>
    </View>
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['employee', 'admin']}>
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            headerStyle: {
              backgroundColor: '#F5F5F5',
            },
            headerShadowVisible: false,
            headerTitle: "Mis Citas",
            headerTitleStyle: {
              fontFamily: 'Arial',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#333',
            },
            headerRight: () => (
              <TouchableOpacity 
                onPress={fetchAppointments}
                style={styles.headerButton}
              >
                <Ionicons name="refresh" size={24} color="#6B46C1" />
              </TouchableOpacity>
            ),
          }}
        />
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B46C1" />
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6B46C1']}
                tintColor="#6B46C1"
              />
            }
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.filtersContainer}>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowCalendar(true)}
              >
                <Ionicons name="calendar" size={24} color="#6B46C1" />
                <Text style={styles.datePickerButtonText}>
                  {selectedDate ? `${new Date(selectedDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}` : 'Seleccionar fecha'}
                </Text>
                {selectedDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setSelectedDate(null)}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filterScrollView}
                contentContainerStyle={styles.filterScrollContent}
              >
                <TouchableOpacity
                  style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
                  onPress={() => setStatusFilter(null)}
                >
                  <Text style={[styles.filterButtonText, !statusFilter && styles.filterButtonTextActive]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, statusFilter === 'pending' && styles.filterButtonActive]}
                  onPress={() => setStatusFilter('pending')}
                >
                  <View style={styles.filterContent}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor('pending') }]} />
                    <Text style={[styles.filterButtonText, statusFilter === 'pending' && styles.filterButtonTextActive]}>
                      Pendientes
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, statusFilter === 'completed' && styles.filterButtonActive]}
                  onPress={() => setStatusFilter('completed')}
                >
                  <View style={styles.filterContent}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor('completed') }]} />
                    <Text style={[styles.filterButtonText, statusFilter === 'completed' && styles.filterButtonTextActive]}>
                      Finalizadas
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, statusFilter === 'cancelled' && styles.filterButtonActive]}
                  onPress={() => setStatusFilter('cancelled')}
                >
                  <View style={styles.filterContent}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor('cancelled') }]} />
                    <Text style={[styles.filterButtonText, statusFilter === 'cancelled' && styles.filterButtonTextActive]}>
                      Canceladas
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            {filteredAppointments.length > 0 ? (
              <View style={styles.appointmentsContainer}>
                {filteredAppointments.map(appointment => (
                  <View key={appointment.id} style={styles.appointmentWrapper}>
                    {renderAppointmentCard(appointment)}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="calendar" size={64} color="#6B46C1" />
                </View>
                <Text style={styles.emptyStateTitle}>No hay citas para mostrar</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Las citas aparecerán aquí cuando estén programadas
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchAppointments}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        <Modal
          visible={showCalendar}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Seleccionar Fecha</Text>
                <TouchableOpacity
                  onPress={() => setShowCalendar(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <Calendar
                markedDates={markedDates}
                onDayPress={(day: CalendarDay) => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                markingType="multi-dot"
                theme={{
                  backgroundColor: '#F5F5F5',
                  calendarBackground: '#F5F5F5',
                  textSectionTitleColor: '#6B46C1',
                  selectedDayBackgroundColor: '#6B46C1',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#6B46C1',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#FF4B4B',
                  selectedDotColor: '#FFFFFF',
                  arrowColor: '#6B46C1',
                  monthTextColor: '#6B46C1',
                  indicatorColor: '#6B46C1',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14
                }}
              />
              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                  <Text style={styles.legendText}>Pendiente</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Finalizada</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                  <Text style={styles.legendText}>Cancelada</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#6B46C1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearDateButton: {
    padding: 4,
  },
  filterScrollView: {
    marginBottom: -8,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  appointmentsContainer: {
    padding: 16,
  },
  appointmentWrapper: {
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6B46C1',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 500,
  },
  appointmentFooterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});

export default EmployeeAppointmentsScreen;