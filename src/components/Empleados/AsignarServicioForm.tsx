// src/components/Empleados/AsignarServicioForm.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getServicios } from '../../api/servicios.api';
import { asignarServicioAEmpleado } from '../../api/serviciosEmpleados.api';

interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  costo?: number;
  tiempo_estimado?: number;
  categoria?: string;
  imagen?: string;
}

interface AsignarServicioFormProps {
  visible: boolean;
  onClose: () => void;
  empleadoId: string;
  onServicioAsignado: () => void;
  tiendaId?: string;
}

export const AsignarServicioForm = ({
  visible,
  onClose,
  empleadoId,
  onServicioAsignado,
  tiendaId = '1'
}: AsignarServicioFormProps) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      cargarServicios();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServicios(servicios);
    } else {
      const filtered = servicios.filter(servicio => 
        servicio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (servicio.descripcion && servicio.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (servicio.categoria && servicio.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredServicios(filtered);
    }
  }, [searchQuery, servicios]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await getServicios();
      setServicios(data);
      setFilteredServicios(data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarServicio = async (servicio: Servicio) => {
    try {
      setLoading(true);
      
      await asignarServicioAEmpleado({
        empleadoId,
        servicioId: servicio.id,
        habilitado: true,
        tiendaId
      });
      
      Alert.alert(
        'Éxito', 
        `El servicio "${servicio.nombre}" ha sido asignado correctamente.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              onServicioAsignado();
              onClose();
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Error al asignar servicio:', error);
      Alert.alert('Error', 'No se pudo asignar el servicio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuracion = (minutos?: number) => {
    if (!minutos) return '';
    return `${minutos} min`;
  };

  const formatPrecio = (precio?: number | string | null) => {
    if (precio === undefined || precio === null) return '';
    
    // Si es string, intentar convertir a número
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
    
    // Verificar si es un número válido
    if (isNaN(precioNum)) return '';
    
    return `$${precioNum.toFixed(2)}`;
  };

  const renderServicioItem = ({ item }: { item: Servicio }) => (
    <View style={styles.servicioCard}>
      <View style={styles.servicioInfo}>
        <Text style={styles.servicioNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.servicioDescripcion}>{item.descripcion}</Text>
        )}
        <View style={styles.servicioDetalles}>
          {item.tiempo_estimado && (
            <View style={styles.detailContainer}>
              <Ionicons name="time-outline" size={14} color={colors.text + '80'} />
              <Text style={styles.detailText}>{formatDuracion(item.tiempo_estimado)}</Text>
            </View>
          )}
          {item.precio && (
            <View style={styles.detailContainer}>
              <Ionicons name="cash-outline" size={14} color={colors.text + '80'} />
              <Text style={styles.detailText}>{formatPrecio(item.precio)}</Text>
            </View>
          )}
          {item.categoria && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.categoria}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.asignarButton}
        onPress={() => handleAsignarServicio(item)}
      >
        <Ionicons name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Asignar Servicio</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text + '80'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text + '60'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.text + '80'} />
            </TouchableOpacity>
          )}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando servicios...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredServicios}
            renderItem={renderServicioItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.text + '60'} />
                <Text style={styles.emptyText}>
                  {searchQuery.length > 0
                    ? 'No se encontraron servicios que coincidan con tu búsqueda'
                    : 'No hay servicios disponibles para asignar'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text + '80',
    textAlign: 'center',
  },
  servicioCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  servicioDescripcion: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 8,
  },
  servicioDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.text + '80',
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
  },
  asignarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});
