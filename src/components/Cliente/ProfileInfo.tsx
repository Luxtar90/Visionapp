// src/components/Cliente/ProfileInfo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ProfileInfoProps {
  label: string;
  value: string | React.ReactNode;
}

/**
 * Componente que renderiza una fila de información del perfil en modo visualización
 */
const ProfileInfo: React.FC<ProfileInfoProps> = ({ label, value }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {typeof value === 'string' ? (
        <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
      ) : (
        <View style={styles.infoValue}>{value}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 150,
    fontWeight: '600',
    color: colors.textLight,
  },
  infoValue: {
    flex: 1,
    color: colors.text,
  },
});

export default ProfileInfo;
