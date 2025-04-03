import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, RefreshControl, Animated, StyleProp, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import apiService from '../../utils/api';
import { useAlert } from '../../hooks/useAlert';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Skeleton from '../components/Skeleton';
import AppointmentCard from '../components/AppointmentCard';
import { colors, shadows, spacing, borderRadius, typography } from '../theme/colors';
import * as Haptics from 'expo-haptics';

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
}

// Removed unused Client interface

type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  client?: {
    id_user: number;
    user?: User;
  };
  service?: {
    name: string;
    price: number;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AppointmentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  date: string;
  time: string;
  service: {
    name: string;
    price: number;
    duration: number;
  };
  status: AppointmentStatus;
}

const ClientAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [clientId, setClientId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  
  const router = useRouter();
  const { showError } = useAlert();

  // Define fetchAppointments with useCallback before using it
  const fetchAppointments = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');

      if (!token || !userStr) {
        showError('Error de autenticación', 'Por favor, inicie sesión nuevamente');
        router.push('/login');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userData = JSON.parse(userStr);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userRole = userData.role?.nombre?.toLowerCase();

      console.log("🔍 Obteniendo citas...");
      // Usar el servicio API centralizado que maneja errores y caché
      let appointmentsData = await apiService.get<Appointment[]>('/appointments');
      console.log("📋 Total de citas obtenidas:", appointmentsData.length);
      console.log("👤 ID del usuario logueado:", clientId);

      // Filtrar las citas del usuario logueado
      appointmentsData = appointmentsData.filter((appointment: Appointment) => {
        const isUserAppointment = Number(appointment.client?.id_user) === Number(clientId);
        console.log(`Cita ${appointment.id}: client.id_user=${appointment.client?.id_user}, userId=${clientId}, match=${isUserAppointment}`);
        return isUserAppointment;
      });

      console.log(`✅ Citas filtradas para el usuario ${clientId}:`, appointmentsData.length);

      // Ordenamos las citas por fecha y hora
      const sortedAppointments = appointmentsData.sort((a: Appointment, b: Appointment) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('❌ Error al obtener las citas:', error);
      showError('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clientId, router, showError]);

  // Actualizar citas cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      if (clientId) {
        console.log("🔄 Actualizando citas al recibir foco...");
        fetchAppointments();
      }
    }, [clientId, fetchAppointments])
  );

  // Obtener el ID del cliente al montar el componente
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userIdString = await AsyncStorage.getItem("userId");
        
        if (!userIdString) {
          console.error("❌ No se encontró el ID del usuario logueado");
          showError("No se encontró el ID del usuario", "Error de sesión");
          return;
        }

        const id = Number(userIdString);
        setClientId(id);
        console.log("✅ ID del usuario/cliente logueado:", id);
      } catch (error) {
        console.error("❌ Error al obtener el ID del usuario/cliente:", error);
        showError("Error al obtener información del usuario", "Error de sesión");
      }
    };

    fetchUserId();
  }, [showError]);

  // Cargar citas cuando tengamos el clientId
  useEffect(() => {
    if (clientId) {
      fetchAppointments();
    }
  }, [clientId, fetchAppointments]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Verificar el rol del usuario al montar el componente
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');

        if (!userId) {
          showError('Error de autenticación', 'Por favor, inicie sesión nuevamente');
          router.push('/login');
          return;
        }

        // Usar el servicio API centralizado que maneja errores y caché
        // Forzar la actualización para obtener el rol más reciente
        const userData = await apiService.get<User>(`/users/${userId}`, {}, { forceRefresh: true });

        const userRole = userData.role?.nombre?.toLowerCase();
        if (userRole !== 'client' && userRole !== 'admin') {
          showError('Acceso denegado', 'Esta página es solo para clientes y administradores');
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
  }, [router, showError]);

  const onRefresh = useCallback(() => {
    if (clientId) {
      setRefreshing(true);
      fetchAppointments();
    }
  }, [clientId, fetchAppointments]);

  const renderAppointmentSkeleton = () => (
    <View style={styles.skeletonContainer as ViewStyle}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.skeletonCard as ViewStyle}>
          <Skeleton width="60%" height={20} style={{ marginBottom: 8 } as ViewStyle} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 12 } as ViewStyle} />
          <Skeleton width="80%" height={24} style={{ marginBottom: 8 } as ViewStyle} />
          <Skeleton width="30%" height={16} />
        </View>
      ))}
    </View>
  );

  // Filtrado de citas
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Filtrar por estado
      if (statusFilter && appointment.status !== statusFilter) {
        return false;
      }
      
      // Filtrar por fecha
      if (selectedDate && appointment.date !== selectedDate) {
        return false;
      }
      
      return true;
    });
  }, [appointments, statusFilter, selectedDate]);

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setStatusFilter(null);
    setSelectedDate(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderContent = () => {
    if (loading) {
      return renderAppointmentSkeleton();
    }

    if (appointments.length === 0) {
      return (
        <View style={styles.emptyContainer as ViewStyle}>
          <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText as TextStyle}>No tienes citas programadas</Text>
          <TouchableOpacity 
            style={styles.newAppointmentButton as ViewStyle}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/cita" as any);
            }}
          >
            <Text style={styles.newAppointmentButtonText as TextStyle}>Programar una cita</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <View style={styles.emptyContainer as ViewStyle}>
          <Ionicons name="filter-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText as TextStyle}>No hay citas que coincidan con los filtros</Text>
          <TouchableOpacity 
            style={styles.clearFiltersButton as ViewStyle}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersButtonText as TextStyle}>Limpiar filtros</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent as ViewStyle}
        >
          {(selectedDate || statusFilter) && (
            <View style={styles.activeFiltersContainer as ViewStyle}>
              {selectedDate && (
                <View style={styles.activeFilterBadge as ViewStyle}>
                  <Text style={styles.activeFilterText as TextStyle}>
                    {new Date(selectedDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedDate(null)}>
                    <Ionicons name="close-circle" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              {statusFilter && (
                <View style={styles.activeFilterBadge as ViewStyle}>
                  <Text style={styles.activeFilterText as TextStyle}>
                    {statusFilter === 'pending' ? 'Pendientes' :
                     statusFilter === 'completed' ? 'Completadas' : 'Canceladas'}
                  </Text>
                  <TouchableOpacity onPress={() => setStatusFilter(null)}>
                    <Ionicons name="close-circle" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity 
                style={styles.clearAllFiltersButton as ViewStyle}
                onPress={clearFilters}
              >
                <Text style={styles.clearAllFiltersText as TextStyle}>Limpiar todo</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {filteredAppointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              date={appointment.date}
              time={appointment.time}
              service={appointment.service!}
              status={appointment.status}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedAppointment(appointment);
                setShowAppointmentDetails(true);
              }}
              style={{
                transform: [
                  { translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50 * (index + 1), 0]
                  })}
                ]
              }}
            />
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  // Move getStatusStyle function outside of StyleSheet
  const getStatusStyle = (status: AppointmentStatus): StyleProp<TextStyle> => ({
    color: status === 'pending' ? colors.warning :
          status === 'completed' ? colors.success :
          colors.error
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    scrollContent: {
      paddingVertical: spacing.md,
    } as ViewStyle,
    skeletonContainer: {
      padding: spacing.md,
    } as ViewStyle,
    skeletonCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.small,
    } as ViewStyle,
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    } as ViewStyle,
    emptyText: {
      ...typography.h3,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    } as TextStyle,
    newAppointmentButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.round,
      ...shadows.small,
    } as ViewStyle,
    newAppointmentButtonText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: '600',
    } as TextStyle,
    calendarButton: {
      padding: spacing.sm,
      marginRight: spacing.sm,
    } as ViewStyle,
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
    } as ViewStyle,
    filterButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.xs,
      borderRadius: borderRadius.round,
      alignItems: 'center',
      backgroundColor: colors.background,
    } as ViewStyle,
    filterButtonActive: {
      backgroundColor: colors.primary,
    } as ViewStyle,
    filterButtonText: {
      ...typography.caption,
      color: colors.textLight,
    } as TextStyle,
    filterButtonTextActive: {
      color: colors.surface,
      fontWeight: '600',
    } as TextStyle,
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    } as ViewStyle,
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.large,
    } as ViewStyle,
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    } as ViewStyle,
    modalTitle: {
      ...typography.h3,
      color: colors.text,
    } as TextStyle,
    activeFiltersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: spacing.sm,
      gap: spacing.xs,
      alignItems: 'center',
    } as ViewStyle,
    activeFilterBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.round,
      gap: spacing.xs,
      ...shadows.small,
    } as ViewStyle,
    activeFilterText: {
      ...typography.caption,
      color: colors.text,
    } as TextStyle,
    clearAllFiltersButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    } as ViewStyle,
    clearAllFiltersText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    } as TextStyle,
    clearFiltersButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.round,
      ...shadows.small,
    } as ViewStyle,
    clearFiltersButtonText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: '600',
    } as TextStyle,
    appointmentDetails: {
      gap: spacing.md,
    } as ViewStyle,
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    } as ViewStyle,
    detailText: {
      ...typography.body,
      color: colors.text,
    } as TextStyle,
    cancelButton: {
      backgroundColor: colors.error,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.round,
      alignItems: 'center',
      marginTop: spacing.lg,
    } as ViewStyle,
    cancelButtonText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: '600',
    } as TextStyle,
  });

  return (
    <View style={styles.container as ViewStyle}>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerTitle: "Mis Citas",
          headerTitleStyle: {
            fontFamily: typography.h2.fontFamily,
            fontSize: typography.h2.fontSize,
            fontWeight: typography.h2.fontWeight,
            color: colors.text.toString()
          },
          headerRight: () => (
            <TouchableOpacity 
              style={styles.calendarButton as ViewStyle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCalendar(true);
              }}
            >
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.filterContainer as ViewStyle}>
        {['pending', 'completed', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton as ViewStyle,
              statusFilter === status && (styles.filterButtonActive as ViewStyle)
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStatusFilter(statusFilter === status ? null : status);
            }}
          >
            <Text style={[
              styles.filterButtonText as TextStyle,
              statusFilter === status && (styles.filterButtonTextActive as TextStyle)
            ]}>
              {status === 'pending' ? 'Pendientes' :
               status === 'completed' ? 'Completadas' : 'Canceladas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer as ViewStyle}>
          <View style={styles.modalContent as ViewStyle}>
            <View style={styles.modalHeader as ViewStyle}>
              <Text style={styles.modalTitle as TextStyle}>Seleccionar Fecha</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCalendar(false);
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={(day: CalendarDay) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                ...(selectedDate ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: colors.primary,
                  }
                } : {})
              }}
              theme={{
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para detalles de la cita */}
      <Modal
        visible={showAppointmentDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAppointmentDetails(false)}
      >
        <View style={styles.modalContainer as ViewStyle}>
          <View style={styles.modalContent as ViewStyle}>
            <View style={styles.modalHeader as ViewStyle}>
              <Text style={styles.modalTitle as TextStyle}>Detalles de la Cita</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAppointmentDetails(false);
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <View style={styles.appointmentDetails as ViewStyle}>
                <View style={styles.detailRow as ViewStyle}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.detailText as TextStyle}>
                    {new Date(selectedAppointment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>

                <View style={styles.detailRow as ViewStyle}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={styles.detailText as TextStyle}>
                    {new Date(`2000-01-01T${selectedAppointment.time}`).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

                <View style={styles.detailRow as ViewStyle}>
                  <Ionicons name="cut-outline" size={20} color={colors.primary} />
                  <Text style={styles.detailText as TextStyle}>
                    {selectedAppointment.service?.name}
                  </Text>
                </View>

                <View style={styles.detailRow as ViewStyle}>
                  <Ionicons name="cash-outline" size={20} color={colors.primary} />
                  <Text style={styles.detailText as TextStyle}>
                    ${selectedAppointment.service?.price}
                  </Text>
                </View>

                <View style={styles.detailRow as ViewStyle}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={styles.detailText as TextStyle}>
                    {selectedAppointment.service?.duration} minutos
                  </Text>
                </View>

                <View style={styles.detailRow as ViewStyle}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.detailText as TextStyle, getStatusStyle(selectedAppointment.status)]}>
                    {selectedAppointment.status === 'pending' ? 'Pendiente' :
                     selectedAppointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </Text>
                </View>

                {selectedAppointment.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.cancelButton as ViewStyle}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Aquí iría la lógica para cancelar la cita
                      setShowAppointmentDetails(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText as TextStyle}>Cancelar Cita</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClientAppointmentsScreen;
