// src/components/Notificaciones/NotificacionForm.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  Switch, 
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormField } from '../common/FormField';
import { SelectField, SelectOption } from '../common/SelectField';
import { DatePickerField } from '../common/DatePickerField';
import { ActionButton } from '../common/ActionButton';
import { StatusMessage } from '../common/StatusMessage';
import { 
  Notificacion, 
  TipoNotificacion, 
  TipoDestinatario 
} from '../../interfaces/Notificacion';
import { colors } from '../../theme/colors';

interface NotificacionFormProps {
  notificacion?: Notificacion;
  onSubmit: (data: Partial<Notificacion>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  clientes?: { id: string; nombre: string; apellido: string }[];
  empleados?: { id: string; nombre: string; apellido: string }[];
}

export const NotificacionForm: React.FC<NotificacionFormProps> = ({
  notificacion,
  onSubmit,
  onCancel,
  isLoading = false,
  clientes = [],
  empleados = [],
}) => {
  const [formData, setFormData] = useState<Partial<Notificacion>>(
    notificacion || {
      titulo: '',
      mensaje: '',
      tipo: 'informativa',
      estado: 'pendiente',
      destinatario: 'todos',
      programada: false,
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [mostrarSeleccionDestinatarios, setMostrarSeleccionDestinatarios] = useState(false);
  const [destinatariosSeleccionados, setDestinatariosSeleccionados] = useState<string[]>(
    notificacion?.destinatarios_ids || []
  );

  const handleChange = (name: keyof Notificacion, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Lógica adicional para algunos campos
    if (name === 'destinatario' && value !== 'todos') {
      setMostrarSeleccionDestinatarios(true);
    } else if (name === 'destinatario' && value === 'todos') {
      setMostrarSeleccionDestinatarios(false);
      setDestinatariosSeleccionados([]);
    }
  };

  const toggleDestinatario = (id: string) => {
    if (destinatariosSeleccionados.includes(id)) {
      setDestinatariosSeleccionados(prev => prev.filter(item => item !== id));
    } else {
      setDestinatariosSeleccionados(prev => [...prev, id]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones
    if (!formData.titulo?.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }
    
    if (!formData.mensaje?.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es obligatorio';
    }
    
    if (!formData.destinatario) {
      newErrors.destinatario = 'El destinatario es obligatorio';
    }
    
    if (mostrarSeleccionDestinatarios && destinatariosSeleccionados.length === 0) {
      newErrors.destinatarios = 'Debes seleccionar al menos un destinatario';
    }
    
    if (formData.programada && !formData.fecha_programada) {
      newErrors.fecha_programada = 'La fecha de programación es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Incluir destinatarios seleccionados si corresponde
      const dataToSubmit = {
        ...formData,
        destinatarios_ids: mostrarSeleccionDestinatarios ? destinatariosSeleccionados : undefined,
      };
      
      onSubmit(dataToSubmit);
    } else {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, corrige los errores en el formulario'
      });
    }
  };

  const getTipoOptions = (): SelectOption[] => {
    return [
      { label: 'Informativa', value: 'informativa' },
      { label: 'Promoción', value: 'promocion' },
      { label: 'Recordatorio', value: 'recordatorio' },
      { label: 'Alerta', value: 'alerta' },
    ];
  };

  const getDestinatarioOptions = (): SelectOption[] => {
    return [
      { label: 'Todos los usuarios', value: 'todos' },
      { label: 'Clientes', value: 'cliente' },
      { label: 'Empleados', value: 'empleado' },
    ];
  };

  const getAccionTipoOptions = (): SelectOption[] => {
    return [
      { label: 'Ninguna', value: 'ninguna' },
      { label: 'Abrir URL', value: 'url' },
      { label: 'Navegar a pantalla', value: 'pantalla' },
      { label: 'Llamar por teléfono', value: 'telefono' },
    ];
  };

  const renderDestinatariosSeleccion = () => {
    if (!mostrarSeleccionDestinatarios) return null;
    
    const listaDestinatarios = formData.destinatario === 'cliente' 
      ? clientes 
      : formData.destinatario === 'empleado' 
        ? empleados 
        : [];
    
    if (listaDestinatarios.length === 0) {
      return (
        <View style={styles.emptyDestinatarios}>
          <Text style={styles.emptyText}>
            No hay {formData.destinatario === 'cliente' ? 'clientes' : 'empleados'} disponibles
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.destinatariosContainer}>
        <Text style={styles.destinatariosTitle}>
          Seleccionar {formData.destinatario === 'cliente' ? 'clientes' : 'empleados'}:
        </Text>
        
        {errors.destinatarios && (
          <Text style={styles.errorText}>{errors.destinatarios}</Text>
        )}
        
        <View style={styles.destinatariosList}>
          {listaDestinatarios.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.destinatarioItem,
                destinatariosSeleccionados.includes(item.id) && styles.destinatarioSelected
              ]}
              onPress={() => toggleDestinatario(item.id)}
            >
              <Text 
                style={[
                  styles.destinatarioText,
                  destinatariosSeleccionados.includes(item.id) && styles.destinatarioTextSelected
                ]}
              >
                {item.nombre} {item.apellido}
              </Text>
              
              {destinatariosSeleccionados.includes(item.id) && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.seleccionActions}>
          <TouchableOpacity 
            style={styles.seleccionButton}
            onPress={() => setDestinatariosSeleccionados(listaDestinatarios.map(item => item.id))}
          >
            <Text style={styles.seleccionButtonText}>Seleccionar todos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.seleccionButton}
            onPress={() => setDestinatariosSeleccionados([])}
          >
            <Text style={styles.seleccionButtonText}>Deseleccionar todos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAccionConfig = () => {
    const accionTipo = formData.accion?.tipo || 'ninguna';
    
    if (accionTipo === 'ninguna') return null;
    
    let placeholder = '';
    let keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default';
    
    switch (accionTipo) {
      case 'url':
        placeholder = 'https://ejemplo.com';
        // Changed from 'url' to 'default' as 'url' is not a valid keyboardType
        keyboardType = 'default';
        break;
      case 'pantalla':
        placeholder = 'NombrePantalla';
        break;
      case 'telefono':
        placeholder = '+1234567890';
        keyboardType = 'phone-pad';
        break;
    }
    
    return (
      <FormField
        label={`Valor para ${accionTipo === 'url' ? 'URL' : accionTipo === 'pantalla' ? 'Pantalla' : 'Teléfono'}`}
        value={formData.accion?.valor || ''}
        onChangeText={(value) => handleChange('accion', { ...formData.accion, valor: value })}
        placeholder={placeholder}
        keyboardType={keyboardType}
        error={errors.accionValor}
      />
    );
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
          label="Título"
          value={formData.titulo || ''}
          onChangeText={(value) => handleChange('titulo', value)}
          placeholder="Ingrese el título de la notificación"
          error={errors.titulo}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Mensaje"
          value={formData.mensaje || ''}
          onChangeText={(value) => handleChange('mensaje', value)}
          placeholder="Ingrese el mensaje de la notificación"
          multiline
          numberOfLines={4}
          error={errors.mensaje}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <SelectField
          label="Tipo"
          value={formData.tipo as string}
          options={getTipoOptions()}
          onValueChange={(value) => handleChange('tipo', value as TipoNotificacion)}
          placeholder="Seleccionar tipo"
          icon="information-circle-outline"
          error={errors.tipo}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <SelectField
          label="Destinatario"
          value={formData.destinatario as string}
          options={getDestinatarioOptions()}
          onValueChange={(value) => handleChange('destinatario', value as TipoDestinatario)}
          placeholder="Seleccionar destinatario"
          icon="people-outline"
          error={errors.destinatario}
          required
        />
      </View>
      
      {renderDestinatariosSeleccion()}
      
      <View style={styles.formGroup}>
        <SelectField
          label="Acción al pulsar"
          value={formData.accion?.tipo || 'ninguna'}
          options={getAccionTipoOptions()}
          onValueChange={(value) => {
            if (value === 'ninguna') {
              const newFormData = { ...formData };
              delete newFormData.accion;
              setFormData(newFormData);
            } else {
              handleChange('accion', { tipo: value, valor: '' });
            }
          }}
          placeholder="Seleccionar acción"
          icon="link-outline"
        />
      </View>
      
      {renderAccionConfig()}
      
      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Programar envío</Text>
          <Switch
            value={formData.programada}
            onValueChange={(value) => handleChange('programada', value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={formData.programada ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        {formData.programada && (
          <View style={styles.datePickerContainer}>
            <DatePickerField
              label="Fecha y hora de envío"
              value={formData.fecha_programada ? new Date(formData.fecha_programada) : null}
              onChange={(date) => handleChange('fecha_programada', date?.toISOString())}
              placeholder="Seleccionar fecha y hora"
              mode="datetime"
              error={errors.fecha_programada}
              required
            />
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.imageLabel}>Imagen (opcional)</Text>
        
        {formData.imagen_url ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: formData.imagen_url }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => {
                const newFormData = { ...formData };
                delete newFormData.imagen_url;
                setFormData(newFormData);
              }}
            >
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.imageUploadButton}
            onPress={() => {
              // Aquí iría la lógica para seleccionar una imagen
              // Por ahora, simplemente establecemos una URL de ejemplo
              handleChange('imagen_url', 'https://via.placeholder.com/300x200');
            }}
          >
            <Ionicons name="image-outline" size={24} color={colors.primary} />
            <Text style={styles.imageUploadText}>Seleccionar imagen</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <ActionButton
          label="Cancelar"
          onPress={onCancel}
          type="secondary"
          style={styles.button}
        />
        <ActionButton
          label={notificacion ? "Actualizar" : "Crear"}
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
  },
  datePickerContainer: {
    marginTop: 8,
  },
  imageLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  imageUploadText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  destinatariosContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  destinatariosTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  destinatariosList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  destinatarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  destinatarioSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  destinatarioText: {
    color: colors.text,
    marginRight: 4,
  },
  destinatarioTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  seleccionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  seleccionButton: {
    padding: 8,
  },
  seleccionButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  emptyDestinatarios: {
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: colors.text + '99',
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 8,
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
