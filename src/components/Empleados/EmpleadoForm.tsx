// src/components/Empleados/EmpleadoForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Empleado } from './EmpleadoCard';
import { FormField } from '../common/FormField';
import { ActionButton } from '../common/ActionButton';
import { SelectField, SelectOption } from '../common/SelectField';
import { StatusMessage } from '../common/StatusMessage';

interface EmpleadoFormProps {
  empleado?: Empleado;
  onSubmit: (empleado: Partial<Empleado>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

export const EmpleadoForm = ({ 
  empleado, 
  onSubmit, 
  isLoading, 
  onCancel 
}: EmpleadoFormProps) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [activo, setActivo] = useState('true');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const especialidadOptions: SelectOption[] = [
    { label: 'Corte de cabello', value: 'Corte de cabello' },
    { label: 'Coloración', value: 'Coloración' },
    { label: 'Manicure', value: 'Manicure' },
    { label: 'Pedicure', value: 'Pedicure' },
    { label: 'Tratamientos faciales', value: 'Tratamientos faciales' },
    { label: 'Maquillaje', value: 'Maquillaje' },
    { label: 'Masajes', value: 'Masajes' },
    { label: 'Depilación', value: 'Depilación' },
  ];
  
  const activoOptions: SelectOption[] = [
    { label: 'Activo', value: 'true' },
    { label: 'Inactivo', value: 'false' },
  ];
  
  useEffect(() => {
    if (empleado) {
      setNombre(empleado.nombre || '');
      setApellido(empleado.apellido || '');
      setEmail(empleado.email || '');
      setTelefono(empleado.telefono || '');
      setEspecialidad(empleado.especialidad || '');
      setActivo(empleado.activo ? 'true' : 'false');
    }
  }, [empleado]);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    
    if (!especialidad) {
      newErrors.especialidad = 'La especialidad es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({
          id: empleado?.id,
          nombre,
          apellido,
          email,
          telefono,
          especialidad,
          activo: activo === 'true',
        });
        
        setStatusMessage({
          type: 'success',
          message: empleado 
            ? 'Empleado actualizado correctamente' 
            : 'Empleado creado correctamente'
        });
        
        if (!empleado) {
          // Limpiar el formulario si es una creación
          setNombre('');
          setApellido('');
          setEmail('');
          setTelefono('');
          setEspecialidad('');
          setActivo('true');
        }
      } catch (error) {
        setStatusMessage({
          type: 'error',
          message: 'Error al guardar el empleado. Inténtalo de nuevo.'
        });
      }
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
      
      <FormField
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ingresa el nombre"
        error={errors.nombre}
        icon="person-outline"
        autoCapitalize="words"
      />
      
      <FormField
        label="Apellido"
        value={apellido}
        onChangeText={setApellido}
        placeholder="Ingresa el apellido"
        error={errors.apellido}
        icon="person-outline"
        autoCapitalize="words"
      />
      
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Ingresa el email"
        error={errors.email}
        icon="mail-outline"
        keyboardType="email-address"
      />
      
      <FormField
        label="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Ingresa el teléfono"
        error={errors.telefono}
        icon="call-outline"
        keyboardType="phone-pad"
      />
      
      <SelectField
        label="Especialidad"
        value={especialidad}
        options={especialidadOptions}
        onValueChange={setEspecialidad}
        placeholder="Selecciona la especialidad"
        error={errors.especialidad}
        icon="briefcase-outline"
      />
      
      <SelectField
        label="Estado"
        value={activo}
        options={activoOptions}
        onValueChange={setActivo}
        icon="checkmark-circle-outline"
      />
      
      <View style={styles.buttonsContainer}>
        <ActionButton
          label="Cancelar"
          onPress={onCancel}
          variant="secondary"
          icon="close-outline"
          disabled={isLoading}
        />
        
        <ActionButton
          label={empleado ? "Actualizar" : "Crear"}
          onPress={handleSubmit}
          variant="primary"
          icon={empleado ? "save-outline" : "add-outline"}
          loading={isLoading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
});
