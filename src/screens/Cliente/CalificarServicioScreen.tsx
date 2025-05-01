// src/screens/Cliente/CalificarServicioScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getReservaById } from '../../api/reservas.api';
import { getServicioById } from '../../api/servicios.api';
import { getEmpleadoById } from '../../api/empleados.api';
import { createValoracion, Valoracion } from '../../api/valoraciones.api';
import { ValoracionEstrellas } from '../../components/Cliente/ValoracionEstrellas';
import axios from 'axios';
import { ApiService } from '../../api/client';
import { Reserva as ReservaAPI } from '../../interfaces/Reserva';
import { registrarPuntosServicio } from '../../api/puntos.api';

// Definir la interfaz para los parámetros de la ruta
interface RouteParams {
  reservaId: number;
}

// Definir la interfaz para los datos de la reserva procesados para la UI
interface ReservaUI {
  id: string | number;
  fecha: string;
  hora: string;
  estado: string;
  clienteId: string | number;
  empleadoId: string | number;
  servicioId: string | number;
  tiendaId?: string | number;
  servicio?: string;
  empleado?: string;
}

// Interfaz extendida para el empleado que maneja ambos formatos de nombres
interface EmpleadoExtendido {
  id: string | number;
  nombre?: string;
  apellido?: string;
  nombres?: string;
  apellidos?: string;
  // Otros campos que pueda tener el empleado
}

