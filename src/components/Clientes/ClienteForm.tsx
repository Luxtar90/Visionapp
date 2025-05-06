// src/components/Clientes/ClienteForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Cliente } from '../../interfaces/Cliente';
import { FormField } from '../common/FormField';
import { SelectField, SelectOption } from '../common/SelectField';
import { DatePickerField } from '../common/DatePickerField';
import { ActionButton } from '../common/ActionButton';
import { StatusMessage } from '../common/StatusMessage';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

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
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion_detalle: '',
      direccion_ciudad: '',
      direccion_pais: '',
      fecha_nacimiento: '',
      origen_cita: '',
      puntos_acumulados: 0,
      identificacion: '',
      tiendaId: null
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
    if (!formData.nombres) {
      newErrors.nombres = 'El nombre es requerido';
    }
    
    if (!formData.apellidos) {
      newErrors.apellidos = 'El apellido es requerido';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
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

  const origenOptions: SelectOption[] = [
    { label: 'Referido por un amigo', value: 'Referido por un amigo' },
    { label: 'Publicidad', value: 'Publicidad' },
    { label: 'Redes sociales', value: 'Redes sociales' },
    { label: 'Sitio web', value: 'Sitio web' },
    { label: 'Otro', value: 'Otro' },
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
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <FormField
              label="Nombres"
              value={formData.nombres || ''}
              onChangeText={(value) => handleChange('nombres', value)}
              placeholder="Ingrese los nombres"
              error={errors.nombres}
              required
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Apellidos"
              value={formData.apellidos || ''}
              onChangeText={(value) => handleChange('apellidos', value)}
              placeholder="Ingrese los apellidos"
              error={errors.apellidos}
              required
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Identificación"
              value={formData.identificacion || ''}
              onChangeText={(value) => handleChange('identificacion', value)}
              placeholder="Ingrese la identificación"
              error={errors.identificacion}
            />
          </View>
          
          <View style={styles.formGroup}>
            <DatePickerField
              label="Fecha de nacimiento"
              value={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : null}
              onChange={(date) => handleChange('fecha_nacimiento', date?.toISOString().split('T')[0])}
              placeholder="Seleccione la fecha de nacimiento"
            />
          </View>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Contacto</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardContent}>
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
              label="Teléfono"
              value={formData.telefono || ''}
              onChangeText={(value) => handleChange('telefono', value)}
              placeholder="Ingrese el teléfono"
              keyboardType="phone-pad"
              error={errors.telefono}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Dirección</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <FormField
              label="Dirección detallada"
              value={formData.direccion_detalle || ''}
              onChangeText={(value) => handleChange('direccion_detalle', value)}
              placeholder="Calle, número, etc."
              error={errors.direccion_detalle}
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Ciudad"
              value={formData.direccion_ciudad || ''}
              onChangeText={(value) => handleChange('direccion_ciudad', value)}
              placeholder="Ingrese la ciudad"
              error={errors.direccion_ciudad}
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="País"
              value={formData.direccion_pais || ''}
              onChangeText={(value) => handleChange('direccion_pais', value)}
              placeholder="Ingrese el país"
              error={errors.direccion_pais}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="information" size={20} color={colors.primary} />
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Información Adicional</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <SelectField
              label="Origen de la cita"
              value={formData.origen_cita || ''}
              onValueChange={(value) => handleChange('origen_cita', value)}
              options={origenOptions}
              placeholder="Seleccione el origen"
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Puntos acumulados"
              value={formData.puntos_acumulados?.toString() || '0'}
              onChangeText={(value) => handleChange('puntos_acumulados', parseInt(value) || 0)}
              placeholder="Ingrese los puntos"
              keyboardType="numeric"
              error={errors.puntos_acumulados}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <ActionButton
          label="Cancelar"
          onPress={onCancel}
          variant="secondary"
          style={styles.button}
        />
        <ActionButton
          label="Guardar"
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
