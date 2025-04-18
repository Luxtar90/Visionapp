// src/components/Notificaciones/NotificacionCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notificacion, EstadoNotificacion, TipoNotificacion } from '../../interfaces/Notificacion';
import { colors } from '../../theme/colors';

interface NotificacionCardProps {
  notificacion: Notificacion;
  onPress: (notificacion: Notificacion) => void;
  onEnviar?: (id: string) => void;
  onCancelar?: (id: string) => void;
  onEliminar?: (id: string) => void;
  mostrarAcciones?: boolean;
}

export const NotificacionCard: React.FC<NotificacionCardProps> = ({
  notificacion,
  onPress,
  onEnviar,
  onCancelar,
  onEliminar,
  mostrarAcciones = true,
}) => {
  const getIconoTipo = (tipo: TipoNotificacion): string => {
    switch (tipo) {
      case 'informativa':
        return 'information-circle';
      case 'promocion':
        return 'pricetag';
      case 'recordatorio':
        return 'alarm';
      case 'alerta':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getColorTipo = (tipo: TipoNotificacion): string => {
    switch (tipo) {
      case 'informativa':
        return colors.info;
      case 'promocion':
        return colors.success;
      case 'recordatorio':
        return colors.warning;
      case 'alerta':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getEstadoTexto = (estado: EstadoNotificacion): string => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'enviada':
        return 'Enviada';
      case 'leida':
        return 'Leída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return '';
    }
  };

  const getEstadoColor = (estado: EstadoNotificacion): string => {
    switch (estado) {
      case 'pendiente':
        return colors.warning;
      case 'enviada':
        return colors.info;
      case 'leida':
        return colors.success;
      case 'cancelada':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const formatFecha = (fecha?: string): string => {
    if (!fecha) return 'N/A';
    
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

  const getDestinatarioTexto = (): string => {
    switch (notificacion.destinatario) {
      case 'cliente':
        return 'Clientes';
      case 'empleado':
        return 'Empleados';
      case 'todos':
        return 'Todos';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        notificacion.estado === 'cancelada' && styles.cardCancelada,
      ]}
      onPress={() => onPress(notificacion)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: getColorTipo(notificacion.tipo) + '20' }
          ]}
        >
          <Ionicons 
            name={getIconoTipo(notificacion.tipo)} 
            size={24} 
            color={getColorTipo(notificacion.tipo)} 
          />
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.titulo}>{notificacion.titulo}</Text>
          
          <View style={styles.metaInfo}>
            <View 
              style={[
                styles.estadoBadge, 
                { backgroundColor: getEstadoColor(notificacion.estado) + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.estadoTexto, 
                  { color: getEstadoColor(notificacion.estado) }
                ]}
              >
                {getEstadoTexto(notificacion.estado)}
              </Text>
            </View>
            
            <Text style={styles.destinatario}>
              {getDestinatarioTexto()}
            </Text>
            
            {notificacion.programada && (
              <View style={styles.programadaBadge}>
                <Ionicons name="time-outline" size={12} color={colors.primary} />
                <Text style={styles.programadaTexto}>Programada</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <Text style={styles.mensaje} numberOfLines={2}>
        {notificacion.mensaje}
      </Text>
      
      {notificacion.imagen_url && (
        <Image 
          source={{ uri: notificacion.imagen_url }} 
          style={styles.imagen}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.cardFooter}>
        <View style={styles.fechaContainer}>
          <Ionicons name="calendar-outline" size={14} color={colors.text + '80'} />
          <Text style={styles.fechaTexto}>
            {notificacion.programada && notificacion.estado === 'pendiente'
              ? `Programada: ${formatFecha(notificacion.fecha_programada)}`
              : `Creada: ${formatFecha(notificacion.fecha_creacion)}`}
          </Text>
        </View>
        
        {mostrarAcciones && (
          <View style={styles.accionesContainer}>
            {notificacion.estado === 'pendiente' && onEnviar && (
              <TouchableOpacity 
                style={styles.accionBoton}
                onPress={() => onEnviar(notificacion.id)}
              >
                <Ionicons name="paper-plane" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            {notificacion.estado === 'pendiente' && onCancelar && (
              <TouchableOpacity 
                style={styles.accionBoton}
                onPress={() => onCancelar(notificacion.id)}
              >
                <Ionicons name="close-circle" size={18} color={colors.error} />
              </TouchableOpacity>
            )}
            
            {onEliminar && (
              <TouchableOpacity 
                style={styles.accionBoton}
                onPress={() => onEliminar(notificacion.id)}
              >
                <Ionicons name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCancelada: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '500',
  },
  destinatario: {
    fontSize: 12,
    color: colors.text + '99',
    marginRight: 8,
  },
  programadaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programadaTexto: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 2,
  },
  mensaje: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  imagen: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaTexto: {
    fontSize: 12,
    color: colors.text + '80',
    marginLeft: 4,
  },
  accionesContainer: {
    flexDirection: 'row',
  },
  accionBoton: {
    padding: 6,
    marginLeft: 8,
  },
});
