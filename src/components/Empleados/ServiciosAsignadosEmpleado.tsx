// src/components/Empleados/ServiciosAsignadosEmpleado.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { 
  ServicioAsignado, 
  getServiciosPorEmpleado, 
  actualizarServicioAsignado, 
  eliminarServicioAsignado 
} from '../../api/serviciosEmpleados.api';
import { EmptyState } from '../common/EmptyState';
import { AsignarServicioForm } from './AsignarServicioForm';

interface ServiciosAsignadosEmpleadoProps {
  empleadoId: string;
  onAsignarServicio: () => void;
  tiendaId?: string;
}

export const ServiciosAsignadosEmpleado = ({ 
  empleadoId, 
  onAsignarServicio,
  tiendaId = '1'
}: ServiciosAsignadosEmpleadoProps) => {
  const [servicios, setServicios] = useState<ServicioAsignado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      
      // Usar la API real para obtener los servicios
      const data = await getServiciosPorEmpleado(empleadoId);
      setServicios(data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios asignados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (empleadoId) {
      cargarServicios();
    }
  }, [empleadoId]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarServicios();
  };

  const handleToggleEstado = async (id: string, estado: boolean) => {
    try {
      setLoading(true);
      
      // Usar la API real para actualizar el estado
      await actualizarServicioAsignado(id, {
        habilitado: !estado
      });
      
      // Actualizar el estado local
      setServicios(prev => 
        prev.map(servicio => 
          servicio.id === id 
            ? { ...servicio, habilitado: !servicio.habilitado } 
            : servicio
        )
      );
      
      Alert.alert(
        'Éxito', 
        `Servicio ${estado ? 'desactivado' : 'activado'} correctamente`
      );
    } catch (error) {
      console.error('Error al cambiar estado del servicio:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado del servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarServicio = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este servicio asignado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Usar la API real para eliminar el servicio
              await eliminarServicioAsignado(id);
              
              // Actualizar el estado local después de la eliminación exitosa
              setServicios(prev => prev.filter(s => s.id !== id));
              
              Alert.alert('Éxito', 'Servicio eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar servicio:', error);
              Alert.alert('Error', 'No se pudo eliminar el servicio');
            }
          }
        }
      ]
    );
  };

  const formatDuracion = (minutos?: number) => {
    if (!minutos) return '';
    return `${minutos} minutos`;
  };

  const formatPrecio = (precio?: number | string | null) => {
    if (precio === undefined || precio === null) return '';
    
    // Si es string, intentar convertir a número
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
    
    // Verificar si es un número válido
    if (isNaN(precioNum)) return '';
    
    return `$${precioNum.toFixed(2)}`;
  };

  const renderServicio = (item: ServicioAsignado) => {
    return (
      <View style={styles.servicioCard}>
        <View style={styles.servicioHeader}>
          <Text style={styles.servicioNombre}>{item.servicio?.nombre}</Text>
          <View style={[
            styles.estadoBadge, 
            item.habilitado ? styles.estadoActivo : styles.estadoInactivo
          ]}>
            <Text style={[
              styles.estadoText,
              item.habilitado ? styles.estadoActivoText : styles.estadoInactivoText
            ]}>
              {item.habilitado ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <View style={styles.servicioDescripcionContainer}>
          <Ionicons name="information-circle-outline" size={18} color="#6c757d" style={styles.servicioIcon} />
          <Text style={styles.servicioDescripcion}>
            {item.servicio?.descripcion || 'Sin descripción'}
          </Text>
        </View>
        
        <View style={styles.servicioInfoContainer}>
          <View style={styles.servicioInfoItem}>
            <Ionicons name="cash-outline" size={18} color="#6c757d" style={styles.servicioIcon} />
            <Text style={styles.servicioInfoText}>
              Precio: {formatPrecio(item.servicio?.precio)}
            </Text>
          </View>
          
          <View style={styles.servicioInfoItem}>
            <Ionicons name="star-outline" size={18} color="#6c757d" style={styles.servicioIcon} />
            <Text style={styles.servicioInfoText}>
              Nivel: {item.nivel_habilidad || 'No especificado'}
            </Text>
          </View>
          
          {item.comision_especial !== null && (
            <View style={styles.servicioInfoItem}>
              <Ionicons name="trending-up-outline" size={18} color="#6c757d" style={styles.servicioIcon} />
              <Text style={styles.servicioInfoText}>
                Comisión: {item.comision_especial}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.servicioActions}>
          <TouchableOpacity 
            style={[styles.servicioActionButton, styles.servicioToggleButton]}
            onPress={() => handleToggleEstado(item.id, item.habilitado)}
          >
            <Ionicons 
              name={item.habilitado ? "close-circle-outline" : "checkmark-circle-outline"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.servicioActionText}>
              {item.habilitado ? 'Desactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.servicioActionButton, styles.servicioDeleteButton]}
            onPress={() => handleEliminarServicio(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.servicioActionText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Servicios</Text>
        <TouchableOpacity 
          style={styles.asignarButton}
          onPress={() => setShowAsignarModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.asignarButtonText}>Asignar</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      ) : servicios.length === 0 ? (
        <EmptyState 
          icon="construct-outline"
          message="No hay servicios asignados"
          description="Asigna servicios a este empleado para que pueda ofrecerlos a los clientes."
          actionLabel="Asignar servicio"
          onAction={() => setShowAsignarModal(true)}
        />
      ) : (
        <FlatList
          data={servicios}
          renderItem={({ item }) => renderServicio(item)}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      <AsignarServicioForm 
        visible={showAsignarModal}
        onClose={() => setShowAsignarModal(false)}
        empleadoId={empleadoId}
        onServicioAsignado={cargarServicios}
        tiendaId={tiendaId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  asignarButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  asignarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    padding: 16,
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  servicioNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  estadoActivo: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
  },
  estadoInactivo: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  estadoActivoText: {
    color: '#28a745',
  },
  estadoInactivoText: {
    color: '#dc3545',
  },
  servicioDescripcionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  servicioDescripcion: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  servicioInfoContainer: {
    marginBottom: 16,
  },
  servicioInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicioIcon: {
    marginRight: 8,
  },
  servicioInfoText: {
    fontSize: 14,
    color: '#495057',
  },
  servicioActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  servicioActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  servicioToggleButton: {
    backgroundColor: '#6c757d',
  },
  servicioDeleteButton: {
    backgroundColor: '#dc3545',
  },
  servicioActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});
