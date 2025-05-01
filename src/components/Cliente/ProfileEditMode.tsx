// src/components/Cliente/ProfileEditMode.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../../theme/colors';
import ProfileSection from './ProfileSection';
import ProfileField from './ProfileField';
import { UserProfile, Store } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface ProfileEditModeProps {
  editedProfile: UserProfile | null;
  handleInputChange: (field: keyof UserProfile, value: string) => void;
  setShowDatePicker: (show: boolean) => void;
  tiendasUsuario: number[];
  tiendas: Store[];
  setShowStoreSelector: (show: boolean) => void;
}

/**
 * Componente que renderiza los campos de edición del perfil
 */
const ProfileEditMode: React.FC<ProfileEditModeProps> = ({
  editedProfile,
  handleInputChange,
  setShowDatePicker,
  tiendasUsuario,
  tiendas,
  setShowStoreSelector
}) => {
  return (
    <ProfileSection title="Información Personal">
      <ProfileField 
        label="Nombre" 
        value={editedProfile?.nombre || ''} 
        onChangeText={(text) => handleInputChange('nombre', text)} 
        placeholder="Tu nombre" 
        required={true}
      />
      
      <ProfileField 
        label="Apellido" 
        value={editedProfile?.apellido || ''} 
        onChangeText={(text) => handleInputChange('apellido', text)} 
        placeholder="Tu apellido nos ayuda a identificarte mejor" 
      />
      
      <ProfileField 
        label="Identificación" 
        value={editedProfile?.identificacion || ''} 
        onChangeText={(text) => handleInputChange('identificacion', text)} 
        placeholder="Tu número de identificación (para facturación)" 
        keyboardType="numeric" 
        hint="Necesario para facturación y garantías"
      />
      
      <ProfileField 
        label="Email" 
        value={editedProfile?.email || ''} 
        onChangeText={(text) => handleInputChange('email', text)} 
        placeholder="Tu correo electrónico" 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />
      
      <ProfileField 
        label="Teléfono" 
        value={editedProfile?.telefono || ''} 
        onChangeText={(text) => handleInputChange('telefono', text)} 
        placeholder="Tu número de contacto para notificaciones" 
        keyboardType="phone-pad" 
        hint="Te enviaremos recordatorios de citas"
      />
      
      <ProfileField 
        label="Dirección" 
        value={editedProfile?.direccion || ''} 
        onChangeText={(text) => handleInputChange('direccion', text)} 
        placeholder="Tu dirección para envíos" 
        hint="Formato: Calle/Avenida, Número, Ciudad"
      />
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha de Nacimiento</Text>
        <View style={styles.datePickerButton}>
          <Text 
            style={[
              styles.dateText,
              !editedProfile?.fecha_nacimiento && styles.placeholderText
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            {editedProfile?.fecha_nacimiento || "Selecciona tu fecha de nacimiento"}
          </Text>
        </View>
        <Text style={styles.inputHint}>Te enviaremos promociones en tu cumpleaños</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Género</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={editedProfile?.genero || ''}
            onValueChange={(value) => handleInputChange('genero', value.toString())}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona tu género" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="No binario" value="No binario" />
            <Picker.Item label="Prefiero no decir" value="No especificado" />
          </Picker>
        </View>
        <Text style={styles.inputHint}>Nos ayuda a personalizar tu experiencia</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>¿Cómo nos conociste?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={editedProfile?.origen_cita || ''}
            onValueChange={(value) => handleInputChange('origen_cita', value.toString())}
            style={styles.picker}
          >
            <Picker.Item label="Selecciona una opción" value="" />
            <Picker.Item label="Recomendación" value="Recomendación" />
            <Picker.Item label="Redes sociales" value="Redes sociales" />
            <Picker.Item label="Publicidad" value="Publicidad" />
            <Picker.Item label="Búsqueda en internet" value="Búsqueda en internet" />
            <Picker.Item label="Pasé por la tienda" value="Pasé por la tienda" />
            <Picker.Item label="Otro" value="Otro" />
          </Picker>
        </View>
        <Text style={styles.inputHint}>Tu respuesta nos ayuda a mejorar</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Tiendas que frecuentas <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity 
          style={styles.storeSelector}
          onPress={() => setShowStoreSelector(true)}
        >
          <Text style={tiendasUsuario.length > 0 ? styles.inputText : styles.placeholderText}>
            {tiendasUsuario.length > 0 
              ? `${tiendasUsuario.length} tienda(s) seleccionada(s)` 
              : "Selecciona las tiendas donde compras"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.inputHint}>Necesario para gestionar tus compras y garantías</Text>
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: colors.error,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.placeholder,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: 4,
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.card,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  storeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.card,
    marginBottom: 4,
  },
});

export default ProfileEditMode;
