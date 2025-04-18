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

  return (
    <TouchableOpacity
      style={[styles.card, !cliente.activo && styles.inactiveCard]}
      onPress={() => onPress(cliente)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {cliente.foto_url ? (
            <Image source={{ uri: cliente.foto_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {cliente.nombre.charAt(0)}
                {cliente.apellido.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {cliente.nombre} {cliente.apellido}
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color={colors.text} style={styles.icon} />
            <Text style={styles.detailText}>{cliente.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={colors.text} style={styles.icon} />
            <Text style={styles.detailText}>{cliente.telefono}</Text>
          </View>
        </View>
        
        {onToggleActivo && (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => onToggleActivo(cliente)}
          >
            <Ionicons
              name={cliente.activo ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={cliente.activo ? colors.success : colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.text + '80'} />
          <Text style={styles.footerText}>
            Registro: {formatDate(cliente.fecha_registro)}
          </Text>
        </View>
        
        {cliente.ultima_visita && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={colors.text + '80'} />
            <Text style={styles.footerText}>
              Última visita: {formatDate(cliente.ultima_visita)}
            </Text>
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
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  inactiveCard: {
    borderLeftColor: colors.border,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginTop: 2,
  },
  icon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text + 'CC',
  },
  statusButton: {
    padding: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text + '80',
    marginLeft: 4,
  },
});
