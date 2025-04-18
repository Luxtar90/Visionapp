// src/components/Notificaciones/ListaNotificaciones.tsx
import React from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificacionCard } from './NotificacionCard';
import { Notificacion } from '../../interfaces/Notificacion';
import { colors } from '../../theme/colors';

interface ListaNotificacionesProps {
  notificaciones: Notificacion[];
  isLoading: boolean;
  onNotificacionPress: (notificacion: Notificacion) => void;
  onEnviar?: (id: string) => void;
  onCancelar?: (id: string) => void;
  onEliminar?: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  mostrarAcciones?: boolean;
}

export const ListaNotificaciones: React.FC<ListaNotificacionesProps> = ({
  notificaciones,
  isLoading,
  onNotificacionPress,
  onEnviar,
  onCancelar,
  onEliminar,
  onRefresh,
  refreshing = false,
  onEndReached,
  mostrarAcciones = true,
}) => {
  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Cargando notificaciones...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={48} color={colors.text + '40'} />
        <Text style={styles.emptyText}>No hay notificaciones disponibles</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={styles.refreshText}>Actualizar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || refreshing) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Cargando más notificaciones...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={notificaciones}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificacionCard
          notificacion={item}
          onPress={onNotificacionPress}
          onEnviar={onEnviar}
          onCancelar={onCancelar}
          onEliminar={onEliminar}
          mostrarAcciones={mostrarAcciones}
        />
      )}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.text + '80',
    marginLeft: 8,
  },
});
