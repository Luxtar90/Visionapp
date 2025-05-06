// src/screens/Admin/NuevoEmpleadosScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Componentes
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { EmpleadoCard } from '../../components/Empleados/EmpleadoCard';
import { EmpleadoDetalleModal } from '../../components/Empleados/EmpleadoDetalleModal';
import { EmpleadoForm } from '../../components/Empleados/EmpleadoForm';
import { StatusMessage } from '../../components/common/StatusMessage';

// API
import { 
  getEmpleados, 
  createEmpleado, 
  updateEmpleado, 
  deleteEmpleado,
  toggleEmpleadoActivo,
  Empleado
} from '../../api/empleados.api';

// Tema
import { colors } from '../../theme/colors';

export default function NuevoEmpleadosScreen() {
  // Estado
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [tiendaId, setTiendaId] = useState<string | null>(null);

  const navigation = useNavigation();

  // Cargar tienda seleccionada
  useEffect(() => {
    const loadTiendaId = async () => {
      const storedTiendaId = await AsyncStorage.getItem('selectedTienda');
      console.log('Tienda ID cargada:', storedTiendaId);
      setTiendaId(storedTiendaId);
    };
    
    loadTiendaId();
  }, []);

  // Cargar empleados
  const loadEmpleados = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      setIsLoading(true);
      const data = await getEmpleados(tiendaId);
      setEmpleados(data);
      setFilteredEmpleados(data);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los empleados. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tiendaId]);

  // Cargar empleados cuando cambia la tienda o cuando la pantalla obtiene el foco
  useEffect(() => {
    if (tiendaId) {
      loadEmpleados();
    }
  }, [tiendaId, loadEmpleados]);

  useFocusEffect(
    useCallback(() => {
      if (tiendaId) {
        loadEmpleados();
      }
    }, [tiendaId, loadEmpleados])
  );

  // Filtrar empleados cuando cambia la búsqueda
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredEmpleados(empleados);
    } else {
      const normalizedQuery = query.toLowerCase();
      const filtered = empleados.filter(
        (empleado) =>
          (empleado.nombres && empleado.nombres.toLowerCase().includes(normalizedQuery)) ||
          (empleado.apellidos && empleado.apellidos.toLowerCase().includes(normalizedQuery)) ||
          (empleado.email && empleado.email.toLowerCase().includes(normalizedQuery)) ||
          (empleado.telefono && empleado.telefono.includes(normalizedQuery)) ||
          (empleado.cargo && empleado.cargo.toLowerCase().includes(normalizedQuery)) ||
          (empleado.nivel_estudio && empleado.nivel_estudio.toLowerCase().includes(normalizedQuery))
      );
      setFilteredEmpleados(filtered);
    }
  }, [empleados]);

  // Refrescar la lista
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEmpleados();
  };

  // Abrir modal de detalles
  const handleOpenModal = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setIsModalVisible(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedEmpleado(null);
  };

  // Abrir formulario de creación
  const handleOpenForm = () => {
    setIsFormVisible(true);
  };

  // Cerrar formulario de creación
  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  // Crear empleado
  const handleCreateEmpleado = async (data: Partial<Empleado>) => {
    try {
      setIsLoading(true);
      
      if (tiendaId) {
        // Use type assertion to tell TypeScript this is valid
        (data as any).tienda_id = tiendaId;
      }
      
      await createEmpleado(data);
      await loadEmpleados();
      
      setStatusMessage({
        type: 'success',
        message: 'Empleado creado correctamente'
      });
      
      setIsFormVisible(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al crear el empleado. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar empleado
  const handleUpdateEmpleado = async (data: Partial<Empleado>) => {
    if (!data.id) return;
    
    try {
      setIsLoading(true);
      await updateEmpleado(data.id, data);
      await loadEmpleados();
      
      setStatusMessage({
        type: 'success',
        message: 'Empleado actualizado correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al actualizar el empleado. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar empleado
  const handleDeleteEmpleado = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteEmpleado(id);
      await loadEmpleados();
      
      setStatusMessage({
        type: 'success',
        message: 'Empleado eliminado correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar el empleado. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleActivo = async (empleado: Empleado) => {
    try {
      setIsLoading(true);
      await toggleEmpleadoActivo(empleado.id, !empleado.activo_para_reservas);
      await loadEmpleados();
      
      setStatusMessage({
        type: 'success',
        message: `Empleado ${empleado.activo_para_reservas ? 'desactivado' : 'activado'} correctamente`
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado del empleado. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {statusMessage && (
        <View style={styles.statusMessageContainer}>
          <StatusMessage
            type={statusMessage.type}
            message={statusMessage.message}
            onDismiss={() => setStatusMessage(null)}
          />
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar empleados..."
          style={styles.searchBarStyle}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleOpenForm}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {!tiendaId ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={colors.text + '40'} />
          <Text style={styles.emptyText}>
            No hay tienda seleccionada. Por favor, seleccione una tienda en su perfil.
          </Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Perfil' as never)}
          >
            <Text style={styles.actionText}>Ir al perfil</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading && !isRefreshing ? (
        <LoadingIndicator message="Cargando empleados..." />
      ) : filteredEmpleados.length === 0 ? (
        <EmptyState
          icon="people-outline"
          message={
            searchQuery
              ? "No se encontraron empleados con esa búsqueda"
              : "No hay empleados registrados"
          }
          actionLabel="Agregar empleado"
          onAction={handleOpenForm}
        />
      ) : (
        <FlatList
          data={filteredEmpleados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EmpleadoCard
              empleado={item}
              onPress={handleOpenModal}
              onToggleActivo={handleToggleActivo}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Modal de detalles del empleado */}
      <EmpleadoDetalleModal
        visible={isModalVisible}
        empleado={selectedEmpleado}
        onClose={handleCloseModal}
        onUpdate={handleUpdateEmpleado}
        onDelete={handleDeleteEmpleado}
        isLoading={isLoading}
      />
      
      {/* Modal de formulario de creación */}
      {isFormVisible && (
        <View style={styles.formContainer}>
          <EmpleadoForm
            onSubmit={handleCreateEmpleado}
            isLoading={isLoading}
            onCancel={handleCloseForm}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  searchBarStyle: {
    flex: 1,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
  statusMessageContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  loadingMore: {
    paddingVertical: 16,
  },
  formContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 100,
  },
});
