// src/components/Clientes/ClienteCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cliente } from '../../interfaces/Cliente';
import { colors } from '../../theme/colors';

interface ClienteCardProps {
  cliente: Cliente;
  onPress: (cliente: Cliente) => void;
  onToggleActivo?: (cliente: Cliente) => void;
}

export const ClienteCard: React.FC<ClienteCardProps> = ({
  cliente,
  onPress,
  onToggleActivo,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Determinar si el cliente está activo basado en si tiene tiendaId
  const isActive = cliente.tiendaId !== null;

  return (
    <TouchableOpacity
      style={[styles.card, !isActive && styles.inactiveCard]}
      onPress={() => onPress(cliente)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {cliente.nombres.charAt(0)}
              {cliente.apellidos.charAt(0)}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {cliente.nombres} {cliente.apellidos}
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color={colors.text} style={styles.icon} />
            <Text style={styles.detailText}>{cliente.email || 'Sin correo'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={colors.text} style={styles.icon} />
            <Text style={styles.detailText}>{cliente.telefono || 'Sin teléfono'}</Text>
          </View>
        </View>
        
        {onToggleActivo && (
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => onToggleActivo(cliente)}
          >
            <Ionicons 
              name={isActive ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={isActive ? colors.success : colors.error} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text + '80'} />
          <Text style={styles.footerText}>
            {cliente.fecha_nacimiento ? formatDate(cliente.fecha_nacimiento) : 'Sin fecha de nacimiento'}
          </Text>
        </View>
        
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={16} color={colors.text + '80'} />
          <Text style={styles.footerText} numberOfLines={1} ellipsizeMode="tail">
            {cliente.direccion_detalle ? 
              (cliente.direccion_detalle.length > 25 ? 
                cliente.direccion_detalle.substring(0, 25) + '...' : 
                cliente.direccion_detalle) : 
              (cliente.direccion_ciudad || 'Sin dirección')}
          </Text>
        </View>
        
        <View style={styles.footerItem}>
          <Ionicons name="gift-outline" size={16} color={colors.text + '80'} />
          <Text style={styles.footerText}>
            {cliente.puntos_acumulados} puntos
          </Text>
        </View>
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
    borderWidth: 0,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text + 'CC',
  },
  toggleButton: {
    padding: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text + '99',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});
