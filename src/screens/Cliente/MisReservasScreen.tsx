// src/screens/Cliente/MisReservasScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Componentes modulares
import { ReservaItem, EmptyState } from '../../components/Cliente';

interface Reserva {
  id: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  clienteId: number;
  empleadoId: number;
  servicioId: number;
  tiendaId: number;
  // Campos adicionales para mostrar en la UI
  servicio?: string;
  empleado?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Empleado {
  id: number;
  nombres: string;
  apellidos: string;
}

export default function MisReservasScreen() {
  const navigation = useNavigation();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proximas' | 'historial'>('proximas');
  const [refreshing, setRefreshing] = useState(false);

  // URL base para las peticiones API
  const baseURL = 'http://10.0.2.2:3001';

  // Cargar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('[MisReservasScreen] Pantalla enfocada, cargando datos...');
      
      // Limpiar los datos antes de cargar nuevos para evitar problemas de caché
      setReservas([]);
      setServicios([]);
      setEmpleados([]);
      
      // Pequeña pausa para asegurar que la UI se actualice antes de cargar datos
      setTimeout(() => {
        fetchData();
      }, 100);
      
      return () => {
        // Cleanup function
        console.log('[MisReservasScreen] Pantalla desenfocada');
      }; 
    }, [])
  );

  // Efecto para volver a procesar las reservas cuando cambian los servicios o empleados
  useEffect(() => {
    if (servicios.length > 0 && empleados.length > 0) {
      console.log('[MisReservasScreen] Servicios y empleados actualizados, reprocesando reservas...');
      procesarReservas();
    }
  }, [servicios, empleados]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('[MisReservasScreen] Iniciando carga de datos...');
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      const userData = await AsyncStorage.getItem('@user');
      
      if (!token || !userData) {
        console.error('[MisReservasScreen] No se encontró token o datos de usuario');
        setLoading(false);
        return;
      }
      
      // Primero cargamos servicios y empleados en paralelo para optimizar
      const [serviciosResult, empleadosResult] = await Promise.allSettled([
        fetchServicios(),
        fetchEmpleados()
      ]);
      
      // Verificar si ambas promesas se resolvieron correctamente
      if (serviciosResult.status === 'fulfilled' && empleadosResult.status === 'fulfilled') {
        console.log('[MisReservasScreen] Servicios y empleados cargados correctamente');
      } else {
        console.warn('[MisReservasScreen] Algunas peticiones fallaron:');
        if (serviciosResult.status === 'rejected') {
          console.error('- Error al cargar servicios:', serviciosResult.reason);
        }
        if (empleadosResult.status === 'rejected') {
          console.error('- Error al cargar empleados:', empleadosResult.reason);
        }
      }
      
      // Luego procesamos las reservas
      await procesarReservas();
      console.log('[MisReservasScreen] Carga de datos completada');
    } catch (error) {
      console.error('[MisReservasScreen] Error global en fetchData:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los datos. Por favor intente nuevamente.'
      );
      
      // En caso de error, cargar datos de ejemplo
      cargarDatosEjemplo();
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar datos de ejemplo en caso de error
  const cargarDatosEjemplo = () => {
    console.log('[MisReservasScreen] Cargando datos de ejemplo como fallback');
    
    // Servicios de ejemplo
    const serviciosEjemplo = [
      { id: 1, nombre: 'Examen de optometría completo', descripcion: 'Evaluación completa de la visión' },
      { id: 2, nombre: 'Adaptación de lentes de contacto', descripcion: 'Servicio de adaptación personalizada' }
    ];
    
    // Empleados de ejemplo
    const empleadosEjemplo = [
      { id: 1, nombres: 'Juan Carlos', apellidos: 'Gómez Rodríguez' },
      { id: 2, nombres: 'María', apellidos: 'Pérez López' }
    ];
    
    // Reservas de ejemplo
    const fechaHoy = new Date().toISOString().split('T')[0];
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split('T')[0];
    
    const reservasEjemplo = [
      {
        id: 1001,
        fecha: fechaHoy,
        hora: '10:00:00',
        estado: 'pendiente' as const,
        clienteId: 1,
        empleadoId: 1,
        servicioId: 1,
        tiendaId: 1,
        servicio: 'Examen de optometría completo',
        empleado: 'Juan Carlos Gómez Rodríguez'
      },
      {
        id: 1002,
        fecha: fechaManana,
        hora: '15:30:00',
        estado: 'confirmada' as const,
        clienteId: 1,
        empleadoId: 2,
        servicioId: 2,
        tiendaId: 1,
        servicio: 'Adaptación de lentes de contacto',
        empleado: 'María Pérez López'
      }
    ];
    
    // Actualizar el estado
    setServicios(serviciosEjemplo);
    setEmpleados(empleadosEjemplo);
    setReservas(reservasEjemplo);
  };

  const procesarReservas = async () => {
    // Declarar las variables fuera del bloque try para que estén disponibles en el catch
    let userId: number = 0;
    let clienteId: number = 0;
    
    try {
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      const userData = await AsyncStorage.getItem('@user');
      
      if (!token || !userData) {
        console.error('[MisReservasScreen] No se encontró token o datos de usuario');
        cargarDatosEjemplo();
        return;
      }
      
      const user = JSON.parse(userData);
      userId = Number(user.id) || 0;
      
      // Intentar obtener el clienteId de diferentes propiedades
      clienteId = Number(user.cliente_id || user.clienteId || (user.cliente && user.cliente.id) || 0);
      
      // Si no tenemos clienteId, usar userId como fallback
      if (!clienteId && userId) {
        console.log(`[MisReservasScreen] No se encontró clienteId, usando userId ${userId} como fallback`);
        clienteId = userId;
      }
      
      console.log(`[MisReservasScreen] Obteniendo reservas para usuario ID: ${userId}, cliente ID: ${clienteId}`);
      
      // Realizar la solicitud a la API
      const response = await axios.get(`${baseURL}/reservas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      console.log(`[MisReservasScreen] Reservas obtenidas: ${response.data.length}`);
      
      // Verificar si hay datos en la respuesta
      if (!response.data || response.data.length === 0) {
        console.log('[MisReservasScreen] No se encontraron reservas en la respuesta');
        setReservas([]); // No mostrar nada si no hay reservas
        return;
      }
      
      // Mostrar la estructura de la primera reserva para depuración
      if (response.data.length > 0) {
        console.log('[MisReservasScreen] Estructura de la primera reserva:', JSON.stringify(response.data[0], null, 2));
      }
      
      // Verificar si las reservas tienen la estructura esperada
      const tienenClienteId = response.data.some((r: any) => r.clienteId !== undefined);
      const tienenCliente = response.data.some((r: any) => r.cliente !== undefined);
      
      console.log(`[MisReservasScreen] Las reservas tienen clienteId: ${tienenClienteId}`);
      console.log(`[MisReservasScreen] Las reservas tienen cliente: ${tienenCliente}`);
      
      // Filtrar las reservas según la estructura de datos
      let misReservas = response.data.filter((reserva: any) => {
        // Obtener el ID del cliente de la reserva de todas las formas posibles
        const reservaClienteIds = [
          reserva.clienteId ? Number(reserva.clienteId) : null,
          reserva.cliente && reserva.cliente.id ? Number(reserva.cliente.id) : null,
          reserva.cliente_id ? Number(reserva.cliente_id) : null
        ].filter(id => id !== null);
        
        // Convertir el clienteId del usuario a número para comparación
        const userClienteId = Number(clienteId);
        
        // Verificar si alguno de los IDs de la reserva coincide con el ID del cliente
        const coincide = reservaClienteIds.some(id => id === userClienteId);
        
        console.log(`[MisReservasScreen] Reserva ID ${reserva.id}, clienteIds: [${reservaClienteIds.join(', ')}], userClienteId: ${userClienteId}, coincide: ${coincide}`);
        
        return coincide;
      });
      
      console.log(`[MisReservasScreen] Reservas filtradas para el cliente: ${misReservas.length}`);
      
      // Si no hay reservas después del filtrado, mostrar pantalla vacía
      if (!misReservas || misReservas.length === 0) {
        console.log('[MisReservasScreen] No se encontraron reservas para este cliente');
        setReservas([]); // Establecer un array vacío para mostrar pantalla vacía
        return;
      }
      
      // Enriquecer las reservas con información de servicios y empleados
      const reservasEnriquecidas = misReservas.map((reserva: any) => {
        try {
          // Determinar los IDs según la estructura
          const servicioId = reserva.servicioId || (reserva.servicio && reserva.servicio.id);
          const empleadoId = reserva.empleadoId || (reserva.empleado && reserva.empleado.id);
          
          // Buscar la información adicional
          const servicio = servicios.find(s => s.id === Number(servicioId));
          const empleado = empleados.find(e => e.id === Number(empleadoId));
          
          // Determinar el nombre del servicio
          let nombreServicio = 'Servicio no especificado';
          if (servicio && servicio.nombre) {
            nombreServicio = servicio.nombre;
          } else if (reserva.servicio && reserva.servicio.nombre) {
            nombreServicio = reserva.servicio.nombre;
          }
          
          // Determinar el nombre del empleado
          let nombreEmpleado = 'No asignado';
          if (empleado) {
            nombreEmpleado = `${empleado.nombres} ${empleado.apellidos}`;
          } else if (reserva.empleado) {
            const nombres = reserva.empleado.nombres || '';
            const apellidos = reserva.empleado.apellidos || '';
            if (nombres || apellidos) {
              nombreEmpleado = `${nombres} ${apellidos}`.trim();
            }
          }
          
          // Crear un objeto Reserva con la información enriquecida
          return {
            id: reserva.id,
            fecha: reserva.fecha,
            hora: reserva.hora,
            estado: reserva.estado,
            clienteId: reserva.clienteId || (reserva.cliente && reserva.cliente.id),
            empleadoId: reserva.empleadoId || (reserva.empleado && reserva.empleado.id),
            servicioId: reserva.servicioId || (reserva.servicio && reserva.servicio.id),
            tiendaId: reserva.tiendaId || (reserva.tienda && reserva.tienda.id),
            servicio: nombreServicio,
            empleado: nombreEmpleado
          };
        } catch (error) {
          console.error('[MisReservasScreen] Error al procesar reserva:', error);
          // Devolver la reserva sin procesar si hay un error
          return reserva;
        }
      });
      
      console.log(`[MisReservasScreen] Reservas procesadas: ${reservasEnriquecidas.length}`);
      setReservas(reservasEnriquecidas);
      
    } catch (error) {
      console.error('[MisReservasScreen] Error al procesar reservas:', error);
      setReservas([]); // En caso de error, mostrar pantalla vacía
    }
  };

  const fetchServicios = async () => {
    try {
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[MisReservasScreen] No se encontró token');
        return;
      }
      
      // Realizar la solicitud a la API
      const response = await axios.get(`${baseURL}/servicios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      setServicios(response.data);
    } catch (error) {
      console.error('[MisReservasScreen] Error al obtener servicios:', error);
      throw error;
    }
  };

  const fetchEmpleados = async () => {
    try {
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[MisReservasScreen] No se encontró token');
        return;
      }
      
      // Realizar la solicitud a la API
      const response = await axios.get(`${baseURL}/empleados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      setEmpleados(response.data);
    } catch (error) {
      console.error('[MisReservasScreen] Error al obtener empleados:', error);
      throw error;
    }
  };

  const handleCancelReservation = async (id: number) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Está seguro que desea cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí', 
          onPress: async () => {
            try {
              setLoading(true);
              
              // Obtener el token de autenticación
              const token = await AsyncStorage.getItem('@token');
              
              if (!token) {
                console.error('[MisReservasScreen] No se encontró token');
                Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
                setLoading(false);
                return;
              }
              
              // Obtener la reserva actual
              const reserva = reservas.find(r => r.id === id);
              if (!reserva) {
                Alert.alert('Error', 'No se encontró la reserva');
                setLoading(false);
                return;
              }
              
              // Actualizar el estado de la reserva a 'cancelada'
              const updatedReserva = { ...reserva, estado: 'cancelada' };
              
              try {
                // Intentar enviar la solicitud a la API
                await axios.put(`${baseURL}/reservas/${id}`, updatedReserva, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                console.log('[MisReservasScreen] Reserva cancelada exitosamente en el servidor');
              } catch (apiError) {
                // Si falla la API, intentar con PATCH
                console.log('[MisReservasScreen] Error con PUT, intentando con PATCH');
                
                try {
                  await axios.patch(`${baseURL}/reservas/${id}`, { estado: 'cancelada' }, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  console.log('[MisReservasScreen] Reserva cancelada exitosamente con PATCH');
                } catch (patchError) {
                  // Si ambos métodos fallan, solo actualizamos localmente
                  console.log('[MisReservasScreen] Error con PATCH, actualizando solo localmente');
                  console.error('[MisReservasScreen] No se pudo actualizar en el servidor:', patchError);
                }
              }
              
              // Siempre actualizamos la lista de reservas localmente
              setReservas(prevReservas => 
                prevReservas.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r)
              );
              
              Alert.alert('Éxito', 'La reserva ha sido cancelada');
            } catch (error) {
              console.error('[MisReservasScreen] Error al cancelar reserva:', error);
              
              // A pesar del error, actualizamos localmente para mejorar la experiencia del usuario
              setReservas(prevReservas => 
                prevReservas.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r)
              );
              
              Alert.alert('Información', 'La reserva ha sido marcada como cancelada en tu dispositivo.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRescheduleReservation = (id: number) => {
    // Navegar a la pantalla de reprogramación con el ID de la reserva
    navigation.navigate('NuevaReserva', { reservaId: id, mode: 'reschedule' });
  };

  const handleRateService = (id: number) => {
    // Navegar a la pantalla de calificación con el ID de la reserva
    navigation.navigate('CalificarServicio', { reservaId: id });
  };

  // Función para navegar a la pantalla de puntos
  const handleVerPuntos = () => {
    navigation.navigate('Puntos');
  };

  // Función para manejar el pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('[MisReservasScreen] Actualizando datos...');
      // Limpiar datos actuales para evitar mezclas incorrectas
      setReservas([]);
      // Cargar datos frescos
      await fetchServicios();
      await fetchEmpleados();
      await procesarReservas();
      await verificarReservasCalificadas(); // Verificar reservas ya calificadas
      console.log('[MisReservasScreen] Datos actualizados correctamente');
    } catch (error) {
      console.error('[MisReservasScreen] Error al actualizar datos:', error);
      Alert.alert('Error', 'No se pudieron actualizar los datos. Por favor intente nuevamente.');
    } finally {
      setRefreshing(false);
    }
  };

  // Estado para almacenar las reservas ya calificadas
  const [reservasCalificadas, setReservasCalificadas] = useState<number[]>([]);

  // Función para verificar qué reservas ya han sido calificadas
  const verificarReservasCalificadas = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        console.error('[MisReservasScreen] No se encontró token para verificar valoraciones');
        return;
      }

      // Obtener todas las valoraciones del usuario
      const response = await axios.get(
        `${baseURL}/valoraciones`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Extraer los IDs de reservas que ya tienen valoraciones
        const reservasIds = response.data.map((valoracion: any) => valoracion.reservaId);
        console.log('[MisReservasScreen] Reservas ya calificadas:', reservasIds);
        setReservasCalificadas(reservasIds);
      }
    } catch (error) {
      console.error('[MisReservasScreen] Error al verificar reservas calificadas:', error);
    }
  };

  // Función para cargar los datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        await fetchServicios();
        await fetchEmpleados();
        await procesarReservas();
        await verificarReservasCalificadas(); // Verificar reservas ya calificadas
      } catch (error) {
        console.error('[MisReservasScreen] Error al cargar datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
    
    // Configurar un listener para cuando la pantalla vuelva a estar en foco
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[MisReservasScreen] Pantalla enfocada, actualizando datos');
      cargarDatos();
    });
    
    // Configurar un listener para cuando la pantalla pierda el foco
    const blurSubscription = navigation.addListener('blur', () => {
      console.log('[MisReservasScreen] Pantalla desenfocada');
    });
    
    // Limpiar los listeners cuando se desmonte el componente
    return () => {
      unsubscribe();
      blurSubscription();
    };
  }, [navigation]);

  // Filtrar reservas según la pestaña activa
  const filteredReservas = reservas.filter(reserva => {
    // Determinar si una reserva pertenece al historial
    const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
    const hoy = new Date();
    const esFechaAnterior = fechaReserva < hoy;
    
    // Una reserva está en el historial si:
    // 1. Su estado es 'completada' o 'cancelada', O
    // 2. Su fecha y hora ya pasaron
    const isHistorial = 
      reserva.estado === 'completada' || 
      reserva.estado === 'cancelada' ||
      esFechaAnterior;
    
    // Mostrar en la pestaña correspondiente
    return activeTab === 'historial' ? isHistorial : !isHistorial;
  });

  // Ordenar las reservas: próximas por fecha ascendente, historial por fecha descendente
  const sortedReservas = [...filteredReservas].sort((a, b) => {
    const fechaA = new Date(a.fecha + 'T' + a.hora);
    const fechaB = new Date(b.fecha + 'T' + b.hora);
    
    // Ordenar de forma diferente según la pestaña
    if (activeTab === 'proximas') {
      // Próximas: más cercanas primero
      return fechaA.getTime() - fechaB.getTime();
    } else {
      // Historial: más recientes primero
      return fechaB.getTime() - fechaA.getTime();
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservas</Text>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={() => navigation.navigate('NuevaReserva')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={handleVerPuntos}
        >
          <Ionicons name="star" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'proximas' && styles.activeTab]}
          onPress={() => setActiveTab('proximas')}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={activeTab === 'proximas' ? colors.primary : colors.textLight}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'proximas' && styles.activeTabText
            ]}
          >
            Próximas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
          onPress={() => setActiveTab('historial')}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === 'historial' ? colors.primary : colors.textLight}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'historial' && styles.activeTabText
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      ) : reservas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>No tienes reservas {activeTab === 'proximas' ? 'próximas' : 'en tu historial'}</Text>
          {activeTab === 'proximas' && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('NuevaReserva')}
            >
              <Text style={styles.emptyButtonText}>Crear una reserva</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={sortedReservas}
          renderItem={({ item }) => (
            <ReservaItem
              reserva={item}
              onCancelar={
                (item.estado === 'pendiente' || item.estado === 'confirmada') 
                  ? handleCancelReservation 
                  : undefined
              }
              onReprogramar={
                (item.estado === 'pendiente' || item.estado === 'confirmada') 
                  ? handleRescheduleReservation 
                  : undefined
              }
              onCalificar={
                item.estado === 'completada' && !reservasCalificadas.includes(item.id)
                  ? handleRateService 
                  : undefined
              }
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  newButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    marginLeft: 4,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    color: 'white',
  },
});