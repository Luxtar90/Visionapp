// src/screens/Admin/TiendasScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Componentes
import { Header } from '../../components/common/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { TiendaCard } from '../../components/Tiendas/TiendaCard';
import { TiendaDetalleModal } from '../../components/Tiendas/TiendaDetalleModal';
import { TiendaForm } from '../../components/Tiendas/TiendaForm';
import { StatusMessage } from '../../components/common/StatusMessage';

// API
import { 
  getTiendas, 
  createTienda, 
  updateTienda, 
  deleteTienda,
  toggleTiendaActiva,
  buscarTiendas
} from '../../api/tiendas.api';

// Interfaces
import { Tienda } from '../../interfaces/Tienda';

// Tema
import { colors } from '../../theme/colors';

export default function TiendasScreen() {
  // Estado
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [filteredTiendas, setFilteredTiendas] = useState<Tienda[]>([]);
  const [selectedTienda, setSelectedTienda] = useState<Tienda | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  // Cargar tiendas
  const loadTiendas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTiendas();
      setTiendas(data);
      
      // Aplicar filtro de activas/inactivas
      if (!mostrarInactivas) {
        setFilteredTiendas(data.filter(tienda => tienda.activa));
      } else {
        setFilteredTiendas(data);
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar las tiendas. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mostrarInactivas]);

  // Cargar tiendas cuando cambia la pantalla o cuando obtiene el foco
  useEffect(() => {
    loadTiendas();
  }, [loadTiendas]);

  useFocusEffect(
    useCallback(() => {
      loadTiendas();
    }, [loadTiendas])
  );

  // Buscar tiendas
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // Aplicar filtro de activas/inactivas
      if (!mostrarInactivas) {
        setFilteredTiendas(tiendas.filter(tienda => tienda.activa));
      } else {
        setFilteredTiendas(tiendas);
      }
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await buscarTiendas(query);
      
      // Aplicar filtro de activas/inactivas a los resultados de búsqueda
      if (!mostrarInactivas) {
        setFilteredTiendas(results.filter(tienda => tienda.activa));
      } else {
        setFilteredTiendas(results);
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al buscar tiendas. Por favor, intenta de nuevo.'
      });
      
      // Aplicar filtro de activas/inactivas
      if (!mostrarInactivas) {
        setFilteredTiendas(tiendas.filter(tienda => tienda.activa));
      } else {
        setFilteredTiendas(tiendas);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tiendas, mostrarInactivas]);

  // Cambiar filtro de mostrar inactivas
  const toggleMostrarInactivas = () => {
    setMostrarInactivas(prev => !prev);
    
    // Aplicar el nuevo filtro
    if (mostrarInactivas) {
      // Si estaba mostrando inactivas, ahora solo muestra activas
      setFilteredTiendas(tiendas.filter(tienda => tienda.activa));
    } else {
      // Si solo mostraba activas, ahora muestra todas
      setFilteredTiendas(tiendas);
    }
  };

  // Refrescar la lista
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchQuery('');
    loadTiendas();
  };

  // Abrir modal de detalles
  const handleOpenModal = (tienda: Tienda) => {
    setSelectedTienda(tienda);
    setIsModalVisible(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTienda(null);
  };

  // Abrir formulario de creación
  const handleOpenForm = () => {
    setIsFormVisible(true);
  };

  // Cerrar formulario de creación
  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  // Crear tienda
  const handleCreateTienda = async (data: Partial<Tienda>) => {
    try {
      setIsLoading(true);
      
      // Asignar fecha de registro
      data.fecha_registro = new Date().toISOString();
      data.activa = true;
      
      await createTienda(data);
      await loadTiendas();
      
      setStatusMessage({
        type: 'success',
        message: 'Tienda creada correctamente'
      });
      
      setIsFormVisible(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al crear la tienda. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar tienda
  const handleUpdateTienda = async (data: Partial<Tienda>) => {
    if (!data.id) return;
    
    try {
      setIsLoading(true);
      await updateTienda(data.id, data);
      await loadTiendas();
      
      setStatusMessage({
        type: 'success',
        message: 'Tienda actualizada correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al actualizar la tienda. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar tienda
  const handleDeleteTienda = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteTienda(id);
      await loadTiendas();
      
      setStatusMessage({
        type: 'success',
        message: 'Tienda eliminada correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar la tienda. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleActiva = async (tienda: Tienda) => {
    try {
      setIsLoading(true);
      await toggleTiendaActiva(tienda.id, !tienda.activa);
      await loadTiendas();
      
      setStatusMessage({
        type: 'success',
        message: `Tienda ${tienda.activa ? 'desactivada' : 'activada'} correctamente`
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado de la tienda. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar el botón de agregar tienda
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
        title="Tiendas" 
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
          placeholder="Buscar tiendas..."
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleMostrarInactivas}
        >
          <Ionicons 
            name={mostrarInactivas ? "eye" : "eye-off"} 
            size={18} 
            color={colors.primary} 
            style={styles.filterIcon}
          />
          <Text style={styles.filterText}>
            {mostrarInactivas ? "Ocultar inactivas" : "Mostrar inactivas"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Cargando tiendas..." />
      ) : filteredTiendas.length === 0 ? (
        <EmptyState
          icon="business-outline"
          message={
            searchQuery
              ? "No se encontraron tiendas con esa búsqueda"
              : mostrarInactivas
                ? "No hay tiendas registradas"
                : "No hay tiendas activas"
          }
          actionLabel={
            searchQuery 
              ? "Limpiar búsqueda" 
              : mostrarInactivas
                ? "Agregar tienda"
                : "Mostrar inactivas"
          }
          onAction={
            searchQuery 
              ? () => handleSearch('') 
              : mostrarInactivas
                ? handleOpenForm
                : toggleMostrarInactivas
          }
        />
      ) : (
        <FlatList
          data={filteredTiendas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TiendaCard
              tienda={item}
              onPress={handleOpenModal}
              onToggleActiva={handleToggleActiva}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
      
      {/* Modal de detalles de la tienda */}
      <TiendaDetalleModal
        visible={isModalVisible}
        tienda={selectedTienda}
        onClose={handleCloseModal}
        onUpdate={handleUpdateTienda}
        onDelete={handleDeleteTienda}
        isLoading={isLoading}
      />
      
      {/* Modal de formulario de creación */}
      {isFormVisible && (
        <View style={styles.formContainer}>
          <Header 
            title="Nueva Tienda" 
            showBackButton 
            onBackPress={handleCloseForm} 
          />
          
          <TiendaForm
            onSubmit={handleCreateTienda}
            isLoading={isLoading}
            onCancel={handleCloseForm}
          />
        </View>
      )}
      
      {/* Botón flotante para agregar tienda */}
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
  filterContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: colors.primary,
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