export default function CalificarServicioScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const reservaId = params?.reservaId;

  const [reserva, setReserva] = useState<ReservaUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState('');
  const [clienteId, setClienteId] = useState<number | null>(null);

  useEffect(() => {
    // Obtener el ID del cliente del almacenamiento local
    const getClienteId = async () => {
      try {
        // Intentar obtener el ID del cliente de diferentes fuentes
        const userData = await AsyncStorage.getItem('@userData');
        const userJson = await AsyncStorage.getItem('@user');
        
        console.log('[CalificarServicioScreen] userData:', userData);
        console.log('[CalificarServicioScreen] userJson:', userJson);
        
        // Primero intentar con @userData
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            console.log('[CalificarServicioScreen] parsedData:', parsedData);
            
            if (parsedData.clienteId) {
              console.log('[CalificarServicioScreen] Usando clienteId de @userData:', parsedData.clienteId);
              setClienteId(Number(parsedData.clienteId));
              return;
            }
          } catch (parseError) {
            console.error('[CalificarServicioScreen] Error al parsear @userData:', parseError);
          }
        }
        
        // Luego intentar con @user
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            console.log('[CalificarServicioScreen] user:', user);
            
            // Verificar diferentes propiedades donde podría estar el ID del cliente
            const possibleClienteId = user.cliente_id || user.clienteId || (user.cliente && user.cliente.id);
            
            if (possibleClienteId) {
              console.log('[CalificarServicioScreen] Usando clienteId de @user:', possibleClienteId);
              setClienteId(Number(possibleClienteId));
              return;
            }
            
            // Si no hay cliente_id pero hay id, usar ese como fallback
            if (user.id) {
              console.log('[CalificarServicioScreen] Usando id de usuario como clienteId:', user.id);
              setClienteId(Number(user.id));
              return;
            }
          } catch (parseError) {
            console.error('[CalificarServicioScreen] Error al parsear @user:', parseError);
          }
        }
        
        // Si llegamos aquí, no se pudo obtener el ID del cliente
        console.error('[CalificarServicioScreen] No se pudo obtener el ID del cliente');
        Alert.alert('Advertencia', 'No se pudo obtener tu ID de cliente. Algunas funciones pueden no estar disponibles.');
      } catch (error) {
        console.error('[CalificarServicioScreen] Error al obtener ID del cliente:', error);
      }
    };

    getClienteId();
    fetchReservaDetails();
  }, [reservaId]);

  const fetchReservaDetails = async () => {
    try {
      setLoading(true);
      
      // Obtener detalles de la reserva usando la API
      const reservaData: ReservaAPI = await getReservaById(reservaId);
      
      if (reservaData) {
        // Extraer el nombre del empleado considerando diferentes estructuras de datos
        let nombreEmpleado = 'Profesional';
        
        if (reservaData.empleado) {
          // Tratar el empleado como EmpleadoExtendido para acceder a ambos formatos de nombres
          const emp = reservaData.empleado as unknown as EmpleadoExtendido;
          // Manejar diferentes estructuras (nombre/apellido o nombres/apellidos)
          const nombre = emp.nombre || emp.nombres || '';
          const apellido = emp.apellido || emp.apellidos || '';
          
          if (nombre || apellido) {
            nombreEmpleado = `${nombre} ${apellido}`.trim();
          }
        }
        
        // Transformar la reserva de la API al formato que necesita la UI
        const reservaUI: ReservaUI = {
          id: reservaData.id,
          fecha: reservaData.fecha,
          hora: reservaData.hora,
          estado: reservaData.estado,
          clienteId: reservaData.cliente.id,
          empleadoId: reservaData.empleado.id,
          servicioId: reservaData.servicio.id,
          servicio: reservaData.servicio.nombre,
          empleado: nombreEmpleado
        };
        
        setReserva(reservaUI);
      } else {
        Alert.alert('Error', 'No se pudo cargar la información de la reserva');
      }
    } catch (error) {
      console.error('[CalificarServicioScreen] Error al cargar detalles de la reserva:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el precio del servicio
  const obtenerPrecioServicio = async (servicioId: number): Promise<number> => {
    try {
      console.log(`[CalificarServicioScreen] Obteniendo precio del servicio ID: ${servicioId}`);
      
      // Obtener el token para la autenticación
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        console.error('[CalificarServicioScreen] No se encontró token para obtener precio del servicio');
        return 100; // Precio por defecto
      }
      
      // Obtener los detalles del servicio
      const response = await axios.get(
        `${ApiService.getBaseUrl()}/servicios/${servicioId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.precio) {
        console.log(`[CalificarServicioScreen] Precio del servicio obtenido: ${response.data.precio}`);
        return Number(response.data.precio);
      } else {
        console.warn('[CalificarServicioScreen] No se pudo obtener el precio del servicio, usando precio por defecto');
        return 100; // Precio por defecto
      }
    } catch (error) {
      console.error('[CalificarServicioScreen] Error al obtener precio del servicio:', error);
      return 100; // Precio por defecto en caso de error
    }
  };

  const handleSubmitRating = async () => {
    // Verificar que tenemos todos los datos necesarios
    if (!reserva) {
      Alert.alert('Error', 'No se encontró información de la reserva');
      return;
    }
    
    // Si no tenemos clienteId, intentar obtenerlo de la reserva
    let clienteIdToUse = clienteId;
    if (!clienteIdToUse && reserva.clienteId) {
      console.log('[CalificarServicioScreen] Usando clienteId de la reserva:', reserva.clienteId);
      clienteIdToUse = Number(reserva.clienteId);
    }
    
    if (!clienteIdToUse) {
      Alert.alert('Error', 'No se pudo identificar al cliente. Por favor, inténtalo de nuevo más tarde.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Preparar los datos de la valoración
      const valoracionData: Omit<Valoracion, 'id'> = {
        reservaId: Number(reserva.id),
        clienteId: Number(clienteIdToUse),
        empleadoId: Number(reserva.empleadoId),
        servicioId: Number(reserva.servicioId),
        valoracion: rating,
        comentario: comentario.trim(),
        fecha: new Date().toISOString().split('T')[0]
      };
      
      console.log('[CalificarServicioScreen] Enviando valoración:', valoracionData);
      
      // Obtener el token para la autenticación
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación');
        setSubmitting(false);
        return;
      }
      
      let valoracionExitosa = false;
      
      try {
        // Intentar enviar la valoración usando la API
        const response = await createValoracion(valoracionData);
        console.log('[CalificarServicioScreen] Respuesta de valoración:', response);
        valoracionExitosa = true;
      } catch (apiError: any) {
        console.error('[CalificarServicioScreen] Error al enviar valoración:', apiError);
        
        // Verificar si es un error de conflicto (valoración ya existente)
        if (apiError.response && apiError.response.status === 409) {
          console.log('[CalificarServicioScreen] La valoración ya existe para esta reserva');
          
          // Mostrar mensaje informativo al usuario
          Alert.alert(
            'Valoración ya registrada',
            'Ya has enviado una valoración para este servicio anteriormente. Gracias por tu participación.',
            [{ text: 'OK' }]
          );
          
          // Consideramos como exitoso para continuar con el proceso de puntos
          valoracionExitosa = true;
        } else {
          // Intentar enviar la valoración directamente con axios como fallback
          try {
            const axiosResponse = await axios.post(
              `${ApiService.getBaseUrl()}/valoraciones`,
              valoracionData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            console.log('[CalificarServicioScreen] Respuesta de valoración con axios:', axiosResponse.data);
            valoracionExitosa = true;
          } catch (axiosError: any) {
            console.error('[CalificarServicioScreen] Error al enviar valoración con axios:', axiosError);
            
            // Verificar si es un error de conflicto (valoración ya existente)
            if (axiosError.response && axiosError.response.status === 409) {
              console.log('[CalificarServicioScreen] La valoración ya existe para esta reserva (axios)');
              
              // Mostrar mensaje informativo al usuario
              Alert.alert(
                'Valoración ya registrada',
                'Ya has enviado una valoración para este servicio anteriormente. Gracias por tu participación.',
                [{ text: 'OK' }]
              );
              
              // Consideramos como exitoso para continuar con el proceso de puntos
              valoracionExitosa = true;
            } else {
              // Mostrar mensaje de error genérico
              Alert.alert(
                'Error',
                'No se pudo enviar la valoración. Por favor, inténtalo de nuevo más tarde.'
              );
            }
          }
        }
      }
      
      // Si la valoración fue exitosa, registrar los puntos
      if (valoracionExitosa) {
        try {
          // Verificar si ya se han registrado puntos para esta reserva
          const token = await AsyncStorage.getItem('@token');
          const clienteIdNum = Number(clienteIdToUse);
          
          // Primero verificar si ya se han registrado puntos para esta reserva
          try {
            console.log(`[CalificarServicioScreen] Verificando si ya existen puntos para la reserva ${reserva.id}`);
            const puntosResponse = await axios.get(
              `${ApiService.getBaseUrl()}/puntos/cliente/${clienteIdNum}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            // Verificar si ya existe un registro de puntos con esta reserva como referencia
            const puntosExistentes = puntosResponse.data;
            const yaExistenPuntos = puntosExistentes.some(
              (punto: any) => punto.referencia === String(reserva.id) && punto.tipo === 'servicio'
            );
            
            if (yaExistenPuntos) {
              console.log(`[CalificarServicioScreen] Ya existen puntos registrados para la reserva ${reserva.id}`);
              
              // Mostrar mensaje de éxito sin mencionar puntos adicionales
              Alert.alert(
                'Valoración enviada',
                'Gracias por tu opinión. Tu valoración ha sido registrada correctamente.',
                [
                  {
                    text: 'Ver mis puntos',
                    onPress: () => navigation.navigate('Puntos')
                  },
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
              return;
            }
          } catch (checkError) {
            console.warn('[CalificarServicioScreen] Error al verificar puntos existentes:', checkError);
            // Continuamos con el proceso aunque no podamos verificar
          }
          
          // Obtener el precio real del servicio
          const precioServicio = await obtenerPrecioServicio(Number(reserva.servicioId));
          
          // Obtener la tienda ID
          const tiendaId = reserva.tiendaId ? Number(reserva.tiendaId) : 1; // Usar tienda por defecto si no hay
          
          // Registrar los puntos por el servicio usando la API de puntos
          const puntosParams = {
            clienteId: clienteIdNum,
            tiendaId: tiendaId,
            reservaId: Number(reserva.id),
            precioServicio: precioServicio,
            nombreServicio: reserva.servicio || 'Servicio'
          };
          
          console.log('[CalificarServicioScreen] Registrando puntos con parámetros:', puntosParams);
          
          const puntosRegistrados = await registrarPuntosServicio(puntosParams);
          
          console.log('[CalificarServicioScreen] Puntos registrados:', puntosRegistrados);
          
          // Calcular puntos ganados (2 puntos por cada $10)
          const puntosGanados = Math.floor(precioServicio / 10) * 2;
          
          // Mostrar mensaje de éxito con información sobre los puntos
          Alert.alert(
            'Valoración enviada',
            `Gracias por tu opinión. Tu valoración ha sido registrada correctamente.\n\n` +
            `¡Has ganado ${puntosGanados} puntos por este servicio! Revisa tu historial de puntos para más detalles.`,
            [
              {
                text: 'Ver mis puntos',
                onPress: () => {
                  // Navegar a la pantalla de puntos
                  navigation.navigate('Puntos');
                }
              },
              {
                text: 'OK',
                onPress: () => {
                  // Navegar de vuelta a la pantalla anterior
                  navigation.goBack();
                }
              }
            ]
          );
        } catch (puntosError) {
          console.error('[CalificarServicioScreen] Error al registrar puntos:', puntosError);
          
          // Mostrar mensaje de éxito sin mencionar los puntos
          Alert.alert(
            'Valoración enviada',
            'Gracias por tu opinión. Tu valoración ha sido registrada correctamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navegar de vuelta a la pantalla anterior
                  navigation.goBack();
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('[CalificarServicioScreen] Error general al enviar valoración:', error);
      Alert.alert('Error', 'Ocurrió un error al enviar la valoración');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando detalles del servicio...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Calificar Servicio</Text>
          <Text style={styles.subtitle}>Tu opinión nos ayuda a mejorar</Text>
        </View>

        <View style={styles.serviceInfoContainer}>
          <Text style={styles.serviceInfoTitle}>Detalles del Servicio</Text>
          <View style={styles.serviceInfoRow}>
            <Text style={styles.serviceInfoLabel}>Servicio:</Text>
            <Text style={styles.serviceInfoValue}>{reserva?.servicio}</Text>
          </View>
          <View style={styles.serviceInfoRow}>
            <Text style={styles.serviceInfoLabel}>Profesional:</Text>
            <Text style={styles.serviceInfoValue}>{reserva?.empleado}</Text>
          </View>
          <View style={styles.serviceInfoRow}>
            <Text style={styles.serviceInfoLabel}>Fecha:</Text>
            <Text style={styles.serviceInfoValue}>{reserva?.fecha}</Text>
          </View>
          <View style={styles.serviceInfoRow}>
            <Text style={styles.serviceInfoLabel}>Hora:</Text>
            <Text style={styles.serviceInfoValue}>{reserva?.hora}</Text>
          </View>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>¿Cómo calificarías el servicio?</Text>
          <ValoracionEstrellas 
            valoracion={rating} 
            tamano={40} 
            interactivo={true}
            onValoracionChange={setRating}
          />
          <Text style={styles.ratingValue}>{rating} {rating === 1 ? 'estrella' : 'estrellas'}</Text>
        </View>

        <View style={styles.commentContainer}>
          <Text style={styles.commentTitle}>Deja un comentario (opcional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe tu comentario aquí..."
            placeholderTextColor={colors.gray}
            multiline
            value={comentario}
            onChangeText={setComentario}
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitRating}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Valoración</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  serviceInfoContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  serviceInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  serviceInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  serviceInfoLabel: {
    fontSize: 16,
    color: colors.gray,
    width: '40%',
  },
  serviceInfoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  ratingValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: 8,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
