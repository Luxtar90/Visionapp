// src/components/Empleados/ComisionesEmpleado.tsx
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
import { 
  ComisionEmpleado, 
  getComisionesPorEmpleado, 
  crearComision, 
  eliminarComision 
} from '../../api/comisionesEmpleado.api';
import { useIsFocused } from '@react-navigation/native';

// Importar correctamente el componente ComisionForm
import ComisionForm from './ComisionForm';

// Definir colores localmente si no existe el módulo
const colors = {
  primary: '#4287f5',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  text: '#212529',
  background: '#f8f9fa',
};

// Función para formatear fechas
const formatFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para mostrar toast (si no existe)
const showToast = (message: string) => {
  console.log(message);
};

interface ComisionesEmpleadoProps {
  empleadoId: string;
  onRefresh?: () => void;
}

export const ComisionesEmpleado = ({ 
  empleadoId, 
  onRefresh 
}: ComisionesEmpleadoProps) => {
  const [comisiones, setComisiones] = useState<ComisionEmpleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedComision, setSelectedComision] = useState<ComisionEmpleado | undefined>(undefined);
  const isFocused = useIsFocused();

  const cargarComisiones = async () => {
    try {
      setLoading(true);
      
      // Usar la API real para obtener las comisiones
      const data = await getComisionesPorEmpleado(empleadoId);
      setComisiones(data);
    } catch (error) {
      console.error('Error al cargar comisiones:', error);
      Alert.alert('Error', 'No se pudieron cargar las comisiones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (empleadoId) {
      cargarComisiones();
    }
  }, [empleadoId]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarComisiones();
  };

  const handleEliminarComision = (comision: ComisionEmpleado) => {
    Alert.alert(
      'Eliminar Comisión',
      `¿Estás seguro de que deseas eliminar esta comisión?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Usar la API real para eliminar la comisión
              await eliminarComision(comision.id);
              
              // Actualizar el estado local
              setComisiones(comisiones.filter(c => c.id !== comision.id));
              Alert.alert('Éxito', 'Comisión eliminada correctamente');
            } catch (error) {
              console.error('Error al eliminar comisión:', error);
              Alert.alert('Error', 'No se pudo eliminar la comisión');
            }
          }
        }
      ]
    );
  };

  const handleOpenForm = (comision?: ComisionEmpleado) => {
    if (comision) {
      setSelectedComision(comision);
    } else {
      setSelectedComision(undefined);
    }
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedComision(undefined);
  };

  const handleSaveComision = async (comision: Partial<ComisionEmpleado>) => {
    try {
      setLoading(true);
      await crearComision(comision);
      
      // Recargar comisiones
      await cargarComisiones();
      
      // Cerrar el formulario
      handleCloseForm();
      showToast('Comisión guardada correctamente');
    } catch (error) {
      console.error('Error al guardar comisión:', error);
      showToast('No se pudo guardar la comisión');
    }
  };

  const renderComisionItem = ({ item }: { item: ComisionEmpleado }) => {
    // Determinar el tipo de comisión y su valor para mostrar
    let tipoComision = 'No definida';
    let valorComision = '-';
    
    if (item.tipo_aplicacion === 'porcentaje') {
      tipoComision = 'Porcentaje';
      valorComision = `${item.valor}%`;
    } else if (item.tipo_aplicacion === 'monto_fijo') {
      tipoComision = 'Monto fijo';
      valorComision = `$${parseFloat(item.valor.toString()).toLocaleString('es-MX')}`;
    }
    
    return (
      <View style={styles.comisionCard}>
        <View style={styles.comisionHeader}>
          <Text style={styles.comisionTitulo}>
            {item.aplica_a === 'servicios' ? 'Comisión General' : (item.servicio?.nombre || 'Servicio específico')}
          </Text>
          
          <View style={[
            styles.estadoBadge,
            styles.estadoInactivo // Por ahora todas aparecen como inactivas
          ]}>
            <Text style={[
              styles.estadoText,
              styles.estadoInactivoText
            ]}>
              Inactiva
            </Text>
          </View>
        </View>
        
        <View style={styles.comisionDetalles}>
          <View style={styles.detalleFila}>
            <Ionicons name="cash-outline" size={16} color="#6c757d" style={styles.detalleIcon} />
            <Text style={styles.detalleLabel}>Tipo:</Text>
            <Text style={styles.detalleValor}>{tipoComision}</Text>
          </View>
          
          <View style={styles.detalleFila}>
            <Ionicons name="trending-up-outline" size={16} color="#6c757d" style={styles.detalleIcon} />
            <Text style={styles.detalleLabel}>Valor:</Text>
            <Text style={styles.detalleValor}>{valorComision}</Text>
          </View>
        </View>
        
        <View style={styles.comisionAcciones}>
          <TouchableOpacity 
            style={styles.accionEditar}
            onPress={() => handleOpenForm(item)}
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.accionEliminar}
            onPress={() => handleEliminarComision(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Comisiones</Text>
        <TouchableOpacity 
          style={styles.agregarBoton}
          onPress={() => handleOpenForm()}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.agregarTexto}>Agregar</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : comisiones.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="cash-outline" size={40} color="#6c757d" />
          <Text style={styles.emptyStateMessage}>Sin comisiones</Text>
          <Text style={styles.emptyStateDescription}>Este empleado no tiene comisiones asignadas</Text>
          <TouchableOpacity 
            style={styles.emptyStateAction}
            onPress={() => handleOpenForm()}
          >
            <Text style={styles.emptyStateActionText}>Agregar comisión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={comisiones}
          keyExtractor={(item) => item.id}
          renderItem={renderComisionItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      {formVisible && (
        <ComisionForm
          visible={formVisible}
          onClose={handleCloseForm}
          onSave={handleSaveComision}
          empleadoId={empleadoId}
          comision={selectedComision}
        />
      )}
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
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  agregarBoton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agregarTexto: {
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
  listContent: {
    padding: 16,
  },
  comisionCard: {
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
  comisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  comisionTitulo: {
    fontSize: 16,
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
  comisionDetalles: {
    marginBottom: 12,
  },
  detalleFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detalleIcon: {
    marginRight: 8,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#6c757d',
    width: 60,
  },
  detalleValor: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  comisionAcciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  accionEditar: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  accionEliminar: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 24,
  },
  emptyStateAction: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyStateActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
