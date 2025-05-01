// src/components/Cliente/ProfileViewMode.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import ProfileSection from './ProfileSection';
import ProfileInfo from './ProfileInfo';
import { UserProfile, Store } from '../../types';

interface ProfileViewModeProps {
  profile: UserProfile | null;
  tiendasUsuario: number[];
  tiendas: Store[];
}

/**
 * Componente que renderiza la información del perfil en modo visualización
 */
const ProfileViewMode: React.FC<ProfileViewModeProps> = ({ 
  profile, 
  tiendasUsuario, 
  tiendas 
}) => {
  const getTiendaNombre = (tiendaId: number): string => {
    const tienda = tiendas.find(t => t.id === tiendaId);
    return tienda ? tienda.nombre : 'Tienda no especificada';
  };

  return (
    <ProfileSection title="Información Personal">
      <ProfileInfo key="nombre" label="Nombre" value={profile?.nombre || 'No especificado'} />
      <ProfileInfo key="apellido" label="Apellido" value={profile?.apellido || 'No especificado'} />
      <ProfileInfo key="identificacion" label="Identificación" value={profile?.identificacion || 'No especificado'} />
      <ProfileInfo key="email" label="Email" value={profile?.email || 'No especificado'} />
      <ProfileInfo key="telefono" label="Teléfono" value={profile?.telefono || 'No especificado'} />
      <ProfileInfo key="direccion" label="Dirección" value={profile?.direccion || 'No especificado'} />
      <ProfileInfo key="fecha_nacimiento" label="Fecha de Nacimiento" value={profile?.fecha_nacimiento || 'No especificado'} />
      <ProfileInfo key="genero" label="Género" value={profile?.genero || 'No especificado'} />
      <ProfileInfo key="origen_cita" label="¿Cómo nos conociste?" value={profile?.origen_cita || 'No especificado'} />
      
      <ProfileInfo 
        key="tiendas"
        label="Tiendas" 
        value={
          tiendasUsuario && tiendasUsuario.length > 0 ? (
            <View>
              {[...new Set(tiendasUsuario.filter(id => id !== undefined && id !== null))]
                .map((tiendaId) => (
                  <Text key={`tienda-${tiendaId}`} style={styles.tiendaItem}>
                    • {getTiendaNombre(tiendaId)}
                  </Text>
                ))}
            </View>
          ) : 'No hay tiendas seleccionadas'
        } 
      />
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  tiendaItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
});

export default ProfileViewMode;
