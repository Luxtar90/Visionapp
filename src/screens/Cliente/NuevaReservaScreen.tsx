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
  Modal,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../api/client';

// Componentes modulares
import { 
  ServicioItem, 
  HorarioItem, 
  EmptyState
} from '../../components/Cliente';

// Nuevos componentes modulares para reservas
import {
  ReservationSteps,
  ServiceList,
  EmployeeList,
  ReservationCalendar,
  TimeSlotList,
  StepNavigation,
  ReservationSummary,
  CalendarLegend
} from '../../components/Reservas';

// Importar la definición de Empleado desde EmployeeList
import { Empleado as EmpleadoComponente } from '../../components/Reservas/EmployeeList';

// Importar el componente ResenasModal
import ResenasModal from '../../components/Reservas/ResenasModal';

// Interfaces para los datos
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  tiempo_estimado: number;
  costo: number;
  precio: any; // Cambiado de number a any para manejar diferentes formatos
  categoria: string;
  tiendaId: number;
}

// Usar la definición importada de Empleado
type Empleado = EmpleadoComponente;

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

// Interfaz para los días marcados en el calendario
interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    disabled?: boolean;
    selectedColor?: string;
    dots?: Array<{key: string, color: string, selectedDotColor?: string}>;
    description?: string; // Añadimos esta propiedad para mostrar información sobre disponibilidad
  };
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

interface Resena {
  id: number;
  usuarioNombre: string;
  fecha: string;
  calificacion: number;
  comentario: string;
  servicioNombre?: string;
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
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [mostrarResenas, setMostrarResenas] = useState(false);
  const [empleadoSeleccionadoResenas, setEmpleadoSeleccionadoResenas] = useState<Empleado | null>(null);
  
