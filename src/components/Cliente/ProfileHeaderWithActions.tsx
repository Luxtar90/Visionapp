// src/components/Cliente/ProfileHeaderWithActions.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ProfileHeader from './ProfileHeader';
import { UserProfile } from '../../types';

interface ProfileHeaderWithActionsProps {
  profile: UserProfile | null;
  editing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editedProfile: UserProfile | null;
  setEditedProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  handleSaveProfile: () => void;
  saving: boolean;
}

/**
 * Componente que renderiza el encabezado del perfil con botones de acción para editar/guardar
 */
const ProfileHeaderWithActions: React.FC<ProfileHeaderWithActionsProps> = ({
  profile,
  editing,
  setEditing,
  editedProfile,
  setEditedProfile,
  handleSaveProfile,
  saving
}) => {
  const fullName = profile?.nombre 
    ? (profile.apellido ? `${profile.nombre} ${profile.apellido}` : profile.nombre)
    : 'Usuario';
    
  return (
    <View>
      <ProfileHeader 
        name={fullName} 
        email={profile?.email || 'Sin correo electrónico'} 
        avatar={profile?.avatar}
      />
      
      <View style={styles.actionsContainer}>
        {!editing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditedProfile(profile);
                setEditing(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  editButtonText: {
    marginLeft: 5,
    color: colors.primary,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  cancelButtonText: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
});

export default ProfileHeaderWithActions;
