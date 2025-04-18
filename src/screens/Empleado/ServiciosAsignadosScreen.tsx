// src/screens/Empleado/ServiciosAsignadosScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusMessage } from '../../components/common/StatusMessage';
import { SearchBar } from '../../components/common/SearchBar';
import { colors } from '../../theme/colors';

// Interfaz temporal para servicios asignados
interface ServicioAsignado {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  categoria: string;
  asignado_desde: string;
}

export const ServiciosAsignadosScreen: React.FC = () => {
  const [servicios, setServicios] = useState<ServicioAsignado[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<ServicioAsignado[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Datos de ejemplo
  const serviciosEjemplo: ServicioAsignado[] = [
    {
      id: '1',
      nombre: 'Corte de cabello',
      descripcion: 'Corte de cabello básico',
      duracion: 30,
      precio: 20,
      categoria: 'Peluquería',
      asignado_desde: '2023-01-15'
    },
    {
      id: '2',
      nombre: 'Tinte de cabello',
      descripcion: 'Tinte completo con productos de calidad',
      duracion: 90,
      precio: 50,
      categoria: 'Colorimetría',
      asignado_desde: '2023-02-10'
    },
    {
      id: '3',
      nombre: 'Manicura',
      descripcion: 'Manicura básica con esmaltado',
      duracion: 45,
      precio: 25,
      categoria: 'Uñas',
      asignado_desde: '2023-03-05'
    }
  ];

  const loadServicios = useCallback(() => {
    setIsLoading(true);
    try {
      // Simulando carga de datos
      setTimeout(() => {
        setServicios(serviciosEjemplo);
        setFilteredServicios(serviciosEjemplo);
        setIsLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los servicios. Intente nuevamente.'
      });
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadServicios();
  }, [loadServicios]);

  useFocusEffect(
    useCallback(() => {
      loadServicios();
    }, [loadServicios])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadServicios();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredServicios(servicios);
    } else {
      const filtered = servicios.filter(
        servicio => 
          servicio.nombre.toLowerCase().includes(text.toLowerCase()) ||
          servicio.descripcion.toLowerCase().includes(text.toLowerCase()) ||
          servicio.categoria.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServicios(filtered);
    }
  };

  const handleServicioPress = (servicio: ServicioAsignado) => {
    // Aquí iría la navegación al detalle del servicio
    console.log('Servicio seleccionado:', servicio);
  };

  const renderServicioItem = ({ item }: { item: ServicioAsignado }) => (
    <TouchableOpacity 
      style={styles.servicioItem}
      onPress={() => handleServicioPress(item)}
    >
      <View style={styles.servicioHeader}>
        <Text style={styles.servicioNombre}>{item.nombre}</Text>
        <View style={styles.precioDuracionContainer}>
          <Text style={styles.servicioPrecio}>
            {item.precio.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.servicioDuracion}>
            {item.duracion} min
          </Text>
        </View>
      </View>
      
      <Text style={styles.servicioDescripcion} numberOfLines={2}>
        {item.descripcion}
      </Text>
      
      <View style={styles.servicioFooter}>
        <View style={styles.categoriaContainer}>
          <Ionicons name="pricetag-outline" size={14} color={colors.primary} />
          <Text style={styles.categoriaText}>{item.categoria}</Text>
        </View>
        
        <Text style={styles.asignadoDesde}>
          Asignado desde: {new Date(item.asignado_desde).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Servicios Asignados</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar servicios..."
        />
      </View>
      
      <FlatList
        data={filteredServicios}
        keyExtractor={(item) => item.id}
        renderItem={renderServicioItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color={colors.text + '40'} />
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' 
                ? 'No se encontraron servicios que coincidan con la búsqueda' 
                : 'No tienes servicios asignados'}
            </Text>
            {!isLoading && (
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.refreshText}>Actualizar</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  servicioItem: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  precioDuracionContainer: {
    alignItems: 'flex-end',
  },
  servicioPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  servicioDuracion: {
    fontSize: 14,
    color: colors.text + '99',
  },
  servicioDescripcion: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  servicioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  asignadoDesde: {
    fontSize: 12,
    color: colors.text + '80',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text + '80',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
  },
  refreshText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
});
