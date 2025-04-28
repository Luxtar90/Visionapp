// src/components/Tiendas/TiendaForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Tienda } from '../../interfaces/Tienda';
import { FormField } from '../common/FormField';
import { ActionButton } from '../common/ActionButton';
import { StatusMessage } from '../common/StatusMessage';
import { colors } from '../../theme/colors';

interface TiendaFormProps {
  tienda?: Tienda;
  onSubmit: (data: Partial<Tienda>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TiendaForm: React.FC<TiendaFormProps> = ({
  tienda,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Tienda>>(
    tienda || {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      horario: '',
      descripcion: '',
      activa: true,
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (name: keyof Tienda, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.direccion?.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }
    
    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, corrige los errores en el formulario'
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
      
      <View style={styles.formGroup}>
        <FormField
          label="Nombre"
          value={formData.nombre || ''}
          onChangeText={(value) => handleChange('nombre', value)}
          placeholder="Ingrese el nombre de la tienda"
          error={errors.nombre}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Dirección"
          value={formData.direccion || ''}
          onChangeText={(value) => handleChange('direccion', value)}
          placeholder="Ingrese la dirección"
          error={errors.direccion}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Teléfono"
          value={formData.telefono || ''}
          onChangeText={(value) => handleChange('telefono', value)}
          placeholder="Ingrese el teléfono"
          keyboardType="phone-pad"
          error={errors.telefono}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Email"
          value={formData.email || ''}
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Ingrese el email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Horario"
          value={formData.horario || ''}
          onChangeText={(value) => handleChange('horario', value)}
          placeholder="Ej: Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00"
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Descripción"
          value={formData.descripcion || ''}
          onChangeText={(value) => handleChange('descripcion', value)}
          placeholder="Ingrese una descripción"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="URL del Logo"
          value={formData.logo_url || ''}
          onChangeText={(value) => handleChange('logo_url', value)}
          placeholder="Ingrese la URL del logo"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <ActionButton
          label="Cancelar"
          onPress={onCancel}
          type="secondary"
          style={styles.button}
        />
        <ActionButton
          label={tienda ? "Actualizar" : "Crear"}
          onPress={handleSubmit}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  formGroup: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 0.48,
  },
});
