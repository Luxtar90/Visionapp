// src/components/Tiendas/TiendaCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tienda } from '../../interfaces/Tienda';
import { colors } from '../../theme/colors';

interface TiendaCardProps {
  tienda: Tienda;
  onPress: (tienda: Tienda) => void;
  onToggleActiva?: (tienda: Tienda) => void;
}

export const TiendaCard: React.FC<TiendaCardProps> = ({
  tienda,
  onPress,
  onToggleActiva,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, !tienda.activa && styles.inactiveCard]}
      onPress={() => onPress(tienda)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          {tienda.logo_url ? (
            <Image source={{ uri: tienda.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>
                {tienda.nombre.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{tienda.nombre}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.text} style={styles.icon} />
            <Text style={styles.detailText}>{tienda.direccion}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={colors.text} style={styles.icon} />
            <Text style={styles.detailText}>{tienda.telefono}</Text>
          </View>
          
          {tienda.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={16} color={colors.text} style={styles.icon} />
              <Text style={styles.detailText}>{tienda.email}</Text>
            </View>
          )}
        </View>
        
        {onToggleActiva && (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => onToggleActiva(tienda)}
          >
            <Ionicons
              name={tienda.activa ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={tienda.activa ? colors.success : colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {tienda.horario && (
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={colors.text + '80'} />
            <Text style={styles.footerText}>
              Horario: {tienda.horario}
            </Text>
          </View>
        </View>
      )}
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
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
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
