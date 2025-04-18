// src/components/Empleados/EmpleadoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
  foto_url?: string;
}

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
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(empleado)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {empleado.foto_url ? (
            <Image 
              source={{ uri: empleado.foto_url }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.nombre}>
            {empleado.nombre} {empleado.apellido}
          </Text>
          <Text style={styles.especialidad}>{empleado.especialidad}</Text>
        </View>
        
        {onToggleActivo && (
          <TouchableOpacity 
            style={[
              styles.statusBadge,
              empleado.activo ? styles.activeBadge : styles.inactiveBadge
            ]}
            onPress={() => onToggleActivo(empleado)}
          >
            <Ionicons 
              name={empleado.activo ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={empleado.activo ? '#2ecc71' : '#e74c3c'} 
            />
            <Text 
              style={[
                styles.statusText,
                empleado.activo ? styles.activeText : styles.inactiveText
              ]}
            >
              {empleado.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={16} color="#777" />
          <Text style={styles.contactText}>{empleado.email}</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={16} color="#777" />
          <Text style={styles.contactText}>{empleado.telefono}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  especialidad: {
    fontSize: 14,
    color: '#777',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
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
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
});
