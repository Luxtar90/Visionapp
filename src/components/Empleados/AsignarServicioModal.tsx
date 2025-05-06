// src/components/Empleados/AsignarServicioModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { asignarServicio } from '../../api/serviciosEmpleados.api';
import { EmptyState } from '../common/EmptyState';

// Interfaz para el servicio
interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  tiempo_estimado?: number;
  categoria?: string;
  precio?: number;
}

interface AsignarServicioModalProps {
  visible: boolean;
  empleadoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AsignarServicioModal = ({
  visible,
  empleadoId,
  onClose,
  onSuccess
}: AsignarServicioModalProps) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(false);

  // Simulamos obtener servicios de la API
  // En una implementación real, esto vendría de una llamada a la API
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        // Aquí deberías hacer una llamada a la API para obtener los servicios disponibles
        // Por ahora usamos datos de ejemplo
        const mockServicios: Servicio[] = [
          {
            id: '1',
            nombre: 'Examen visual completo',
            descripcion: 'Evaluación completa de la salud visual',
            tiempo_estimado: 30,
            categoria: 'Exámenes',
            precio: 50.00
          },
          {
            id: '2',
            nombre: 'Adaptación de lentes de contacto',
            descripcion: 'Proceso de adaptación de lentes de contacto',
            tiempo_estimado: 45,
            categoria: 'Adaptaciones',
            precio: 75.00
          },
          {
            id: '3',
            nombre: 'Control de miopía',
            descripcion: 'Seguimiento y control de miopía en niños y adolescentes',
            tiempo_estimado: 40,
            categoria: 'Controles',
            precio: 60.00
          },
          {
            id: '4',
            nombre: 'Terapia visual',
            descripcion: 'Sesiones de terapia visual para problemas específicos',
            tiempo_estimado: 60,
            categoria: 'Terapias',
            precio: 90.00
          },
          {
            id: '5',
            nombre: 'Medición de presión ocular',
            descripcion: 'Tonometría para medir la presión intraocular',
            tiempo_estimado: 15,
            categoria: 'Exámenes',
            precio: 30.00
          }
        ];
        
        setServicios(mockServicios);
        setFilteredServicios(mockServicios);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        Alert.alert('Error', 'No se pudieron cargar los servicios disponibles');
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchServicios();
    }
  }, [visible]);

  // Filtrar servicios basados en la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServicios(servicios);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = servicios.filter(
        servicio => 
          servicio.nombre.toLowerCase().includes(query) ||
          (servicio.descripcion && servicio.descripcion.toLowerCase().includes(query)) ||
          (servicio.categoria && servicio.categoria.toLowerCase().includes(query))
      );
      setFilteredServicios(filtered);
    }
  }, [searchQuery, servicios]);

  const handleAsignarServicio = async (servicio: Servicio) => {
    try {
      setAsignando(true);
      
      // En una implementación real, descomentar la siguiente línea:
      // await asignarServicio(empleadoId, servicio.id);
      
      // Simulación de la llamada a la API
      console.log(`Asignando servicio ${servicio.id} al empleado ${empleadoId}`);
      
      // Esperar un momento para simular la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Éxito',
        `El servicio "${servicio.nombre}" ha sido asignado correctamente.`,
        [{ text: 'OK', onPress: () => {
          onSuccess();
          onClose();
        }}]
      );
    } catch (error) {
      console.error('Error al asignar servicio:', error);
      Alert.alert('Error', 'No se pudo asignar el servicio. Inténtalo de nuevo.');
    } finally {
      setAsignando(false);
    }
  };

  const renderServicioItem = ({ item }: { item: Servicio }) => (
    <TouchableOpacity 
      style={styles.servicioCard}
      onPress={() => handleAsignarServicio(item)}
      disabled={asignando}
    >
      <View style={styles.servicioInfo}>
        <Text style={styles.servicioNombre}>{item.nombre}</Text>
        
        {item.descripcion && (
          <Text style={styles.servicioDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        
        <View style={styles.servicioDetalles}>
          {item.tiempo_estimado && (
            <View style={styles.detalleItem}>
              <Ionicons name="time-outline" size={14} color={colors.text + 'CC'} />
              <Text style={styles.detalleText}>
                {item.tiempo_estimado} min
              </Text>
            </View>
          )}
          
          {item.precio && (
            <View style={styles.detalleItem}>
              <Ionicons name="cash-outline" size={14} color={colors.text + 'CC'} />
              <Text style={styles.detalleText}>
                ${item.precio.toFixed(2)}
              </Text>
            </View>
          )}
          
          {item.categoria && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>
                {item.categoria}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.asignarContainer}>
        <Ionicons name="add-circle" size={24} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Asignar Servicio</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text + '99'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text + '99'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={colors.text + '99'} />
            </TouchableOpacity>
          )}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando servicios...</Text>
          </View>
        ) : filteredServicios.length === 0 ? (
          <EmptyState
            icon="cut-outline"
            message={
              searchQuery
                ? "No se encontraron servicios con esa búsqueda"
                : "No hay servicios disponibles"
            }
          />
        ) : (
          <FlatList
            data={filteredServicios}
            keyExtractor={(item) => item.id}
            renderItem={renderServicioItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
        
        {asignando && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Asignando servicio...</Text>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
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
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  servicioCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: colors.text + 'CC',
    marginBottom: 8,
  },
  servicioDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detalleText: {
    fontSize: 13,
    color: colors.text + 'CC',
    marginLeft: 4,
  },
  tagContainer: {
    backgroundColor: colors.primary + '20',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  asignarContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
