// src/screens/Empleado/AgendaScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string;
  };
  servicio: {
    id: string;
    nombre: string;
    duracion: number;
    precio: number;
  };
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
}

export default function AgendaScreen() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    // Simular carga de datos
    const fetchCitas = async () => {
      try {
        // Aquí se llamaría a la API para obtener las citas
        // const response = await getCitasByEmpleado(empleadoId, fecha);
        
        // Datos de ejemplo
        const mockData: Cita[] = [
          {
            id: '1',
            fecha: '2025-04-17',
            hora: '09:00',
            cliente: {
              id: '101',
              nombre: 'María',
              apellido: 'González',
              telefono: '555-123-4567',
            },
            servicio: {
              id: '201',
              nombre: 'Corte de cabello',
              duracion: 30,
              precio: 250,
            },
            estado: 'confirmada',
          },
          {
            id: '2',
            fecha: '2025-04-17',
            hora: '10:30',
            cliente: {
              id: '102',
              nombre: 'Juan',
              apellido: 'Pérez',
              telefono: '555-987-6543',
            },
            servicio: {
              id: '202',
              nombre: 'Tinte',
              duracion: 90,
              precio: 800,
            },
            estado: 'pendiente',
          },
          {
            id: '3',
            fecha: '2025-04-17',
            hora: '13:00',
            cliente: {
              id: '103',
              nombre: 'Ana',
              apellido: 'Martínez',
              telefono: '555-456-7890',
            },
            servicio: {
              id: '203',
              nombre: 'Manicure',
              duracion: 45,
              precio: 350,
            },
            estado: 'completada',
          },
        ];
        
        setCitas(mockData);
      } catch (error) {
        console.error('Error fetching citas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [fecha]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '#f39c12'; // Amarillo
      case 'confirmada':
        return '#3498db'; // Azul
      case 'completada':
        return '#2ecc71'; // Verde
      case 'cancelada':
        return '#e74c3c'; // Rojo
      default:
        return '#777';
    }
  };

  const formatHora = (hora: string) => {
    return hora.replace(':', 'h');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Agenda</Text>
        <Text style={styles.date}>
          {fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Cargando agenda...</Text>
        </View>
      ) : citas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No tienes citas programadas para hoy</Text>
        </View>
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.citaItem}>
              <View style={styles.horaContainer}>
                <Text style={styles.hora}>{formatHora(item.hora)}</Text>
              </View>
              <View style={styles.detallesContainer}>
                <View style={styles.clienteRow}>
                  <Ionicons name="person" size={16} color={colors.text} />
                  <Text style={styles.clienteNombre}>
                    {item.cliente.nombre} {item.cliente.apellido}
                  </Text>
                </View>
                <View style={styles.servicioRow}>
                  <Ionicons name="cut" size={16} color={colors.text} />
                  <Text style={styles.servicioNombre}>{item.servicio.nombre}</Text>
                  <Text style={styles.servicioDuracion}>{item.servicio.duracion} min</Text>
                </View>
                <View 
                  style={[
                    styles.estadoBadge, 
                    { backgroundColor: getEstadoColor(item.estado) + '20' }
                  ]}
                >
                  <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
                    {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
  header: {
    padding: 16,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  citaItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  horaContainer: {
    width: 60,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  hora: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  detallesContainer: {
    flex: 1,
    padding: 12,
  },
  clienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  servicioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicioNombre: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  servicioDuracion: {
    fontSize: 12,
    color: '#888',
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
