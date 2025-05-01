// src/components/Cliente/PermissionsSection.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

interface Permission {
  id: string;
  title: string;
  description: string;
  enabled?: boolean;
}

interface PermissionsSectionProps {
  permissions: Permission[];
  togglePermission: (id: string) => void;
  savingPermissions: boolean;
  handleSavePermissions: () => void;
}

/**
 * Componente que renderiza la sección de permisos del perfil
 */
const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  permissions,
  togglePermission,
  savingPermissions,
  handleSavePermissions
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Permisos</Text>
      <Text style={styles.description}>
        Configura tus preferencias de privacidad y comunicación
      </Text>
      
      {permissions.map((permission) => (
        <View key={permission.id} style={styles.permissionItem}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>{permission.title}</Text>
            <Text style={styles.permissionDescription}>{permission.description}</Text>
          </View>
          <Switch
            value={permission.enabled || false}
            onValueChange={() => togglePermission(permission.id)}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={permission.enabled ? colors.primary : colors.card}
          />
        </View>
      ))}
      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePermissions}
        disabled={savingPermissions}
      >
        {savingPermissions ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar Preferencias</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 10,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PermissionsSection;
