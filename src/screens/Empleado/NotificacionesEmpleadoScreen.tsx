// src/screens/Empleado/NotificacionesEmpleadoScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity,
  RefreshControl,
  Modal,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusMessage } from '../../components/common/StatusMessage';
import { SearchBar } from '../../components/common/SearchBar';
import { colors } from '../../theme/colors';

// Interfaz temporal para notificaciones
interface NotificacionEmpleado {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'informativa' | 'alerta' | 'recordatorio';
}

export const NotificacionesEmpleadoScreen: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<NotificacionEmpleado[]>([]);
  const [filteredNotificaciones, setFilteredNotificaciones] = useState<NotificacionEmpleado[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [selectedNotificacion, setSelectedNotificacion] = useState<NotificacionEmpleado | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Datos de ejemplo
  const notificacionesEjemplo: NotificacionEmpleado[] = [
    {
      id: '1',
      titulo: 'Nuevo horario de trabajo',
      mensaje: 'A partir del próximo lunes, el horario de trabajo se extenderá hasta las 19:00 horas. Por favor, ajusta tu agenda en consecuencia.',
      fecha: '2023-04-15T10:30:00',
      leida: false,
      tipo: 'informativa'
    },
    {
      id: '2',
      titulo: 'Recordatorio: Reunión de equipo',
      mensaje: 'Recuerda que mañana a las 9:00 tendremos la reunión mensual de equipo. Es obligatoria la asistencia de todos los empleados.',
      fecha: '2023-04-14T15:45:00',
      leida: true,
      tipo: 'recordatorio'
    },
    {
      id: '3',
      titulo: 'Alerta: Cambio en protocolos de seguridad',
      mensaje: 'Se han actualizado los protocolos de seguridad e higiene. Es importante que revises el documento adjunto y apliques los nuevos procedimientos de inmediato.',
      fecha: '2023-04-10T08:20:00',
      leida: true,
      tipo: 'alerta'
    }
  ];

  const loadNotificaciones = useCallback(() => {
    setIsLoading(true);
    try {
      // Simulando carga de datos
      setTimeout(() => {
        setNotificaciones(notificacionesEjemplo);
        setFilteredNotificaciones(notificacionesEjemplo);
        setIsLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar las notificaciones. Intente nuevamente.'
      });
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  useFocusEffect(
    useCallback(() => {
      loadNotificaciones();
    }, [loadNotificaciones])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotificaciones();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredNotificaciones(notificaciones);
    } else {
      const filtered = notificaciones.filter(
        notificacion => 
          notificacion.titulo.toLowerCase().includes(text.toLowerCase()) ||
          notificacion.mensaje.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNotificaciones(filtered);
    }
  };

  const handleNotificacionPress = (notificacion: NotificacionEmpleado) => {
    setSelectedNotificacion(notificacion);
    setShowDetail(true);
    
    // Marcar como leída
    if (!notificacion.leida) {
      const updatedNotificaciones = notificaciones.map(item => 
        item.id === notificacion.id ? { ...item, leida: true } : item
      );
      setNotificaciones(updatedNotificaciones);
      setFilteredNotificaciones(
        filteredNotificaciones.map(item => 
          item.id === notificacion.id ? { ...item, leida: true } : item
        )
      );
    }
  };

  const handleMarcarTodasLeidas = () => {
    const updatedNotificaciones = notificaciones.map(item => ({ ...item, leida: true }));
    setNotificaciones(updatedNotificaciones);
    setFilteredNotificaciones(
      filteredNotificaciones.map(item => ({ ...item, leida: true }))
    );
    setStatusMessage({
      type: 'success',
      message: 'Todas las notificaciones han sido marcadas como leídas'
    });
  };

  const getTipoIcon = (tipo: string): any => {
    switch (tipo) {
      case 'informativa':
        return 'information-circle';
      case 'alerta':
        return 'warning';
      case 'recordatorio':
        return 'alarm';
      default:
        return 'notifications';
    }
  };

  const getTipoColor = (tipo: string): string => {
    switch (tipo) {
      case 'informativa':
        return colors.info;
      case 'alerta':
        return colors.error;
      case 'recordatorio':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const formatFecha = (fecha: string): string => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === ayer.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const renderNotificacionItem = ({ item }: { item: NotificacionEmpleado }) => (
    <TouchableOpacity 
      style={[
        styles.notificacionItem,
        !item.leida && styles.notificacionNoLeida
      ]}
      onPress={() => handleNotificacionPress(item)}
    >
      <View 
        style={[
          styles.iconContainer, 
          { backgroundColor: getTipoColor(item.tipo) + '20' }
        ]}
      >
        <Ionicons 
          name={getTipoIcon(item.tipo)} 
          size={24} 
          color={getTipoColor(item.tipo)} 
        />
      </View>
      
      <View style={styles.notificacionContent}>
        <View style={styles.notificacionHeader}>
          <Text 
            style={[
              styles.notificacionTitulo,
              !item.leida && styles.textoNoLeido
            ]}
            numberOfLines={1}
          >
            {item.titulo}
          </Text>
          {!item.leida && (
            <View style={styles.indicadorNoLeido} />
          )}
        </View>
        
        <Text 
          style={styles.notificacionMensaje}
          numberOfLines={2}
        >
          {item.mensaje}
        </Text>
        
        <Text style={styles.notificacionFecha}>
          {formatFecha(item.fecha)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDetalleModal = () => {
    if (!selectedNotificacion) return null;
    
    return (
      <Modal
        visible={showDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetail(false)}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notificación</Text>
              <View style={{ width: 24 }} />
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.tipoBadge}>
                <Ionicons 
                  name={getTipoIcon(selectedNotificacion.tipo) as any} 
                  size={16} 
                  color={getTipoColor(selectedNotificacion.tipo)} 
                />
                <Text style={[styles.tipoTexto, { color: getTipoColor(selectedNotificacion.tipo) }]}>
                  {selectedNotificacion.tipo.charAt(0).toUpperCase() + selectedNotificacion.tipo.slice(1)}
                </Text>
              </View>
              
              <Text style={styles.detalleTitulo}>
                {selectedNotificacion.titulo}
              </Text>
              
              <Text style={styles.detalleFecha}>
                {formatFecha(selectedNotificacion.fecha)}
              </Text>
              
              <Text style={styles.detalleMensaje}>
                {selectedNotificacion.mensaje}
              </Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

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
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {notificaciones.some(n => !n.leida) && (
          <TouchableOpacity 
            style={styles.marcarLeidasButton}
            onPress={handleMarcarTodasLeidas}
          >
            <Text style={styles.marcarLeidasText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar notificaciones..."
        />
      </View>
      
      <FlatList
        data={filteredNotificaciones}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificacionItem}
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
            <Ionicons name="notifications-off-outline" size={48} color={colors.text + '40'} />
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' 
                ? 'No se encontraron notificaciones que coincidan con la búsqueda' 
                : 'No tienes notificaciones'}
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
      
      {renderDetalleModal()}
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
  marcarLeidasButton: {
    padding: 8,
  },
  marcarLeidasText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
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
  notificacionItem: {
    flexDirection: 'row',
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
  notificacionNoLeida: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificacionTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  textoNoLeido: {
    fontWeight: 'bold',
  },
  indicadorNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificacionMensaje: {
    fontSize: 14,
    color: colors.text + '99',
    marginBottom: 8,
  },
  notificacionFecha: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  tipoTexto: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  detalleTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  detalleFecha: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 16,
  },
  detalleMensaje: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
});
