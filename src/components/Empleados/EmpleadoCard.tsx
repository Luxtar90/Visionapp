// src/components/Empleados/EmpleadoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Empleado } from '../../api/empleados.api';

interface EmpleadoCardProps {
  empleado: Empleado;
  onPress: (empleado: Empleado) => void;
  onToggleActivo?: (empleado: Empleado) => void;
}

export const EmpleadoCard = ({ 
  empleado, 
  onPress, 
  onToggleActivo 
}: EmpleadoCardProps) => {
  const isActive = empleado.activo_para_reservas;
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(empleado)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          {empleado.foto_url ? (
            <Image 
              source={{ uri: empleado.foto_url }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[
              styles.avatarPlaceholder,
              { backgroundColor: isActive ? colors.primary + '20' : colors.text + '20' }
            ]}>
              <Text style={[
                styles.avatarText,
                { color: isActive ? colors.primary : colors.text }
              ]}>
                {empleado.nombres ? empleado.nombres.charAt(0) : ''}
                {empleado.apellidos ? empleado.apellidos.charAt(0) : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nombre} numberOfLines={1}>
              {empleado.nombres || ''} {empleado.apellidos || ''}
            </Text>
            
            {onToggleActivo && (
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => onToggleActivo(empleado)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isActive ? "checkmark-circle" : "close-circle"} 
                  size={22} 
                  color={isActive ? colors.success : colors.error} 
                />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color={colors.text + 'CC'} style={styles.icon} />
            <Text style={styles.detailText} numberOfLines={1}>{empleado.email || 'Sin email'}</Text>
          </View>
          
          {empleado.telefono ? (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color={colors.text + 'CC'} style={styles.icon} />
              <Text style={styles.detailText} numberOfLines={1}>{empleado.telefono}</Text>
            </View>
          ) : null}
          
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Ionicons name="briefcase-outline" size={12} color={colors.primary} style={styles.tagIcon} />
              <Text style={styles.tagText} numberOfLines={1}>
                {empleado.cargo || empleado.nivel_estudio || 'Sin especialidad'}
              </Text>
            </View>
            
            {/* Solo mostramos el estado si está inactivo, para reducir el ruido visual */}
            {!isActive && (
              <View style={styles.statusTag}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  Inactivo
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  toggleButton: {
    padding: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text + 'CC',
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: colors.error + '20',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.error,
  },
});
