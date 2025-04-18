// src/components/Servicios/ServicioForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Servicio } from '../../interfaces/Servicio';
import { FormField } from '../common/FormField';
import { ActionButton } from '../common/ActionButton';
import { SelectField, SelectOption } from '../common/SelectField';
import { StatusMessage } from '../common/StatusMessage';

interface ServicioFormProps {
  servicio?: Servicio;
  onSubmit: (servicio: Partial<Servicio>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

export const ServicioForm = ({ 
  servicio, 
  onSubmit, 
  isLoading, 
  onCancel 
}: ServicioFormProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [activo, setActivo] = useState('true');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const categoriaOptions: SelectOption[] = [
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
    if (servicio) {
      setNombre(servicio.nombre || '');
      setDescripcion(servicio.descripcion || '');
      setPrecio(servicio.precio ? servicio.precio.toString() : '');
      setDuracion(servicio.duracion ? servicio.duracion.toString() : '');
      setCategoria(servicio.categoria || '');
      setActivo(servicio.activo ? 'true' : 'false');
    }
  }, [servicio]);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!precio.trim()) {
      newErrors.precio = 'El precio es requerido';
    } else if (isNaN(Number(precio)) || Number(precio) <= 0) {
      newErrors.precio = 'El precio debe ser un número mayor a 0';
    }
    
    if (!duracion.trim()) {
      newErrors.duracion = 'La duración es requerida';
    } else if (isNaN(Number(duracion)) || Number(duracion) <= 0) {
      newErrors.duracion = 'La duración debe ser un número mayor a 0';
    }
    
    if (!categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({
          id: servicio?.id,
          nombre,
          descripcion,
          precio: Number(precio),
          duracion: Number(duracion),
          categoria,
          activo: activo === 'true',
        });
        
        setStatusMessage({
          type: 'success',
          message: servicio 
            ? 'Servicio actualizado correctamente' 
            : 'Servicio creado correctamente'
        });
        
        if (!servicio) {
          // Limpiar el formulario si es una creación
          setNombre('');
          setDescripcion('');
          setPrecio('');
          setDuracion('');
          setCategoria('');
          setActivo('true');
        }
      } catch (error) {
        setStatusMessage({
          type: 'error',
          message: 'Error al guardar el servicio. Inténtalo de nuevo.'
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
        placeholder="Ingresa el nombre del servicio"
        error={errors.nombre}
        icon="cut-outline"
        autoCapitalize="words"
      />
      
      <FormField
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Ingresa la descripción del servicio"
        error={errors.descripcion}
        icon="document-text-outline"
        multiline
        numberOfLines={4}
      />
      
      <FormField
        label="Precio"
        value={precio}
        onChangeText={setPrecio}
        placeholder="Ingresa el precio"
        error={errors.precio}
        icon="cash-outline"
        keyboardType="numeric"
      />
      
      <FormField
        label="Duración (minutos)"
        value={duracion}
        onChangeText={setDuracion}
        placeholder="Ingresa la duración en minutos"
        error={errors.duracion}
        icon="time-outline"
        keyboardType="numeric"
      />
      
      <SelectField
        label="Categoría"
        value={categoria}
        options={categoriaOptions}
        onValueChange={setCategoria}
        placeholder="Selecciona la categoría"
        error={errors.categoria}
        icon="list-outline"
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
          label={servicio ? "Actualizar" : "Crear"}
          onPress={handleSubmit}
          variant="primary"
          icon={servicio ? "save-outline" : "add-outline"}
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
