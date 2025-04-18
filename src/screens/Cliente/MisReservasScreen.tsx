// src/screens/Cliente/MisReservasScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  servicio: string;
  empleado: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

export default function MisReservasScreen() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proximas' | 'historial'>('proximas');

  useEffect(() => {
    // Simular carga de datos
    const fetchReservas = async () => {
      try {
        // Aquí se llamaría a la API para obtener las reservas del cliente
        // const data = await getReservasByCliente();
        
        // Datos de ejemplo
        const mockData: Reserva[] = [
          {
            id: '1',
            fecha: '2025-04-20',
            hora: '10:00',
            servicio: 'Corte de Cabello',
            empleado: 'Ana García',
            estado: 'pendiente',
          },
          {
            id: '2',
            fecha: '2025-04-25',
            hora: '15:30',
            servicio: 'Manicure',
            empleado: 'María López',
            estado: 'confirmada',
          },
          {
            id: '3',
            fecha: '2025-03-15',
            hora: '11:00',
            servicio: 'Tratamiento Facial',
            empleado: 'Carlos Rodríguez',
            estado: 'completada',
          },
          {
            id: '4',
            fecha: '2025-03-10',
            hora: '09:30',
            servicio: 'Corte de Cabello',
            empleado: 'Ana García',
            estado: 'cancelada',
          },
        ];
        
        setReservas(mockData);
      } catch (error) {
        console.error('Error fetching reservas:', error);
        Alert.alert(
          'Error',
          'No se pudieron cargar las reservas. Por favor intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const handleCancelReservation = (id: string) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Está seguro que desea cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí', 
          onPress: () => {
            // Aquí se llamaría a la API para cancelar la reserva
            // await cancelReservation(id);
            
            // Actualizar estado localmente
            const updatedReservas = reservas.map(reserva => 
              reserva.id === id ? { ...reserva, estado: 'cancelada' as const } : reserva
            );
            setReservas(updatedReservas);
            
            Alert.alert('Reserva cancelada', 'La reserva ha sido cancelada exitosamente.');
          } 
        },
      ]
    );
  };

  const handleRescheduleReservation = (id: string) => {
    // Aquí se navegaría a una pantalla para reprogramar la reserva
    Alert.alert('Reprogramar', 'Funcionalidad de reprogramación en desarrollo.');
  };

  const filteredReservas = reservas.filter(reserva => {
    const reservaDate = new Date(reserva.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === 'proximas') {
      return reservaDate >= today && (reserva.estado === 'pendiente' || reserva.estado === 'confirmada');
    } else {
      return reservaDate < today || reserva.estado === 'completada' || reserva.estado === 'cancelada';
    }
  });

  const getStatusColor = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'pendiente':
        return '#f39c12'; // Amarillo
      case 'confirmada':
        return '#2ecc71'; // Verde
      case 'cancelada':
        return '#e74c3c'; // Rojo
      case 'completada':
        return '#3498db'; // Azul
      default:
        return colors.text;
    }
  };

  const getStatusText = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'proximas' && styles.activeTab]}
          onPress={() => setActiveTab('proximas')}
        >
          <Text style={[styles.tabText, activeTab === 'proximas' && styles.activeTabText]}>
            Próximas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
          onPress={() => setActiveTab('historial')}
        >
          <Text style={[styles.tabText, activeTab === 'historial' && styles.activeTabText]}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {filteredReservas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {activeTab === 'proximas' 
              ? 'No tienes reservas próximas' 
              : 'No tienes historial de reservas'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReservas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.reservaItem}>
              <View style={styles.reservaHeader}>
                <Text style={styles.reservaFecha}>{formatDate(item.fecha)}</Text>
                <View style={[styles.reservaEstado, { backgroundColor: getStatusColor(item.estado) }]}>
                  <Text style={styles.reservaEstadoText}>{getStatusText(item.estado)}</Text>
                </View>
              </View>
              
              <View style={styles.reservaDetails}>
                <View style={styles.reservaDetailRow}>
                  <Ionicons name="time-outline" size={18} color={colors.text} />
                  <Text style={styles.reservaDetailText}>{item.hora}</Text>
                </View>
                <View style={styles.reservaDetailRow}>
                  <Ionicons name="cut-outline" size={18} color={colors.text} />
                  <Text style={styles.reservaDetailText}>{item.servicio}</Text>
                </View>
                <View style={styles.reservaDetailRow}>
                  <Ionicons name="person-outline" size={18} color={colors.text} />
                  <Text style={styles.reservaDetailText}>{item.empleado}</Text>
                </View>
              </View>
              
              {(item.estado === 'pendiente' || item.estado === 'confirmada') && (
                <View style={styles.reservaActions}>
                  <TouchableOpacity 
                    style={styles.reservaActionButton}
                    onPress={() => handleRescheduleReservation(item.id)}
                  >
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    <Text style={styles.reservaActionText}>Reprogramar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.reservaActionButton, styles.cancelButton]}
                    onPress={() => handleCancelReservation(item.id)}
                  >
                    <Ionicons name="close-outline" size={18} color={colors.error} />
                    <Text style={[styles.reservaActionText, styles.cancelText]}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContainer}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.text,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  reservaItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservaFecha: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reservaEstado: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reservaEstadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reservaDetails: {
    marginBottom: 12,
  },
  reservaDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservaDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  reservaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  reservaActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  reservaActionText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.primary,
  },
  cancelButton: {
    marginLeft: 16,
  },
  cancelText: {
    color: colors.error,
  },
});