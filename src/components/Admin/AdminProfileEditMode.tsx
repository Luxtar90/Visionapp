// src/components/Admin/AdminProfileEditMode.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface AdminProfileEditModeProps {
  editedProfile: any;
  handleInputChange: (field: string, value: string) => void;
  handleCancel: () => void;
  handleSave: () => void;
  saving: boolean;
}

const AdminProfileEditMode: React.FC<AdminProfileEditModeProps> = ({
  editedProfile,
  handleInputChange,
  handleCancel,
  handleSave,
  saving
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar Perfil</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={handleCancel}
            disabled={saving}
          >
            <Ionicons name="close" size={20} color={colors.danger} />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.saveButton]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editedProfile?.nombre || editedProfile?.nombre_usuario || ''}
              onChangeText={(text) => handleInputChange('nombre', text)}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editedProfile?.email || ''}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Tu email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editedProfile?.telefono || ''}
              onChangeText={(text) => handleInputChange('telefono', text)}
              placeholder="Tu teléfono"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dirección</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editedProfile?.direccion || ''}
              onChangeText={(text) => handleInputChange('direccion', text)}
              placeholder="Tu dirección"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    color: colors.danger,
    marginLeft: 4,
    fontWeight: '500',
  },
  saveText: {
    color: colors.white,
    marginLeft: 4,
    fontWeight: '500',
  },
  formContainer: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    color: colors.text,
    fontSize: 16,
  },
});

export default AdminProfileEditMode;
