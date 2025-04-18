// src/screens/Admin/ServiciosScreen.tsx
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
import { ServicioCard } from '../../components/Servicios/ServicioCard';
import { ServicioDetalleModal } from '../../components/Servicios/ServicioDetalleModal';
import { ServicioForm } from '../../components/Servicios/ServicioForm';
import { StatusMessage } from '../../components/common/StatusMessage';
import { SelectField, SelectOption } from '../../components/common/SelectField';

// API
import { 
  getServicios, 
  createServicio, 
  updateServicio, 
  deleteServicio,
  toggleServicioActivo
} from '../../api/servicios.api';

// Interfaces
import { Servicio } from '../../interfaces/Servicio';

// Tema
import { colors } from '../../theme/colors';

export default function ServiciosScreen() {
  // Estado
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [tiendaId, setTiendaId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);

  // Cargar tienda seleccionada
  useEffect(() => {
    const loadTiendaId = async () => {
      const storedTiendaId = await AsyncStorage.getItem('tiendaId');
      setTiendaId(storedTiendaId);
    };
    
    loadTiendaId();
  }, []);

  // Cargar servicios
  const loadServicios = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      setIsLoading(true);
      const data = await getServicios(tiendaId);
      setServicios(data);
      
      // Extraer categorías únicas
      const uniqueCategorias = Array.from(new Set(data.map(servicio => servicio.categoria)));
      setCategorias(['todas', ...uniqueCategorias]);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los servicios. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tiendaId]);

  // Cargar servicios cuando cambia la tienda o cuando la pantalla obtiene el foco
  useEffect(() => {
    if (tiendaId) {
      loadServicios();
    }
  }, [tiendaId, loadServicios]);

  useFocusEffect(
    useCallback(() => {
      if (tiendaId) {
        loadServicios();
      }
    }, [tiendaId, loadServicios])
  );

  // Filtrar servicios cuando cambia la búsqueda o el filtro
  useEffect(() => {
    let filtered = [...servicios];
    
    // Filtrar por categoría
    if (filtroCategoria !== 'todas') {
      filtered = filtered.filter(servicio => servicio.categoria === filtroCategoria);
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        servicio =>
          servicio.nombre.toLowerCase().includes(query) ||
          servicio.descripcion.toLowerCase().includes(query) ||
          servicio.categoria.toLowerCase().includes(query)
      );
    }
    
    setFilteredServicios(filtered);
  }, [searchQuery, filtroCategoria, servicios]);

  // Refrescar la lista
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadServicios();
  };

  // Abrir modal de detalles
  const handleOpenModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setIsModalVisible(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedServicio(null);
  };

  // Abrir formulario de creación
  const handleOpenForm = () => {
    setIsFormVisible(true);
  };

  // Cerrar formulario de creación
  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  // Crear servicio
  const handleCreateServicio = async (data: Partial<Servicio>) => {
    try {
      setIsLoading(true);
      
      if (tiendaId) {
        data.tienda_id = tiendaId;
      }
      
      await createServicio(data);
      await loadServicios();
      
      setStatusMessage({
        type: 'success',
        message: 'Servicio creado correctamente'
      });
      
      setIsFormVisible(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al crear el servicio. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar servicio
  const handleUpdateServicio = async (data: Partial<Servicio>) => {
    if (!data.id) return;
    
    try {
      setIsLoading(true);
      await updateServicio(data.id, data);
      await loadServicios();
      
      setStatusMessage({
        type: 'success',
        message: 'Servicio actualizado correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al actualizar el servicio. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar servicio
  const handleDeleteServicio = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteServicio(id);
      await loadServicios();
      
      setStatusMessage({
        type: 'success',
        message: 'Servicio eliminado correctamente'
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar el servicio. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleActivo = async (servicio: Servicio) => {
    try {
      setIsLoading(true);
      await toggleServicioActivo(servicio.id, !servicio.activo);
      await loadServicios();
      
      setStatusMessage({
        type: 'success',
        message: `Servicio ${servicio.activo ? 'desactivado' : 'activado'} correctamente`
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado del servicio. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Opciones para el filtro de categorías
  const getCategoriaOptions = useCallback((): SelectOption[] => {
    return categorias.map(cat => ({
      label: cat === 'todas' ? 'Todas las categorías' : cat,
      value: cat
    }));
  }, [categorias]);

  // Renderizar el botón de agregar servicio
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
        title="Servicios" 
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
          placeholder="Buscar servicios..."
        />
      </View>
      
      <View style={styles.filtroContainer}>
        <SelectField
          label=""
          value={filtroCategoria}
          options={getCategoriaOptions()}
          onValueChange={setFiltroCategoria}
          placeholder="Filtrar por categoría"
          icon="filter-outline"
        />
      </View>
      
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Cargando servicios..." />
      ) : filteredServicios.length === 0 ? (
        <EmptyState
          icon="cut-outline"
          message={
            searchQuery || filtroCategoria !== 'todas'
              ? "No se encontraron servicios con esos filtros"
              : "No hay servicios registrados"
          }
          actionLabel={searchQuery || filtroCategoria !== 'todas' ? "Limpiar filtros" : "Agregar servicio"}
          onAction={searchQuery || filtroCategoria !== 'todas' 
            ? () => {
                setSearchQuery('');
                setFiltroCategoria('todas');
              }
            : handleOpenForm
          }
        />
      ) : (
        <FlatList
          data={filteredServicios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServicioCard
              servicio={item}
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
      
      {/* Modal de detalles del servicio */}
      <ServicioDetalleModal
        visible={isModalVisible}
        servicio={selectedServicio}
        onClose={handleCloseModal}
        onUpdate={handleUpdateServicio}
        onDelete={handleDeleteServicio}
        isLoading={isLoading}
      />
      
      {/* Modal de formulario de creación */}
      {isFormVisible && (
        <View style={styles.formContainer}>
          <Header 
            title="Nuevo Servicio" 
            showBackButton 
            onBackPress={handleCloseForm} 
          />
          
          <ServicioForm
            onSubmit={handleCreateServicio}
            isLoading={isLoading}
            onCancel={handleCloseForm}
          />
        </View>
      )}
      
      {/* Botón flotante para agregar servicio */}
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
  filtroContainer: {
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
