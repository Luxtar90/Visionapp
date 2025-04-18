// src/screens/Cliente/NotificacionesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'reserva' | 'promocion' | 'sistema';
}

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas');

  useEffect(() => {
    // Simular carga de datos
    const fetchNotificaciones = async () => {
      try {
        // Aquí se llamaría a la API para obtener las notificaciones
        // const response = await getNotificacionesByUsuario();
        
        // Datos de ejemplo
        const mockData: Notificacion[] = [
          {
            id: '1',
            titulo: 'Recordatorio de cita',
            mensaje: 'Recuerda que tienes una cita para Corte de Cabello mañana a las 15:00 hrs.',
            fecha: '2025-03-25T10:00:00',
            leida: false,
            tipo: 'reserva',
          },
          {
            id: '2',
            titulo: 'Promoción especial',
            mensaje: 'Aprovecha 20% de descuento en todos los tratamientos faciales este fin de semana.',
            fecha: '2025-03-24T09:30:00',
            leida: true,
            tipo: 'promocion',
          },
          {
            id: '3',
            titulo: 'Cambio de horario',
            mensaje: 'Tu cita del día 30/03 ha sido cambiada de 14:00 a 16:00 hrs. Por favor confirma si el nuevo horario te conviene.',
            fecha: '2025-03-23T16:45:00',
            leida: false,
            tipo: 'reserva',
          },
          {
            id: '4',
            titulo: 'Nuevos productos disponibles',
            mensaje: 'Hemos añadido una nueva línea de productos para el cuidado del cabello. ¡Ven a conocerlos!',
            fecha: '2025-03-20T11:20:00',
            leida: true,
            tipo: 'promocion',
          },
          {
            id: '5',
            titulo: 'Actualización de términos',
            mensaje: 'Hemos actualizado nuestra política de privacidad. Por favor revisa los nuevos términos en tu próxima visita.',
            fecha: '2025-03-15T08:00:00',
            leida: true,
            tipo: 'sistema',
          },
        ];
        
        setNotificaciones(mockData);
      } catch (error) {
        console.error('Error fetching notificaciones:', error);
        Alert.alert(
          'Error',
          'No se pudieron cargar las notificaciones. Por favor intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (filtro === 'todas') return true;
    return !notif.leida;
  });

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
    // Aquí se llamaría a la API para marcar como leída
    // await updateNotificacionLeida(id);
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => 
      prev.map(notif => ({ ...notif, leida: true }))
    );
    // Aquí se llamaría a la API para marcar todas como leídas
    // await updateTodasNotificacionesLeidas();
    Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Hoy
      return `Hoy, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      // Ayer
      return `Ayer, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays < 7) {
      // Esta semana
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return `${days[date.getDay()]}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      // Más de una semana
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'reserva':
        return 'calendar-outline';
      case 'promocion':
        return 'pricetag-outline';
      case 'sistema':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filtro === 'todas' && styles.activeFilterButton]}
            onPress={() => setFiltro('todas')}
          >
            <Text style={[styles.filterText, filtro === 'todas' && styles.activeFilterText]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filtro === 'no_leidas' && styles.activeFilterButton]}
            onPress={() => setFiltro('no_leidas')}
          >
            <Text style={[styles.filterText, filtro === 'no_leidas' && styles.activeFilterText]}>
              No leídas
            </Text>
          </TouchableOpacity>
        </View>
        {notificaciones.some(n => !n.leida) && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={marcarTodasComoLeidas}
          >
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificacionesFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filtro === 'todas' 
              ? 'No tienes notificaciones' 
              : 'No tienes notificaciones sin leer'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificacionesFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationItem, !item.leida && styles.unreadNotification]}
              onPress={() => marcarComoLeida(item.id)}
            >
              <View style={styles.notificationIcon}>
                <Ionicons 
                  name={getIconForType(item.tipo)} 
                  size={24} 
                  color={!item.leida ? colors.primary : colors.text} 
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, !item.leida && styles.unreadText]}>
                    {item.titulo}
                  </Text>
                  <Text style={styles.notificationDate}>{formatDate(item.fecha)}</Text>
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {item.mensaje}
                </Text>
                {!item.leida && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  markAllButton: {
    alignSelf: 'flex-end',
  },
  markAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadNotification: {
    backgroundColor: '#edf7ff',
    borderColor: colors.primary,
  },
  notificationIcon: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: colors.primary,
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
