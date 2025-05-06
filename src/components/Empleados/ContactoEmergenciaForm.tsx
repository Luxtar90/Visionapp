// src/components/Empleados/ContactoEmergenciaForm.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardTypeOptions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ContactoEmergencia } from '../../api/contactosEmergencia.api';

interface ContactoEmergenciaFormProps {
  visible: boolean;
  empleadoId: string;
  contacto?: ContactoEmergencia | null;
  onClose: () => void;
  onSave: (contacto: ContactoEmergencia) => void;
}

// Interfaces para los componentes de formulario
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
}

interface FormSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const ContactoEmergenciaForm = ({ 
  visible,
  empleadoId,
  contacto,
  onClose,
  onSave
}: ContactoEmergenciaFormProps) => {
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [nombre, setNombre] = useState(contacto?.nombre || '');
  const [relacion, setRelacion] = useState(contacto?.relacion || '');
  const [telefono, setTelefono] = useState(contacto?.telefono || '');
  const [email, setEmail] = useState(contacto?.email || '');
  const [esPrincipal, setEsPrincipal] = useState(contacto?.es_principal ?? false);

  const handleSubmit = async () => {
    try {
      // Validaciones
      if (!nombre.trim()) {
        Alert.alert('Error', 'El nombre es obligatorio');
        return;
      }
      
      if (!relacion.trim()) {
        Alert.alert('Error', 'La relación es obligatoria');
        return;
      }
      
      if (!telefono.trim()) {
        Alert.alert('Error', 'El teléfono es obligatorio');
        return;
      }
      
      setLoading(true);
      
      // Preparar datos
      const contactoData: ContactoEmergencia = {
        id: contacto?.id || '',
        empleadoId,
        nombre: nombre.trim(),
        relacion: relacion.trim(),
        telefono: telefono.trim(),
        email: email.trim() || undefined,
        es_principal: esPrincipal
      };
      
      // En una implementación real, aquí iría la llamada a la API
      // Simulamos un retardo para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Llamar a la función onSave con los datos del contacto
      onSave(contactoData);
      
      // Limpiar el formulario
      resetForm();
    } catch (error) {
      console.error('Error al guardar contacto:', error);
      Alert.alert('Error', 'No se pudo guardar el contacto de emergencia');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setNombre('');
    setRelacion('');
    setTelefono('');
    setEmail('');
    setEsPrincipal(false);
  };

  // Componente de entrada de formulario personalizado
  const FormInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    required = false
  }: FormInputProps) => (
    <View style={formStyles.inputContainer}>
      <Text style={formStyles.label}>
        {label} {required && <Text style={formStyles.required}>*</Text>}
      </Text>
      <View style={formStyles.inputWrapper}>
        <TextInput
          style={formStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  // Componente de switch personalizado
  const FormSwitch = ({ 
    label, 
    value, 
    onValueChange 
  }: FormSwitchProps) => (
    <View style={formStyles.switchContainer}>
      <TouchableOpacity 
        style={[
          formStyles.switchButton,
          value ? formStyles.switchActive : formStyles.switchInactive
        ]}
        onPress={() => onValueChange(!value)}
      >
        <View style={[
          formStyles.switchThumb,
          value ? formStyles.switchThumbActive : formStyles.switchThumbInactive
        ]} />
      </TouchableOpacity>
      <Text style={formStyles.switchLabel}>{label}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {contacto ? 'Editar Contacto' : 'Nuevo Contacto'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <FormInput
              label="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingrese el nombre completo"
              required
            />
            
            <FormInput
              label="Relación"
              value={relacion}
              onChangeText={setRelacion}
              placeholder="Ej. Padre, Madre, Hermano/a"
              required
            />
            
            <FormInput
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Ingrese el número de teléfono"
              keyboardType="phone-pad"
              required
            />
            
            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Ingrese el email (opcional)"
              keyboardType="email-address"
            />
            
            <FormSwitch
              label="Contacto principal"
              value={esPrincipal}
              onValueChange={setEsPrincipal}
            />
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Estilos para los componentes de formulario
const formStyles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  switchButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  switchActive: {
    backgroundColor: colors.primary + '30',
  },
  switchInactive: {
    backgroundColor: colors.border + '50',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  switchThumbActive: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    backgroundColor: colors.text + '80',
    alignSelf: 'flex-start',
  },
  switchLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  }
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    maxHeight: 500,
  },
  formContent: {
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border + '50',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
