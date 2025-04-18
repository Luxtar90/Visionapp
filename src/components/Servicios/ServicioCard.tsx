// src/components/Servicios/ServicioCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Servicio } from '../../interfaces/Servicio';

interface ServicioCardProps {
  servicio: Servicio;
  onPress: (servicio: Servicio) => void;
  onToggleActivo?: (servicio: Servicio) => void;
}

export const ServicioCard = ({ 
  servicio, 
  onPress, 
  onToggleActivo 
}: ServicioCardProps) => {
  const formatPrecio = (precio: number) => {
    return precio.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const formatDuracion = (duracion: number) => {
    if (duracion < 60) {
      return `${duracion} min`;
    } else {
      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;
      return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.card, !servicio.activo && styles.inactiveCard]}
      onPress={() => onPress(servicio)}
    >
      <View style={styles.cardHeader}>
        {servicio.imagen_url ? (
          <Image 
            source={{ uri: servicio.imagen_url }} 
            style={styles.imagen} 
          />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="cut-outline" size={30} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text style={styles.nombre}>{servicio.nombre}</Text>
          <View style={styles.categoriaContainer}>
            <Text style={styles.categoria}>{servicio.categoria}</Text>
          </View>
        </View>
        
        {onToggleActivo && (
          <TouchableOpacity 
            style={[
              styles.statusBadge,
              servicio.activo ? styles.activeBadge : styles.inactiveBadge
            ]}
            onPress={() => onToggleActivo(servicio)}
          >
            <Ionicons 
              name={servicio.activo ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={servicio.activo ? '#2ecc71' : '#e74c3c'} 
            />
            <Text 
              style={[
                styles.statusText,
                servicio.activo ? styles.activeText : styles.inactiveText
              ]}
            >
              {servicio.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text 
          style={styles.descripcion}
          numberOfLines={2}
        >
          {servicio.descripcion}
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="cash-outline" size={16} color="#777" />
          <Text style={styles.footerText}>{formatPrecio(servicio.precio)}</Text>
        </View>
        
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={16} color="#777" />
          <Text style={styles.footerText}>{formatDuracion(servicio.duracion)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagenPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoriaContainer: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoria: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#2ecc7120',
  },
  inactiveBadge: {
    backgroundColor: '#e74c3c20',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#2ecc71',
  },
  inactiveText: {
    color: '#e74c3c',
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  descripcion: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});
