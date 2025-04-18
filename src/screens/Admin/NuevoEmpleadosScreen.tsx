// src/screens/Admin/EmpleadosScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componentes
import { Header } from '../../components/common/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { EmpleadoCard, Empleado } from '../../components/Empleados/EmpleadoCard';
import { EmpleadoDetalleModal } from '../../components/Empleados/EmpleadoDetalleModal';
import { EmpleadoForm } from '../../components/Empleados/EmpleadoForm';
import { StatusMessage } from '../../components/common/StatusMessage';
import { ActionButton } from '../../components/common/ActionButton';

// API
import { 
  getEmpleados, 
  createEmpleado, 
  updateEmpleado, 
  deleteEmpleado,
  toggleEmpleadoActivo
} from '../../api/empleados.api';

// Tema
import { colors } from '../../theme/colors';

export default function EmpleadosScreen() {
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

  // Cargar tienda seleccionada
  useEffect(() => {
    const loadTiendaId = async () => {
      const storedTiendaId = await AsyncStorage.getItem('tiendaId');
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
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmpleados(empleados);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = empleados.filter(
        (empleado) =>
          empleado.nombre.toLowerCase().includes(query) ||
          empleado.apellido.toLowerCase().includes(query) ||
          empleado.email.toLowerCase().includes(query) ||
          empleado.telefono.includes(query) ||
          empleado.especialidad.toLowerCase().includes(query)
      );
      setFilteredEmpleados(filtered);
    }
  }, [searchQuery, empleados]);

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
        data.tienda_id = tiendaId;
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
      await toggleEmpleadoActivo(empleado.id, !empleado.activo);
      await loadEmpleados();
      
      setStatusMessage({
        type: 'success',
        message: `Empleado ${empleado.activo ? 'desactivado' : 'activado'} correctamente`
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

  // Renderizar el botón de agregar empleado
  const renderAddButton = () => (
    <TouchableOpacity 
      style={styles.addButton}
      onPress={handleOpenForm}
    >
      <Ionicons name="add" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Empleados" 
        rightComponent={
          <TouchableOpacity onPress={handleOpenForm}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      {statusMessage && (
        <View style={styles.statusContainer}>
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
          onChangeText={setSearchQuery}
          placeholder="Buscar empleados..."
        />
      </View>
      
      {isLoading && !isRefreshing ? (
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
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
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
          <Header 
            title="Nuevo Empleado" 
            showBackButton 
            onBackPress={handleCloseForm} 
          />
          
          <EmpleadoForm
            onSubmit={handleCreateEmpleado}
            isLoading={isLoading}
            onCancel={handleCloseForm}
          />
        </View>
      )}
      
      {/* Botón flotante para agregar empleado */}
      {!isFormVisible && renderAddButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: 16,
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
