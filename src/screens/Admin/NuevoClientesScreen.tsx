// src/screens/Admin/ClientesScreen.tsx
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
import { ClienteCard } from '../../components/Clientes/ClienteCard';
import { ClienteDetalleModal } from '../../components/Clientes/ClienteDetalleModal';
import { ClienteForm } from '../../components/Clientes/ClienteForm';
import { StatusMessage } from '../../components/common/StatusMessage';

// API
import { 
  getClientes, 
  createCliente, 
  updateCliente, 
  deleteCliente,
  toggleClienteActivo,
  buscarClientes
} from '../../api/clientes.api';

// Interfaces
import { Cliente } from '../../interfaces/Cliente';

// Tema
import { colors } from '../../theme/colors';

export default function ClientesScreen() {
  // Estado
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
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

  // Cargar clientes
  const loadClientes = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      setIsLoading(true);
      const data = await getClientes(tiendaId);
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los clientes. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tiendaId]);

  // Cargar clientes cuando cambia la tienda o cuando la pantalla obtiene el foco
  useEffect(() => {
    if (tiendaId) {
      loadClientes();
    }
  }, [tiendaId, loadClientes]);

  useFocusEffect(
    useCallback(() => {
      if (tiendaId) {
        loadClientes();
      }
    }, [tiendaId, loadClientes])
  );

  // Buscar clientes
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!tiendaId) return;
    
    if (query.trim() === '') {
      setFilteredClientes(clientes);
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await buscarClientes(query, tiendaId);
      setFilteredClientes(results);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al buscar clientes. Por favor, intenta de nuevo.'
      });
      setFilteredClientes(clientes);
    } finally {
      setIsLoading(false);
    }
  }, [tiendaId, clientes]);

  // Refrescar la lista
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchQuery('');
    loadClientes();
  };

  // Abrir modal de detalles
  const handleOpenModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalVisible(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCliente(null);
  };

  // Abrir formulario de creación
  const handleOpenForm = () => {
    setIsFormVisible(true);
  };

  // Cerrar formulario de creación
  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  // Crear cliente
  const handleCreateCliente = async (data: Partial<Cliente>) => {
    try {
      setIsLoading(true);
      
      // Asignar fecha de registro
      data.fecha_registro = new Date().toISOString();
      data.activo = true;
      
      if (tiendaId) {
        // Asumiendo que la API espera un campo tienda_id
        data.tienda_id = tiendaId;
      }
      
      await createCliente(data);
      await loadClientes();
      
      setStatusMessage({
        type: 'success',
        message: 'Cliente creado correctamente'
      });
      
      setIsFormVisible(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al crear el cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar cliente
  const handleUpdateCliente = async (data: Partial<Cliente>) => {
    if (!data.id) return;
    
    try {
      setIsLoading(true);
      await updateCliente(data.id, data);
      await loadClientes();
      
      setStatusMessage({
        type: 'success',
        message: 'Cliente actualizado correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al actualizar el cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar cliente
  const handleDeleteCliente = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteCliente(id);
      await loadClientes();
      
      setStatusMessage({
        type: 'success',
        message: 'Cliente eliminado correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar el cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleActivo = async (cliente: Cliente) => {
    try {
      setIsLoading(true);
      await toggleClienteActivo(cliente.id, !cliente.activo);
      await loadClientes();
      
      setStatusMessage({
        type: 'success',
        message: `Cliente ${cliente.activo ? 'desactivado' : 'activado'} correctamente`
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado del cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar el botón de agregar cliente
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
        title="Clientes" 
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
          onChangeText={handleSearch}
          placeholder="Buscar clientes..."
        />
      </View>
      
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Cargando clientes..." />
      ) : filteredClientes.length === 0 ? (
        <EmptyState
          icon="people-outline"
          message={
            searchQuery
              ? "No se encontraron clientes con esa búsqueda"
              : "No hay clientes registrados"
          }
          actionLabel={searchQuery ? "Limpiar búsqueda" : "Agregar cliente"}
          onAction={searchQuery ? () => handleSearch('') : handleOpenForm}
        />
      ) : (
        <FlatList
          data={filteredClientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClienteCard
              cliente={item}
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
      
      {/* Modal de detalles del cliente */}
      <ClienteDetalleModal
        visible={isModalVisible}
        cliente={selectedCliente}
        onClose={handleCloseModal}
        onUpdate={handleUpdateCliente}
        onDelete={handleDeleteCliente}
        isLoading={isLoading}
      />
      
      {/* Modal de formulario de creación */}
      {isFormVisible && (
        <View style={styles.formContainer}>
          <Header 
            title="Nuevo Cliente" 
            showBackButton 
            onBackPress={handleCloseForm} 
          />
          
          <ClienteForm
            onSubmit={handleCreateCliente}
            isLoading={isLoading}
            onCancel={handleCloseForm}
          />
        </View>
      )}
      
      {/* Botón flotante para agregar cliente */}
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