  // Selecciones del usuario
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEmpleadoData, setSelectedEmpleadoData] = useState<Empleado | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>('');

  // Estado para el calendario
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [reservasExistentes, setReservasExistentes] = useState<any[]>([]);
  const [mesActual, setMesActual] = useState<string>('');

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
      
      try {
        // Realizar la solicitud con el token de autenticación
        const response = await axios.get(`${ApiService.getBaseUrl()}/servicios`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log('[NuevaReservaScreen] Respuesta de servicios:', JSON.stringify(response.data));
        
        // Verificar la estructura de la respuesta y adaptarla según sea necesario
        let serviciosData = [];
        
        if (Array.isArray(response.data)) {
          serviciosData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Si la respuesta es un objeto, intentamos extraer los datos
          if (Array.isArray(response.data.servicios)) {
            serviciosData = response.data.servicios;
          } else if (Array.isArray(response.data.data)) {
            serviciosData = response.data.data;
          } else if (Array.isArray(response.data.results)) {
            serviciosData = response.data.results;
          } else {
            // Si no encontramos un array, convertimos las propiedades del objeto en un array
            console.log('[NuevaReservaScreen] Convirtiendo objeto a array');
            serviciosData = Object.values(response.data).filter(item => 
              item && typeof item === 'object' && 'id' in item
            );
          }
        }
        
        console.log('[NuevaReservaScreen] Servicios procesados:', serviciosData.length);
        
        if (serviciosData.length === 0) {
          // Si no hay servicios, usar datos de ejemplo
          console.log('[NuevaReservaScreen] No se encontraron servicios, usando datos de ejemplo');
          serviciosData = generarServiciosEjemplo();
        }
        
        // Usar todos los servicios disponibles sin filtrar
        setServicios(serviciosData);
        setLoadingData(false);
      } catch (apiError: any) {
        console.error('[NuevaReservaScreen] Error al obtener servicios de la API:', apiError.message);
        console.log('[NuevaReservaScreen] Generando datos de ejemplo para servicios');
        
        // Generar datos de ejemplo para servicios
        const serviciosEjemplo = generarServiciosEjemplo();
        setServicios(serviciosEjemplo);
        setLoadingData(false);
      }
    } catch (error) {
      console.error('[NuevaReservaScreen] Error general al obtener servicios:', error);
      setLoadingData(false);
    }
  };
  
  // Función para generar servicios de ejemplo
  const generarServiciosEjemplo = (): Servicio[] => {
    return [
      {
        id: 1,
        nombre: 'Examen de optometría completo',
        descripcion: 'Evaluación completa de la salud visual incluyendo agudeza visual, refracción y salud ocular',
        tiempo_estimado: 45,
        costo: 25000,
        precio: 80000,
        categoria: 'Exámenes diagnósticos',
        tiendaId: 1
      },
      {
        id: 2,
        nombre: 'Adaptación de lentes de contacto',
        descripcion: 'Servicio especializado para adaptar lentes de contacto según las necesidades del paciente',
        tiempo_estimado: 60,
        costo: 30000,
        precio: 100000,
        categoria: 'Lentes de contacto',
        tiendaId: 1
      },
      {
        id: 3,
        nombre: 'Medición y ajuste de monturas',
        descripcion: 'Servicio para medir y ajustar monturas para un ajuste perfecto',
        tiempo_estimado: 30,
        costo: 15000,
        precio: 40000,
        categoria: 'Monturas',
        tiendaId: 1
      }
    ];
  };

  // Cargar empleados cuando se selecciona un servicio
  useEffect(() => {
    if (selectedService) {
      fetchEmpleados(selectedService);
    }
  }, [selectedService]);

  // Cargar reservas existentes cuando se selecciona un empleado
  useEffect(() => {
    if (selectedEmployee) {
      fetchReservasExistentes(selectedEmployee);
    }
  }, [selectedEmployee]);

  // Cargar horarios disponibles cuando se selecciona un empleado y una fecha
  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      fetchHorariosDisponibles(selectedEmployee, selectedDate);
    }
  }, [selectedEmployee, selectedDate]);

  // Función para cargar empleados disponibles
  const fetchEmpleados = async (servicioId: number) => {
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
      
      console.log('[NuevaReservaScreen] Obteniendo empleados para el servicio ID:', servicioId);
      
      // Usar directamente el endpoint general de empleados
      try {
        const response = await axios.get(`${baseURL}/empleados`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log('[NuevaReservaScreen] Respuesta de empleados (general):', response.data);
        
        // Verificar la estructura de la respuesta y adaptarla según sea necesario
        let empleadosData = [];
        
        if (Array.isArray(response.data)) {
          empleadosData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Si la respuesta es un objeto, intentamos extraer los datos
          if (Array.isArray(response.data.empleados)) {
            empleadosData = response.data.empleados;
          } else if (Array.isArray(response.data.data)) {
            empleadosData = response.data.data;
          } else if (Array.isArray(response.data.results)) {
            empleadosData = response.data.results;
          } else {
            // Si no encontramos un array, convertimos las propiedades del objeto en un array
            console.log('[NuevaReservaScreen] Convirtiendo objeto a array');
            empleadosData = Object.values(response.data).filter(item => 
              item && typeof item === 'object' && 'id' in item
            );
          }
        }
        
        // Obtener las valoraciones para cada empleado
        const empleadosConCalificaciones = await Promise.all(
          empleadosData.map(async (empleado: Empleado) => {
            try {
              // Obtener las valoraciones del empleado
              const valoracionesResponse = await axios.get(
                `${baseURL}/valoraciones/empleado/${empleado.id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              let valoraciones = [];
              if (Array.isArray(valoracionesResponse.data)) {
                valoraciones = valoracionesResponse.data;
              } else if (valoracionesResponse.data && Array.isArray(valoracionesResponse.data.valoraciones)) {
                valoraciones = valoracionesResponse.data.valoraciones;
              }
              
              // Calcular el promedio de valoraciones
              let calificacionPromedio = 0;
              if (valoraciones.length > 0) {
                const sumaValoraciones = valoraciones.reduce(
                  (sum: number, val: any) => sum + (val.valoracion || 0), 
                  0
                );
                calificacionPromedio = sumaValoraciones / valoraciones.length;
                
                // Redondear a 1 decimal
                calificacionPromedio = Math.round(calificacionPromedio * 10) / 10;
              }
              
              console.log(`[NuevaReservaScreen] Empleado ${empleado.id} tiene ${valoraciones.length} valoraciones con promedio ${calificacionPromedio}`);
              
              return {
                ...empleado,
                calificacion: calificacionPromedio || 0,
                numResenas: valoraciones.length
              };
            } catch (error) {
              console.warn(`[NuevaReservaScreen] Error al obtener valoraciones para empleado ${empleado.id}:`, error);
              // Si hay error, devolver el empleado sin valoraciones
              return {
                ...empleado,
                calificacion: 0,
                numResenas: 0
              };
            }
          })
        );
        
        console.log('[NuevaReservaScreen] Empleados procesados con calificaciones reales:', empleadosConCalificaciones.length);
        setEmpleados(empleadosConCalificaciones);
        setLoading(false);
      } catch (error: any) {
        console.error('[NuevaReservaScreen] Error al obtener empleados:', error.message);
        
        // Generar datos de ejemplo si hay error
        const empleadosEjemplo: Empleado[] = [
          {
            id: 1,
            nombres: 'Ana',
            apellidos: 'García',
            cargo: 'Estilista Senior',
            dias_para_reservas: 'lunes,martes,miércoles,jueves,viernes',
            tiendaId: 1,
            calificacion: 4.5,
            numResenas: 28,
            especialidad: 'Cortes y Tintes'
          },
          {
            id: 2,
            nombres: 'Carlos',
            apellidos: 'Rodríguez',
            cargo: 'Barbero',
            dias_para_reservas: 'lunes,martes,miércoles,jueves,viernes,sábado',
            tiendaId: 1,
            calificacion: 4.8,
            numResenas: 42,
            especialidad: 'Cortes Masculinos'
          },
          {
            id: 3,
            nombres: 'María',
            apellidos: 'López',
            cargo: 'Manicurista',
            dias_para_reservas: 'lunes,martes,miércoles,jueves,viernes',
            tiendaId: 1,
            calificacion: 4.2,
            numResenas: 15,
            especialidad: 'Manicura y Pedicura'
          }
        ];
        
        setEmpleados(empleadosEjemplo);
        setLoading(false);
      }
    } catch (error) {
      console.error('[NuevaReservaScreen] Error general al obtener empleados:', error);
      setLoading(false);
    }
  };

  // Función para manejar la selección de un empleado
  const handleSelectEmpleado = (empleado: Empleado) => {
    setSelectedEmployee(empleado.id);
    setSelectedEmpleadoData(empleado);
    // Limpiar selecciones posteriores
    setSelectedDate(new Date());
    setSelectedHour('');
    setHorariosDisponibles([]);
    // Avanzar al siguiente paso si es necesario
    if (currentStep === 2) {
      fetchReservasExistentes(empleado.id);
    }
  };

  // Función para cargar reservas existentes del empleado
  const fetchReservasExistentes = async (empleadoId: number) => {
    try {
      setLoadingData(true);
      setHorariosDisponibles([]);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[NuevaReservaScreen] No se encontró token de autenticación');
        Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
        setLoadingData(false);
        return;
      }
      
      console.log(`[NuevaReservaScreen] Consultando reservas para empleado ${empleadoId}`);
      
      try {
        // Realizar la solicitud a la API
        const response = await axios.get(`${ApiService.getBaseUrl()}/reservas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log(`[NuevaReservaScreen] Total de reservas obtenidas: ${response.data.length}`);
        
        // Filtrar las reservas para el empleado seleccionado
        const reservasEmpleado = response.data.filter((reserva: any) => {
          const reservaEmpId = Number(reserva.empleadoId);
          return reservaEmpId === empleadoId;
        });
        
        setReservasExistentes(reservasEmpleado);
        
        // Marcar las fechas en el calendario
        const marcas: MarkedDates = {};
        
        // Contar reservas por fecha para identificar días con múltiples reservas
        const reservasPorFecha: {[key: string]: number} = {};
        
        // Contar las reservas por fecha (solo reservas activas)
        reservasEmpleado.forEach((reserva: any) => {
          if (reserva.estado === 'cancelada') return; // Ignorar reservas canceladas
          
          if (!reservasPorFecha[reserva.fecha]) {
            reservasPorFecha[reserva.fecha] = 1;
          } else {
            reservasPorFecha[reserva.fecha]++;
          }
        });
        
        // Generar fechas para los próximos 30 días
        const fechasDisponibles: string[] = [];
        const hoy = new Date();
        
        for (let i = 0; i < 30; i++) {
          const fecha = new Date();
          fecha.setDate(hoy.getDate() + i);
          // Omitir domingos (0 es domingo en JavaScript)
          if (fecha.getDay() !== 0) {
            const fechaStr = fecha.toISOString().split('T')[0];
            fechasDisponibles.push(fechaStr);
          }
        }
        
        // Marcar días con reservas y disponibilidad
        fechasDisponibles.forEach(fecha => {
          const cantidadReservas = reservasPorFecha[fecha] || 0;
          
          // Verificar disponibilidad (máximo 9 horarios por día)
          const horariosOcupados = cantidadReservas;
          const horariosDisponibles = 9 - horariosOcupados;
          
          if (cantidadReservas > 0) {
            // Marcar con punto rojo los días con múltiples reservas
            if (cantidadReservas > 1) {
              marcas[fecha] = { 
                marked: true, 
                dotColor: 'red',
                // Añadir dots para mostrar disponibilidad
                dots: [
                  { key: 'occupied', color: 'red' },
                  { key: 'available', color: 'green' }
                ]
              };
            } else {
              // Para días con una sola reserva, usar un punto azul
              marcas[fecha] = { 
                marked: true, 
                dotColor: colors.primary,
                // Añadir dots para mostrar disponibilidad
                dots: [
                  { key: 'occupied', color: colors.primary },
                  { key: 'available', color: 'green' }
                ]
              };
            }
          } else {
            // Días completamente disponibles (sin reservas)
            marcas[fecha] = { 
              marked: true, 
              dotColor: 'green'
            };
          }
          
          // Añadir información sobre disponibilidad en la descripción
          if (horariosDisponibles > 0) {
            marcas[fecha] = {
              ...marcas[fecha],
              description: `${horariosDisponibles} horarios disponibles`
            };
          } else {
            marcas[fecha] = {
              ...marcas[fecha],
              description: 'No hay horarios disponibles',
              disabled: true
            };
          }
        });
        
        // Si el día seleccionado actual está en el calendario, mantenerlo seleccionado
        const fechaSeleccionada = selectedDate.toISOString().split('T')[0];
        if (fechaSeleccionada) {
          if (marcas[fechaSeleccionada]) {
            // Si ya existe una marca para esta fecha, añadir la selección
            marcas[fechaSeleccionada] = {
              ...marcas[fechaSeleccionada],
              selected: true,
              selectedColor: colors.primary
            };
          } else {
            // Si no existe, crear una nueva marca con selección
            marcas[fechaSeleccionada] = {
              selected: true,
              selectedColor: colors.primary
            };
          }
        }
        
        setMarkedDates(marcas);
      } catch (error: any) {
        console.error('[NuevaReservaScreen] Error al obtener reservas:', error.response?.data || error.message);
        
        // Si hay un error, usamos datos simulados como fallback
        console.log('[NuevaReservaScreen] Usando datos simulados como fallback');
        
        // Simulamos reservas para los próximos 30 días
        const fechaActual = new Date();
        const reservasSimuladas = [];
        
        // Crear algunas reservas de ejemplo para los próximos 30 días
        for (let i = 0; i < 15; i++) {
          const fechaReserva = new Date();
          fechaReserva.setDate(fechaActual.getDate() + Math.floor(Math.random() * 30));
          
          reservasSimuladas.push({
            id: i + 1,
            fecha: fechaReserva.toISOString().split('T')[0],
            hora: `${9 + Math.floor(Math.random() * 8)}:00`,
            empleadoId: empleadoId,
            estado: 'pendiente'
          });
        }
        
        setReservasExistentes(reservasSimuladas);
        
        // Generar fechas para los próximos 30 días
        const fechasDisponibles: string[] = [];
        const hoy = new Date();
        
        for (let i = 0; i < 30; i++) {
          const fecha = new Date();
          fecha.setDate(hoy.getDate() + i);
          // Omitir domingos (0 es domingo en JavaScript)
          if (fecha.getDay() !== 0) {
            const fechaStr = fecha.toISOString().split('T')[0];
            fechasDisponibles.push(fechaStr);
          }
        }
        
        // Marcar las fechas en el calendario
        const marcas: MarkedDates = {};
        
        // Contar reservas por fecha para identificar días con múltiples reservas
        const reservasPorFecha: {[key: string]: number} = {};
        
        // Contar las reservas por fecha
        reservasSimuladas.forEach((reserva: any) => {
          if (!reservasPorFecha[reserva.fecha]) {
            reservasPorFecha[reserva.fecha] = 1;
          } else {
            reservasPorFecha[reserva.fecha]++;
          }
        });
        
        // Marcar días con reservas y disponibilidad
        fechasDisponibles.forEach(fecha => {
          const cantidadReservas = reservasPorFecha[fecha] || 0;
          
          // Verificar disponibilidad (máximo 9 horarios por día)
          const horariosOcupados = cantidadReservas;
          const horariosDisponibles = 9 - horariosOcupados;
          
          if (cantidadReservas > 0) {
            // Marcar con punto rojo los días con múltiples reservas
            if (cantidadReservas > 1) {
              marcas[fecha] = { 
                marked: true, 
                dotColor: 'red',
                // Añadir dots para mostrar disponibilidad
                dots: [
                  { key: 'occupied', color: 'red' },
                  { key: 'available', color: 'green' }
                ]
              };
            } else {
              // Para días con una sola reserva, usar un punto azul
              marcas[fecha] = { 
                marked: true, 
                dotColor: colors.primary,
                // Añadir dots para mostrar disponibilidad
                dots: [
                  { key: 'occupied', color: colors.primary },
                  { key: 'available', color: 'green' }
                ]
              };
            }
          } else {
            // Días completamente disponibles (sin reservas)
            marcas[fecha] = { 
              marked: true, 
              dotColor: 'green'
            };
          }
          
          // Añadir información sobre disponibilidad en la descripción
          if (horariosDisponibles > 0) {
            marcas[fecha] = {
              ...marcas[fecha],
              description: `${horariosDisponibles} horarios disponibles`
            };
          } else {
            marcas[fecha] = {
              ...marcas[fecha],
              description: 'No hay horarios disponibles',
              disabled: true
            };
          }
        });
        
        // Si el día seleccionado actual está en el calendario, mantenerlo seleccionado
        const fechaSeleccionada = selectedDate.toISOString().split('T')[0];
        if (fechaSeleccionada) {
          if (marcas[fechaSeleccionada]) {
            // Si ya existe una marca para esta fecha, añadir la selección
            marcas[fechaSeleccionada] = {
              ...marcas[fechaSeleccionada],
              selected: true,
              selectedColor: colors.primary
            };
          } else {
            // Si no existe, crear una nueva marca con selección
            marcas[fechaSeleccionada] = {
              selected: true,
              selectedColor: colors.primary
            };
          }
        }
        
        setMarkedDates(marcas);
      }
      
      setLoadingData(false);
    } catch (error) {
      console.error('[NuevaReservaScreen] Error general al cargar reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas existentes');
      setLoadingData(false);
    }
  };

  // Función para cargar horarios disponibles
  const fetchHorariosDisponibles = async (empleadoId: number, fecha: Date) => {
    try {
      setLoadingData(true);
      
      // Formatear fecha para la API (YYYY-MM-DD)
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      // Convertir empleadoId a número para comparación segura
      const empId = Number(empleadoId);
      
      // Verificar si hay reservas para esta fecha usando los datos que ya tenemos
      // Filtramos por empleadoId y fecha, sin importar el servicio
      // IMPORTANTE: Solo consideramos reservas que no estén canceladas
      const reservasDelDia = reservasExistentes.filter(reserva => {
        // Convertir el empleadoId de la reserva a número para comparación segura
        const reservaEmpId = Number(reserva.empleadoId);
        // Solo consideramos reservas pendientes o confirmadas, no las canceladas
        return reserva.fecha === fechaFormateada && 
               reservaEmpId === empId && 
               (reserva.estado === 'pendiente' || reserva.estado === 'confirmada'); // Solo considerar reservas activas
      });
      
      console.log(`[NuevaReservaScreen] Verificando horarios para fecha ${fechaFormateada}, encontradas ${reservasDelDia.length} reservas activas`);
      console.log('[NuevaReservaScreen] Detalle de reservas del día:', JSON.stringify(reservasDelDia));
      
      // Crear array de horarios disponibles (de 9:00 a 17:00)
      const horariosBase: HorarioDisponible[] = [
        { hora: '09:00', disponible: true },
        { hora: '10:00', disponible: true },
        { hora: '11:00', disponible: true },
        { hora: '12:00', disponible: true },
        { hora: '13:00', disponible: true },
        { hora: '14:00', disponible: true },
        { hora: '15:00', disponible: true },
        { hora: '16:00', disponible: true },
        { hora: '17:00', disponible: true },
      ];
      
      // Marcar como no disponibles los horarios que ya tienen reserva activa
      // Un empleado no puede tener más de una reserva a la misma hora, sin importar el servicio
      const horariosActualizados = horariosBase.map(horario => {
        // Buscar si existe alguna reserva activa para esta hora específica
        const reservaExistente = reservasDelDia.find(reserva => {
          // Normalizar formato de hora para comparación segura (eliminar segundos si existen)
          const horaReserva = reserva.hora.split(':').slice(0, 2).join(':');
          const horaActual = horario.hora.split(':').slice(0, 2).join(':');
          return horaReserva === horaActual;
        });
        
        return {
          ...horario,
          disponible: !reservaExistente
        };
      });
      
      setHorariosDisponibles(horariosActualizados);
      setLoadingData(false);
    } catch (error) {
      console.error('[NuevaReservaScreen] Error general al cargar horarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
      setLoadingData(false);
    }
  };

  // Función para cargar reseñas de un empleado
  const fetchResenas = async (empleadoId: number) => {
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
      
      console.log(`[NuevaReservaScreen] Consultando reseñas para empleado ${empleadoId}`);
      
      try {
        // Intentar obtener reseñas del backend - ajustamos el endpoint según el esquema de la DB
        const response = await axios.get(`${baseURL}/valoraciones/empleado/${empleadoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log('[NuevaReservaScreen] Reseñas obtenidas:', response.data.length);
        
        // Transformar los datos recibidos al formato que espera nuestra aplicación
        const resenasFormateadas = response.data.map((item: any) => ({
          id: item.id,
          usuarioNombre: item.cliente_nombre || 'Cliente',
          fecha: item.fecha || new Date().toISOString().split('T')[0],
          calificacion: item.valoracion || 5,
          comentario: item.comentario || 'Sin comentario',
          servicioNombre: item.servicio_nombre || 'Servicio'
        }));
        
        setResenas(resenasFormateadas);
        setLoadingData(false);
      } catch (apiError: any) {
        console.error('[NuevaReservaScreen] Error al obtener reseñas de la API:', apiError.message);
        
        // Intentar con un endpoint alternativo
        try {
          const response = await axios.get(`${baseURL}/valoraciones`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': '*/*'
            }
          });
          
          console.log('[NuevaReservaScreen] Reseñas generales obtenidas:', response.data.length);
          
          // Filtrar solo las reseñas del empleado actual
          const resenasEmpleado = response.data.filter((item: any) => 
            item.empleadoId === empleadoId || item.empleado_id === empleadoId
          );
          
          // Transformar los datos filtrados
          const resenasFormateadas = resenasEmpleado.map((item: any) => ({
            id: item.id,
            usuarioNombre: item.cliente_nombre || 'Cliente',
            fecha: item.fecha || new Date().toISOString().split('T')[0],
            calificacion: item.valoracion || 5,
            comentario: item.comentario || 'Sin comentario',
            servicioNombre: item.servicio_nombre || 'Servicio'
          }));
          
          setResenas(resenasFormateadas);
          setLoadingData(false);
        } catch (secondError: any) {
          console.error('[NuevaReservaScreen] Error con endpoints de valoraciones:', secondError.message);
          console.log('[NuevaReservaScreen] Generando datos de ejemplo para reseñas');
          
          // Generar reseñas de ejemplo
          const resenasEjemplo: Resena[] = [
            {
              id: 1,
              usuarioNombre: 'Juan Pérez',
              fecha: '2025-03-15',
              calificacion: 5,
              comentario: 'Excelente servicio, muy profesional y puntual.',
              servicioNombre: 'Corte de Cabello'
            },
            {
              id: 2,
              usuarioNombre: 'María González',
              fecha: '2025-03-10',
              calificacion: 4,
              comentario: 'Muy buen trabajo, lo recomiendo.',
              servicioNombre: 'Manicure'
            },
            {
              id: 3,
              usuarioNombre: 'Carlos Rodríguez',
              fecha: '2025-02-28',
              calificacion: 5,
              comentario: 'Excelente atención y resultado.',
              servicioNombre: 'Corte de Cabello'
            },
            {
              id: 4,
              usuarioNombre: 'Ana López',
              fecha: '2025-02-20',
              calificacion: 3,
              comentario: 'Buen servicio pero tardó más de lo esperado.',
              servicioNombre: 'Tratamiento Facial'
            }
          ];
          
          setResenas(resenasEjemplo);
          setLoadingData(false);
        }
      }
    } catch (error: any) {
      console.error('[NuevaReservaScreen] Error general al cargar reseñas:', error.message);
      
      // Generar reseñas de ejemplo como respaldo final
      const resenasEjemplo: Resena[] = [
        {
          id: 1,
          usuarioNombre: 'Juan Pérez',
          fecha: '2025-03-15',
          calificacion: 5,
          comentario: 'Excelente servicio, muy profesional y puntual.',
          servicioNombre: 'Corte de Cabello'
        },
        {
          id: 2,
          usuarioNombre: 'María González',
          fecha: '2025-03-10',
          calificacion: 4,
          comentario: 'Muy buen trabajo, lo recomiendo.',
          servicioNombre: 'Manicure'
        }
      ];
      
      setResenas(resenasEjemplo);
      setLoadingData(false);
    }
  };

  const handleVerResenas = (empleado: Empleado) => {
    setEmpleadoSeleccionadoResenas(empleado);
    fetchResenas(empleado.id);
    setMostrarResenas(true);
  };

  const handleCerrarResenas = () => {
    setMostrarResenas(false);
    setEmpleadoSeleccionadoResenas(null);
  };

  // Manejar el cambio de mes en el calendario
  const handleMonthChange = (monthData: any) => {
    const { year, month } = monthData;
    // Formatear mes para mostrar (mes con dos dígitos)
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    setMesActual(`${year}-${monthFormatted}`);
  };

  // Manejar la selección de fecha en el calendario
  const handleDateSelect = (date: DateData) => {
    const selectedDateObj = new Date(date.dateString);
    setSelectedDate(selectedDateObj);
    setSelectedTime(null); // Resetear la hora seleccionada

    // Actualizar markedDates para resaltar el día seleccionado
    const newMarkedDates = { ...markedDates };
    
    // Eliminar la selección anterior (si existe)
    Object.keys(newMarkedDates).forEach(key => {
      if (newMarkedDates[key].selected) {
        // Mantener solo la marca si hay reservas
        if (newMarkedDates[key].marked) {
          newMarkedDates[key] = {
            marked: true,
            dotColor: newMarkedDates[key].dotColor
          };
        } else {
          delete newMarkedDates[key];
        }
      }
    });
    
    // Marcar el nuevo día seleccionado
    // Si ya existe una marca para esta fecha, mantener la información de marked y dotColor
    if (newMarkedDates[date.dateString]) {
      newMarkedDates[date.dateString] = {
        ...newMarkedDates[date.dateString],
        selected: true,
        selectedColor: colors.primary
      };
    } else {
      newMarkedDates[date.dateString] = {
        selected: true,
        selectedColor: colors.primary
      };
    }
    
    setMarkedDates(newMarkedDates);
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
      setLoading(true);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[NuevaReservaScreen] No se encontró token de autenticación');
        Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      // Validar que se hayan seleccionado todos los datos necesarios
      if (!selectedService || !selectedEmployee || !selectedTime) {
        Alert.alert('Error', 'Por favor complete todos los campos requeridos');
        setLoading(false);
        return;
      }
      
      // Convertir empleadoId a número para comparación segura
      const empId = Number(selectedEmployee);
      
      // Verificar si ya existe una reserva para este empleado en esta fecha y hora
      const reservaExistente = reservasExistentes.find(reserva => {
        // Convertir el empleadoId de la reserva a número para comparación segura
        const reservaEmpId = Number(reserva.empleadoId);
        
        // Formatear la fecha para comparación
        const fechaReserva = reserva.fecha;
        const fechaSeleccionada = selectedDate.toISOString().split('T')[0];
        
        // Normalizar formato de hora para comparación segura
        const horaReserva = reserva.hora.split(':').slice(0, 2).join(':');
        const horaSeleccionada = selectedTime.split(':').slice(0, 2).join(':');
        
        return fechaReserva === fechaSeleccionada && 
               horaReserva === horaSeleccionada && 
               reservaEmpId === empId &&
               (reserva.estado === 'pendiente' || reserva.estado === 'confirmada'); // Solo considerar reservas activas
      });
      
      if (reservaExistente) {
        Alert.alert(
          'Horario no disponible', 
          'Este horario ya no está disponible. Por favor seleccione otro horario.',
          [{ text: 'OK', onPress: () => setSelectedTime(null) }]
        );
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
      
      // Obtener datos del usuario y cliente
      const userData = await AsyncStorage.getItem('@user');
      if (!userData) {
        Alert.alert('Error', 'No se encontraron datos del usuario');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      console.log('[NuevaReservaScreen] Datos de usuario:', user);
      
      // Verificar si el usuario tiene un cliente_id válido
      if (!user.cliente_id) {
        console.log('[NuevaReservaScreen] El usuario no tiene cliente_id asociado');
        
        // Intentar obtener el perfil del usuario para verificar si tiene un cliente asociado
        try {
          const perfilResponse = await axios.get(`${baseURL}/usuarios/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': '*/*'
            }
          });
          
          console.log('[NuevaReservaScreen] Perfil de usuario:', perfilResponse.data);
          
          // Actualizar el cliente_id si está disponible
          if (perfilResponse.data.cliente_id) {
            user.cliente_id = perfilResponse.data.cliente_id;
            await AsyncStorage.setItem('@user', JSON.stringify(user));
            console.log('[NuevaReservaScreen] cliente_id actualizado:', user.cliente_id);
          } else {
            // El usuario no tiene un cliente asociado, mostrar mensaje
            Alert.alert(
              'Perfil Incompleto',
              'Necesitas completar tu perfil de cliente antes de hacer una reserva.',
              [
                {
                  text: 'Ir a Perfil',
                  onPress: () => navigation.navigate('Perfil' as never)
                },
                {
                  text: 'Cancelar',
                  style: 'cancel'
                }
              ]
            );
            setLoading(false);
            return;
          }
        } catch (perfilError: any) {
          console.error('[NuevaReservaScreen] Error al obtener perfil:', perfilError.response?.data);
          Alert.alert('Error', 'No se pudo verificar tu perfil de cliente. Por favor completa tu perfil antes de hacer una reserva.');
          setLoading(false);
          return;
        }
      }
      
      // Crear el objeto de reserva con el cliente_id correcto
      const reservaData: ReservaData = {
        clienteId: user.cliente_id || userId, // Usar cliente_id si está disponible
        empleadoId: selectedEmployee,
        servicioId: selectedService,
        fecha: formattedDate,
        hora: selectedTime,
        estado: 'pendiente',
        tiendaId: servicioSeleccionado.tiendaId
      };
      
      console.log('[NuevaReservaScreen] Creando reserva:', reservaData);
      
      // Intentar crear la reserva
      try {
        console.log('[NuevaReservaScreen] Intentando crear reserva en /reservas');
        const response = await axios.post(`${baseURL}/reservas`, reservaData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log('[NuevaReservaScreen] Reserva creada exitosamente:', response.data);
        
        // Añadir la nueva reserva a nuestro estado local para que se refleje inmediatamente
        setReservasExistentes([...reservasExistentes, {
          id: response.data.id || Date.now(),
          fecha: formattedDate,
          hora: selectedTime,
          empleadoId: selectedEmployee,
          estado: 'pendiente'
        }]);
        
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
      } catch (error: any) {
        console.error('[NuevaReservaScreen] Error al crear reserva:', error.response?.status, error.response?.data);
        
        // Manejar el error específico de cliente no encontrado
        if (error.response?.data?.message?.includes('Cliente con ID') && error.response?.data?.message?.includes('no encontrado')) {
          Alert.alert(
            'Perfil Incompleto',
            'Necesitas completar tu perfil de cliente antes de hacer una reserva.',
            [
              {
                text: 'Ir a Perfil',
                onPress: () => navigation.navigate('Perfil' as never)
              },
              {
                text: 'Cancelar',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Error', 'No se pudo crear la reserva. Por favor intente nuevamente.');
        }
      }
    } catch (error) {
      console.error('[NuevaReservaScreen] Error general al crear reserva:', error);
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
    // Obtener el servicio seleccionado
    const servicioSeleccionado = servicios.find(s => s.id === selectedService);
    
    // Obtener el empleado seleccionado
    const empleadoSeleccionado = empleados.find(e => e.id === selectedEmployee);
    
    console.log('[NuevaReservaScreen] renderStep - currentStep:', currentStep);
    console.log('[NuevaReservaScreen] renderStep - servicios:', servicios.length);
    
    if (loadingData && currentStep === 1) {
      return (
        <View style={styles.contentSection}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      );
    }

    switch (currentStep) {
      case 1:
        // Paso 1: Selección de servicio
        console.log('[NuevaReservaScreen] Renderizando paso 1 - servicios:', servicios.length);
        return (
          <View style={styles.contentSection}>
            <ServiceList
              servicios={servicios}
              selectedService={selectedService}
              onSelectService={setSelectedService}
              loading={loading}
            />
          </View>
        );
      case 2:
        // Paso 2: Selección de profesional
        return (
          <View style={styles.contentSection}>
            <EmployeeList
              empleados={empleados}
              selectedEmpleadoId={selectedEmployee}
              onSelectEmpleado={handleSelectEmpleado}
              loading={loading}
            />
          </View>
        );
      case 3:
        // Paso 3: Selección de fecha y hora
        return (
          <View style={styles.contentSection}>
            <Text style={styles.subtitle}>Selecciona una fecha y hora para tu reserva:</Text>
            
            {/* Calendario para seleccionar fecha */}
            <ReservationCalendar
              markedDates={markedDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              loading={loading}
            />
            
            {/* Lista de horarios disponibles */}
            <TimeSlotList
              horarios={horariosDisponibles}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              loading={loading}
            />
            
            {/* Mostrar resumen de la reserva si se ha seleccionado una hora */}
            {selectedTime && (
              <ReservationSummary
                serviceName={servicioSeleccionado?.nombre || 'Servicio no disponible'}
                employeeName={`${empleadoSeleccionado?.nombres || ''} ${empleadoSeleccionado?.apellidos || ''}`}
                date={selectedDate.toISOString().split('T')[0]}
                time={selectedTime}
                price={servicioSeleccionado?.precio}
              />
            )}
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

  // Función para formatear el precio
  const formatPrice = (price: any): string => {
    if (typeof price === 'number') {
      return price.toFixed(2);
    } else if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price : numPrice.toFixed(2);
    } else {
      return '0.00';
    }
  };

  // Modal para mostrar reseñas
  const renderResenasModal = () => (
    <ResenasModal
      visible={mostrarResenas}
      empleadoNombre={empleadoSeleccionadoResenas?.nombres || ''}
      resenas={resenas}
      onClose={handleCerrarResenas}
      loading={loadingData}
    />
  );

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para verificar si se puede proceder al siguiente paso
  const canProceed = () => {
    if (currentStep === 1) return selectedService !== null;
    if (currentStep === 2) return selectedEmployee !== null;
    if (currentStep === 3) return selectedDate !== null && selectedTime !== null;
    return false;
  };

  // Función para refrescar los datos
  const handleRefresh = () => {
    if (currentStep === 1) {
      fetchServicios();
    } else if (currentStep === 2 && selectedService) {
      fetchEmpleados(selectedService);
    } else if (currentStep === 3 && selectedEmployee) {
      fetchHorariosDisponibles(selectedEmployee, selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Pasos de la reserva */}
      <ReservationSteps currentStep={currentStep} />
      
      {/* Contenido del paso actual */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.stepContainer}>
          {renderStep()}
        </View>
      </ScrollView>
      
      {/* Botones de navegación */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={3}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        loading={loading}
        isLastStep={currentStep === 3}
      />
      
      {/* Modal de reseñas */}
      <Modal
        visible={mostrarResenas}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCerrarResenas}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Reseñas de {empleadoSeleccionadoResenas?.nombres} {empleadoSeleccionadoResenas?.apellidos}
              </Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={handleCerrarResenas}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {loadingData ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : resenas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={48} color={colors.primary} />
                <Text style={styles.emptyText}>
                  No hay reseñas disponibles para este profesional.
                </Text>
              </View>
            ) : (
              <FlatList
                data={resenas}
                renderItem={({ item }) => (
                  <View style={styles.resenaItem}>
                    <View style={styles.resenaHeader}>
                      <Text style={styles.resenaUsuario}>{item.usuarioNombre}</Text>
                      <Text style={styles.resenaFecha}>{item.fecha}</Text>
                    </View>
                    <View style={styles.resenaCalificacion}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < item.calificacion ? "star" : "star-outline"}
                          size={16}
                          color="#FFD700"
                        />
                      ))}
                      {item.servicioNombre && (
                        <Text style={styles.resenaServicio}>• {item.servicioNombre}</Text>
                      )}
                    </View>
                    <Text style={styles.resenaComentario}>{item.comentario}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resenasList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 20,
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#000000',
  },
  // Estilos para el modal de reseñas
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeModalButton: {
    padding: 5,
 },
  resenasList: {
    paddingBottom: 20,
  },
  resenaItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resenaUsuario: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  resenaFecha: {
    fontSize: 14,
    color: '#000000',
  },
  resenaCalificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resenaServicio: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  resenaComentario: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
});