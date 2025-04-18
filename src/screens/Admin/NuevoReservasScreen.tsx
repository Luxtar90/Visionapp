// src/screens/Admin/ReservasScreen.tsx
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
import { ReservaCard } from '../../components/Reservas/ReservaCard';
import { ReservaDetalleModal } from '../../components/Reservas/ReservaDetalleModal';
import { FiltrosReserva } from '../../components/Reservas/FiltrosReserva';
import { StatusMessage } from '../../components/common/StatusMessage';

// API
import { 
  getReservasCompletas, 
  cambiarEstadoReserva 
} from '../../api/reservas.api';

// Interfaces
import { Reserva } from '../../interfaces/Reserva';

// Tema
import { colors } from '../../theme/colors';

export default function ReservasScreen() {
  // Estado
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [procesandoEstado, setProcesandoEstado] = useState(false);
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

  // Cargar reservas
  const loadReservas = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      setIsLoading(true);
      const data = await getReservasCompletas({ tiendaId });
      setReservas(data);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar las reservas. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tiendaId]);

  // Cargar reservas cuando cambia la tienda o cuando la pantalla obtiene el foco
  useEffect(() => {
    if (tiendaId) {
      loadReservas();
    }
  }, [tiendaId, loadReservas]);

  useFocusEffect(
    useCallback(() => {
      if (tiendaId) {
        loadReservas();
      }
    }, [tiendaId, loadReservas])
  );

  // Filtrar reservas cuando cambia la búsqueda o el filtro
  useEffect(() => {
    let filtered = [...reservas];
    
    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      filtered = filtered.filter(reserva => reserva.estado === filtroEstado);
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        reserva =>
          reserva.cliente.nombre.toLowerCase().includes(query) ||
          reserva.cliente.apellido.toLowerCase().includes(query) ||
          reserva.cliente.telefono.includes(query) ||
          reserva.servicio.nombre.toLowerCase().includes(query) ||
          reserva.empleado.nombre.toLowerCase().includes(query) ||
          reserva.empleado.apellido.toLowerCase().includes(query)
      );
    }
    
    setFilteredReservas(filtered);
  }, [searchQuery, filtroEstado, reservas]);

  // Refrescar la lista
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReservas();
  };

  // Abrir modal de detalles
  const handleVerDetalles = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setIsModalVisible(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedReserva(null);
  };

  // Cambiar estado de la reserva
  const handleCambiarEstado = async (nuevoEstado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada') => {
    if (!selectedReserva) return;
    
    try {
      setProcesandoEstado(true);
      await cambiarEstadoReserva(selectedReserva.id, nuevoEstado);
      await loadReservas();
      
      setStatusMessage({
        type: 'success',
        message: `Reserva ${
          nuevoEstado === 'pendiente' ? 'marcada como pendiente' :
          nuevoEstado === 'confirmada' ? 'confirmada' :
          nuevoEstado === 'completada' ? 'completada' : 'cancelada'
        } correctamente`
      });
      
      handleCloseModal();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al cambiar el estado de la reserva. Por favor, intenta de nuevo.'
      });
    } finally {
      setProcesandoEstado(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Reservas" />
      
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
          placeholder="Buscar reservas..."
        />
      </View>
      
      <FiltrosReserva
        filtroActual={filtroEstado}
        onFiltroChange={setFiltroEstado}
      />
      
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Cargando reservas..." />
      ) : filteredReservas.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          message={
            searchQuery || filtroEstado !== 'todas'
              ? "No se encontraron reservas con esos filtros"
              : "No hay reservas registradas"
          }
          actionLabel={searchQuery || filtroEstado !== 'todas' ? "Limpiar filtros" : undefined}
          onAction={searchQuery || filtroEstado !== 'todas' ? () => {
            setSearchQuery('');
            setFiltroEstado('todas');
          } : undefined}
        />
      ) : (
        <FlatList
          data={filteredReservas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReservaCard
              reserva={item}
              onPress={handleVerDetalles}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
      
      {/* Modal de detalles de la reserva */}
      <ReservaDetalleModal
        visible={isModalVisible}
        reserva={selectedReserva}
        onClose={handleCloseModal}
        onCambiarEstado={handleCambiarEstado}
        procesando={procesandoEstado}
      />
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
  },
  listContent: {
    padding: 16,
  },
});
