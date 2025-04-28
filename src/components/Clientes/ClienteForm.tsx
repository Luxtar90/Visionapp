// src/components/Clientes/ClienteForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Cliente } from '../../interfaces/Cliente';
import { FormField } from '../common/FormField';
import { SelectField, SelectOption } from '../common/SelectField';
import { DatePickerField } from '../common/DatePickerField';
import { ActionButton } from '../common/ActionButton';
import { StatusMessage } from '../common/StatusMessage';
import { colors } from '../../theme/colors';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: Partial<Cliente>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  cliente,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Cliente>>(
    cliente || {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      genero: undefined,
      activo: true,
      notas: '',
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (name: keyof Cliente, value: any) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones básicas
    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      try {
        onSubmit(formData);
        setStatusMessage({ type: 'success', message: 'Cliente guardado correctamente' });
      } catch (error) {
        setStatusMessage({ type: 'error', message: 'Error al guardar el cliente' });
      }
    }
  };

  const generoOptions: SelectOption[] = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Femenino', value: 'femenino' },
    { label: 'Otro', value: 'otro' },
  ];

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
          placeholder="Ingrese el nombre"
          error={errors.nombre}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Apellido"
          value={formData.apellido || ''}
          onChangeText={(value) => handleChange('apellido', value)}
          placeholder="Ingrese el apellido"
          error={errors.apellido}
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
          label="Dirección"
          value={formData.direccion || ''}
          onChangeText={(value) => handleChange('direccion', value)}
          placeholder="Ingrese la dirección"
          multiline
        />
      </View>
      
      <View style={styles.formGroup}>
        <DatePickerField
          label="Fecha de nacimiento"
          value={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : null}
          onChange={(date) => handleChange('fecha_nacimiento', date?.toISOString())}
          placeholder="Seleccione la fecha de nacimiento"
          mode="date"
        />
      </View>
      
      <View style={styles.formGroup}>
        <SelectField
          label="Género"
          value={formData.genero || ''}
          options={generoOptions}
          onValueChange={(value) => handleChange('genero', value)}
          placeholder="Seleccione el género"
          icon="person-outline"
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Notas"
          value={formData.notas || ''}
          onChangeText={(value) => handleChange('notas', value)}
          placeholder="Ingrese notas adicionales"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Cancelar"
          onPress={onCancel}
          type="secondary"
          style={styles.button}
        />
        <ActionButton
          title={cliente ? "Actualizar" : "Crear"}
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
