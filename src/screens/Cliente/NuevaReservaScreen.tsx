// src/screens/Cliente/NuevaReservaScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Interfaces para los datos
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  tiempo_estimado: number;
  costo: number;
  precio: number;
  categoria: string;
  tiendaId: number;
}

interface Empleado {
  id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  cargo: string;
  dias_para_reservas: string;
  tiendaId: number;
}

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

interface ReservaData {
  clienteId: number;
  empleadoId: number;
  servicioId: number;
  fecha: string;
  hora: string;
  estado: string;
  tiendaId: number;
}

// Componente principal
export default function NuevaReservaScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  
  // Datos para los pasos
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  
  // Selecciones del usuario
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // API URL base
  const baseURL = 'http://10.0.2.2:3001';

  // Cargar datos del usuario y tienda seleccionada
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        const tiendaData = await AsyncStorage.getItem('selectedTienda');
        
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
          
          // Si hay una tienda seleccionada, la usamos
          if (tiendaData) {
            setTiendaId(parseInt(tiendaData));
            console.log('[NuevaReservaScreen] Datos cargados:', { userId: user.id, tiendaId: parseInt(tiendaData) });
          } else {
            console.log('[NuevaReservaScreen] Usuario sin tienda seleccionada:', { userId: user.id });
          }
          
          // Cargamos todos los servicios disponibles sin filtrar por tienda
          fetchServicios();
        } else {
          Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
          setLoadingData(false);
        }
      } catch (error) {
        console.error('[NuevaReservaScreen] Error al cargar datos:', error);
        setLoadingData(false);
      }
    };
    
    loadUserData();
  }, []);

  // Cargar servicios disponibles
  const fetchServicios = async () => {
    try {
      setLoadingData(true);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[NuevaReservaScreen] No se encontró token de autenticación');
        Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
        setLoadingData(false);
        return;
      }
      
      console.log('[NuevaReservaScreen] Obteniendo todos los servicios disponibles...');
      
      // Realizar la solicitud con el token de autenticación
      const response = await axios.get(`${baseURL}/servicios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      console.log('[NuevaReservaScreen] Servicios disponibles:', response.data.length);
      
      // Usar todos los servicios disponibles sin filtrar
      setServicios(response.data);
      setLoadingData(false);
    } catch (error) {
      console.error('[NuevaReservaScreen] Error al cargar servicios:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios disponibles');
      setLoadingData(false);
    }
  };

  // Cargar empleados cuando se selecciona un servicio
  useEffect(() => {
    if (selectedService) {
      fetchEmpleados();
    }
  }, [selectedService]);

  // Cargar empleados disponibles
  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[NuevaReservaScreen] No se encontró token de autenticación');
        Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      console.log('[NuevaReservaScreen] Obteniendo todos los empleados disponibles...');
      
      // Realizar la solicitud con el token de autenticación
      const response = await axios.get(`${baseURL}/empleados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      console.log('[NuevaReservaScreen] Empleados disponibles:', response.data.length);
      
      // Usar todos los empleados disponibles sin filtrar por tienda
      setEmpleados(response.data);
      setLoading(false);
    } catch (error) {
      console.error('[NuevaReservaScreen] Error al cargar empleados:', error);
      Alert.alert('Error', 'No se pudieron cargar los empleados disponibles');
      setLoading(false);
    }
  };

  // Cargar horarios disponibles cuando se selecciona un empleado
  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      fetchHorariosDisponibles(selectedEmployee, selectedDate);
    }
  }, [selectedEmployee, selectedDate]);

  // Función para cargar horarios disponibles
  const fetchHorariosDisponibles = async (empleadoId: number, fecha: Date) => {
    try {
      setLoadingData(true);
      
      // Formatear fecha para la API (YYYY-MM-DD)
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      // En un caso real, aquí consultarías a la API para obtener los horarios disponibles
      // Por ahora, generamos horarios de ejemplo
      const horariosEjemplo: HorarioDisponible[] = [
        { hora: '09:00', disponible: true },
        { hora: '10:00', disponible: true },
        { hora: '11:00', disponible: false },
        { hora: '12:00', disponible: true },
        { hora: '13:00', disponible: true },
        { hora: '14:00', disponible: false },
        { hora: '15:00', disponible: true },
        { hora: '16:00', disponible: true },
        { hora: '17:00', disponible: true },
      ];
      
      // Simular tiempo de carga
      setTimeout(() => {
        setHorariosDisponibles(horariosEjemplo);
        setLoadingData(false);
      }, 500);
      
    } catch (error) {
      console.error('[NuevaReservaScreen] Error al cargar horarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
      setLoadingData(false);
    }
  };

  // Avanzar al siguiente paso
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedService) {
      Alert.alert('Error', 'Por favor seleccione un servicio');
      return;
    }
    if (currentStep === 2 && !selectedEmployee) {
      Alert.alert('Error', 'Por favor seleccione un profesional');
      return;
    }
    if (currentStep === 3 && !selectedTime) {
      Alert.alert('Error', 'Por favor seleccione una hora');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateReservation();
    }
  };

  // Volver al paso anterior
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Crear la reserva
  const handleCreateReservation = async () => {
    try {
      if (!selectedService || !selectedEmployee || !selectedTime || !userId) {
        Alert.alert('Error', 'Por favor complete todos los campos');
        return;
      }
      
      setLoading(true);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[NuevaReservaScreen] No se encontró token de autenticación');
        Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      // Obtener el servicio seleccionado para usar su tiendaId
      const servicioSeleccionado = servicios.find(s => s.id === selectedService);
      
      if (!servicioSeleccionado) {
        Alert.alert('Error', 'No se pudo encontrar el servicio seleccionado');
        setLoading(false);
        return;
      }
      
      // Formatear la fecha para la API (YYYY-MM-DD)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Crear el objeto de reserva
      const reservaData: ReservaData = {
        clienteId: userId,
        empleadoId: selectedEmployee,
        servicioId: selectedService,
        fecha: formattedDate,
        hora: selectedTime,
        estado: 'pendiente',
        tiendaId: servicioSeleccionado.tiendaId // Usar el tiendaId del servicio seleccionado
      };
      
      console.log('[NuevaReservaScreen] Creando reserva:', reservaData);
      
      // Enviar la solicitud a la API
      const response = await axios.post(`${baseURL}/reservas`, reservaData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      console.log('[NuevaReservaScreen] Reserva creada exitosamente:', response.data);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Reserva Creada',
        'Tu reserva ha sido creada exitosamente',
        [
          {
            text: 'Ver Mis Reservas',
            onPress: () => navigation.navigate('MisReservas' as never)
          }
        ]
      );
      
      // Reiniciar el formulario
      setCurrentStep(1);
      setSelectedService(null);
      setSelectedEmployee(null);
      setSelectedDate(new Date());
      setSelectedTime(null);
    } catch (error) {
      console.error('[NuevaReservaScreen] Error al crear reserva:', error);
      Alert.alert('Error', 'No se pudo crear la reserva. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar el formulario
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedEmployee(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
  };

  // Renderizar el paso actual
  const renderStep = () => {
    if (loadingData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      );
    }
    
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Paso 1: Seleccione un Servicio</Text>
            <View style={styles.serviceList}>
              {servicios.length > 0 ? (
                servicios.map((servicio) => (
                  <TouchableOpacity 
                    key={servicio.id}
                    style={[styles.serviceItem, selectedService === servicio.id && styles.selectedItem]}
                    onPress={() => setSelectedService(servicio.id)}
                  >
                    <Text style={styles.serviceName}>{servicio.nombre}</Text>
                    <Text style={styles.serviceDetails}>
                      Duración: {servicio.tiempo_estimado} min - Precio: ${servicio.precio}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyMessage}>No hay servicios disponibles</Text>
              )}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Paso 2: Seleccione un Profesional</Text>
            <View style={styles.employeeList}>
              {empleados.length > 0 ? (
                empleados.map((empleado) => (
                  <TouchableOpacity 
                    key={empleado.id}
                    style={[styles.employeeItem, selectedEmployee === empleado.id && styles.selectedItem]}
                    onPress={() => setSelectedEmployee(empleado.id)}
                  >
                    <Text style={styles.employeeName}>{empleado.nombres} {empleado.apellidos}</Text>
                    <Text style={styles.employeeDetails}>{empleado.cargo}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyMessage}>No hay profesionales disponibles</Text>
              )}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Paso 3: Seleccione Fecha y Hora</Text>
            
            <Text style={styles.dateLabel}>Fecha seleccionada: {selectedDate.toLocaleDateString()}</Text>
            
            <View style={styles.timeList}>
              {horariosDisponibles.length > 0 ? (
                horariosDisponibles.map((horario) => (
                  <TouchableOpacity 
                    key={horario.hora}
                    style={[
                      styles.timeItem, 
                      selectedTime === horario.hora && styles.selectedItem,
                      !horario.disponible && styles.disabledItem
                    ]}
                    onPress={() => horario.disponible && setSelectedTime(horario.hora)}
                    disabled={!horario.disponible}
                  >
                    <Text style={[
                      styles.timeText,
                      !horario.disponible && styles.disabledText
                    ]}>
                      {formatHour(horario.hora)}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyMessage}>No hay horarios disponibles</Text>
              )}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // Función para formatear la hora
  const formatHour = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    
    if (hourNum < 12) {
      return `${time} AM`;
    } else if (hourNum === 12) {
      return `${time} PM`;
    } else {
      return `${hourNum - 12}:00 PM`;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Reserva</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, currentStep >= 3 && styles.activeStepDot]} />
        </View>
      </View>

      {renderStep()}

      <View style={styles.buttonsContainer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handlePreviousStep}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Confirmar Reserva' : 'Siguiente'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  activeStepDot: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  serviceList: {
    marginBottom: 20,
  },
  serviceItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: '#e6f2ff',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  employeeList: {
    marginBottom: 20,
  },
  employeeItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 15,
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeItem: {
    width: '30%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
  },
  disabledItem: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
  disabledText: {
    color: '#999',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});