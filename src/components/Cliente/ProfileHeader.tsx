// src/components/Cliente/ProfileHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Componente que renderiza el encabezado del perfil con avatar y datos básicos
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email, avatar }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.profileHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{firstLetter}</Text>
        )}
      </View>
      
      <Text style={styles.userName}>{name || 'Usuario'}</Text>
      <Text style={styles.userEmail}>{email || 'Sin correo electrónico'}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    padding: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.background,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userEmail: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
  },
});

export default ProfileHeader;
