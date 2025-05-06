// src/screens/Admin/ClientesScreen.tsx
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

  // Cargar clientes
  const loadClientes = useCallback(async () => {
    if (!tiendaId) {
      console.log('No hay tienda seleccionada');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Cargando clientes para tienda:', tiendaId);
      
      // Verificar que el ID de tienda sea válido
      if (tiendaId.trim() === '') {
        console.error('ID de tienda inválido (vacío)');
        setStatusMessage({
          type: 'error',
          message: 'ID de tienda inválido. Por favor, seleccione una tienda en su perfil.'
        });
        setIsLoading(false);
        return;
      }
      
      // Añadir un cliente de prueba si no hay datos
      try {
        const data = await getClientes(tiendaId);
        console.log('Clientes cargados:', data ? data.length : 0);
        
        if (!data || data.length === 0) {
          console.log('No hay clientes, creando uno de prueba...');
          
          // Crear un cliente de prueba
          const clientePrueba: Partial<Cliente> = {
            nombres: 'Cliente',
            apellidos: 'Prueba',
            identificacion: `temp-${Date.now()}`,
            email: 'cliente.prueba@ejemplo.com',
            telefono: '555-123-4567',
            direccion_detalle: 'Calle Ejemplo 123',
            fecha_nacimiento: new Date().toISOString(),
            origen_cita: 'Aplicación móvil',
            puntos_acumulados: 0,
            tiendaId: tiendaId ? parseInt(tiendaId) : null
          };
          
          try {
            const nuevoCliente = await createCliente(clientePrueba);
            console.log('Cliente de prueba creado:', nuevoCliente);
            setClientes([nuevoCliente]);
            setFilteredClientes([nuevoCliente]);
            setStatusMessage({
              type: 'success',
              message: 'Se ha creado un cliente de prueba'
            });
          } catch (createError) {
            console.error('Error al crear cliente de prueba:', createError);
            setClientes([]);
            setFilteredClientes([]);
          }
        } else {
          setClientes(data);
          setFilteredClientes(data);
        }
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
        setStatusMessage({
          type: 'error',
          message: 'Error al cargar los clientes. Por favor, intenta de nuevo.'
        });
        // Inicializar con arrays vacíos para evitar errores
        setClientes([]);
        setFilteredClientes([]);
      }
    } catch (outerError) {
      console.error('Error general en loadClientes:', outerError);
      setStatusMessage({
        type: 'error',
        message: 'Error inesperado. Por favor, intenta de nuevo.'
      });
      setClientes([]);
      setFilteredClientes([]);
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

  // Abrir pantalla de detalles
  const handleOpenModal = (cliente: Cliente) => {
    navigation.navigate('DetalleCliente' as never, { cliente } as never);
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
      
      // Preparar datos para la API
      const clienteData: Partial<Cliente> = {
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        identificacion: data.identificacion || `temp-${Date.now()}`,
        email: data.email || '',
        telefono: data.telefono || '',
        direccion_detalle: data.direccion_detalle || '',
        fecha_nacimiento: data.fecha_nacimiento,
        origen_cita: data.origen_cita || 'Aplicación móvil',
        puntos_acumulados: 0,
        tiendaId: tiendaId ? parseInt(tiendaId) : null
      };
      
      await createCliente(clienteData);
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
      await updateCliente(data.id.toString(), data);
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
      
      // En la nueva estructura, consideramos que un cliente está activo si tiene tiendaId
      const isActive = cliente.tiendaId !== null;
      
      // Si está activo, lo desactivamos (quitamos la tienda)
      // Si está inactivo, lo activamos (asignamos la tienda actual)
      const updatedData: Partial<Cliente> = {
        tiendaId: isActive ? null : (tiendaId ? parseInt(tiendaId) : null)
      };
      
      await updateCliente(cliente.id.toString(), updatedData);
      await loadClientes();
      
      setStatusMessage({
        type: 'success',
        message: `Cliente ${isActive ? 'desactivado' : 'activado'} correctamente`
      });
    } catch (error) {
      console.error('Error al cambiar el estado del cliente:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado del cliente. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
          style={styles.searchBarStyle}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleOpenForm}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
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
          keyExtractor={(item) => item.id.toString()}
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
      
      {/* Modal de formulario de creación */}
      {isFormVisible && (
        <View style={styles.formContainer}>
          <ClienteForm
            onSubmit={handleCreateCliente}
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
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
    marginTop: 8,
  },
  searchBarStyle: {
    flex: 1,
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  addButton: {
    marginLeft: 8,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: 'white',
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
