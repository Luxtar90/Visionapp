import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Cliente } from '../../interfaces/Cliente';
import { convertirClienteAEmpleado, getUsuarioPorClienteId } from '../../api/usuarios.api';
import { getTiendas } from '../../api/tiendas.api';
import { Tienda } from '../../interfaces/Tienda';
import { Picker } from '@react-native-picker/picker';

interface ConvertirClienteModalProps {
  visible: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Adaptador para convertir Tienda a Sucursal con id como número
interface Sucursal {
  id: number;
  nombre: string;
  tiendaOriginal: Tienda;
}

export const ConvertirClienteModal: React.FC<ConvertirClienteModalProps> = ({
  visible,
  cliente,
  onClose,
  onSuccess
}) => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [cargo, setCargo] = useState<string>('');
  const [tipoContrato, setTipoContrato] = useState<string>('Tiempo completo');
  const [colorAsignado, setColorAsignado] = useState<string>('#3498db');
  const [activoParaReservas, setActivoParaReservas] = useState<boolean>(true);
  const [mantenerCliente, setMantenerCliente] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSucursales, setLoadingSucursales] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      cargarSucursales();
    }
  }, [visible]);

  const cargarSucursales = async () => {
    try {
      setLoadingSucursales(true);
      setError(null); // Limpiar cualquier error previo
      const response = await getTiendas();
      
      // Verificar si la respuesta es un array
      if (!response || !Array.isArray(response) || response.length === 0) {
        console.warn('La respuesta de getTiendas no es válida:', response);
        // Usar datos de ejemplo como fallback
        const tiendasEjemplo = [
          { id: '1', nombre: 'Óptica Visión Plus', direccion: '', telefono: '', activa: true, fecha_registro: '' }
        ];
        
        const sucursalesFormateadas: Sucursal[] = tiendasEjemplo.map(tienda => ({
          id: parseInt(tienda.id),
          nombre: tienda.nombre,
          tiendaOriginal: tienda
        }));
        
        setSucursales(sucursalesFormateadas);
        setSucursalId(1); // ID por defecto
        return;
      }
      
      // Convertir tiendas a formato de sucursal (adaptando el id a número)
      const sucursalesFormateadas: Sucursal[] = response.map(tienda => ({
        id: parseInt(tienda.id),
        nombre: tienda.nombre,
        tiendaOriginal: tienda
      }));
      
      setSucursales(sucursalesFormateadas);
      if (sucursalesFormateadas.length > 0) {
        setSucursalId(sucursalesFormateadas[0].id);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      // Usar datos de ejemplo como fallback en caso de error
      const tiendasEjemplo = [
        { id: '1', nombre: 'Óptica Visión Plus', direccion: '', telefono: '', activa: true, fecha_registro: '' }
      ];
      
      const sucursalesFormateadas: Sucursal[] = tiendasEjemplo.map(tienda => ({
        id: parseInt(tienda.id),
        nombre: tienda.nombre,
        tiendaOriginal: tienda
      }));
      
      setSucursales(sucursalesFormateadas);
      setSucursalId(1); // ID por defecto
      setError('No se pudieron cargar las sucursales. Se usará la tienda por defecto.');
    } finally {
      setLoadingSucursales(false);
    }
  };

  const handleSubmit = async () => {
    if (!cliente) return;
    if (!sucursalId) {
      setError('Debe seleccionar una sucursal');
      return;
    }

    // Verificar que el cliente tenga un ID válido
    if (!cliente.id || cliente.id <= 0) {
      setError('El cliente no tiene un ID válido. No se puede convertir a empleado.');
      return;
    }
    
    // Verificar que el cliente tenga un email (necesario para acceso como empleado)
    if (!cliente.email || !cliente.email.includes('@')) {
      setError('El cliente debe tener un email válido para poder convertirse en empleado.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Mostrar mensaje de carga
      console.log(`[Conversión] Buscando usuario asociado al cliente ID: ${cliente.id}`);
      
      // Obtener el usuario asociado al cliente usando el nuevo endpoint directo
      const usuarioAsociado = await getUsuarioPorClienteId(cliente.id);
      
      if (!usuarioAsociado || !usuarioAsociado.id) {
        setError('No se encontró un usuario asociado a este cliente. No se puede convertir a empleado.');
        setLoading(false);
        return;
      }
      
      console.log(`[Conversión] Usuario encontrado con ID: ${usuarioAsociado.id}`);
      
      // Usar el ID del usuario para la conversión
      console.log(`[Conversión] Iniciando conversión de cliente a empleado con usuario ID: ${usuarioAsociado.id}`);
      await convertirClienteAEmpleado(usuarioAsociado.id, {
        sucursal_id: sucursalId,
        cargo: cargo || undefined,
        tipo_contrato: tipoContrato || undefined,
        color_asignado: colorAsignado || undefined,
        activo_para_reservas: activoParaReservas,
        mantener_cliente: mantenerCliente
      });

      Alert.alert(
        'Éxito',
        `${cliente.nombres} ${cliente.apellidos} ha sido convertido a empleado exitosamente.`,
        [{ text: 'OK', onPress: () => {
          resetForm();
          onSuccess();
          onClose();
        }}]
      );
    } catch (error: any) {
      console.error('Error al convertir cliente a empleado:', error);
      
      // Manejar errores específicos
      if (error.response?.status === 404) {
        setError(
          error.response?.data?.message || 
          'No se encontró el usuario o cliente especificado.'
        );
      } else if (error.response?.status === 400) {
        setError(
          error.response?.data?.message || 
          'Datos inválidos para la conversión. Verifique la información.'
        );
      } else if (error.response?.status === 409) {
        setError(
          error.response?.data?.message || 
          'El usuario ya está asociado a un empleado. Use la opción de forzar actualización.'
        );
      } else {
        setError(
          error.response?.data?.message || 
          'No se pudo convertir el cliente a empleado. Intente nuevamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCargo('');
    setTipoContrato('Tiempo completo');
    setColorAsignado('#3498db');
    setActivoParaReservas(true);
    setMantenerCliente(true);
    setError(null);
  };

  const coloresDisponibles = [
    { color: '#3498db', nombre: 'Azul' },
    { color: '#e74c3c', nombre: 'Rojo' },
    { color: '#2ecc71', nombre: 'Verde' },
    { color: '#f39c12', nombre: 'Naranja' },
    { color: '#9b59b6', nombre: 'Morado' },
    { color: '#1abc9c', nombre: 'Turquesa' },
    { color: '#34495e', nombre: 'Azul oscuro' },
    { color: '#7f8c8d', nombre: 'Gris' }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Convertir a Empleado</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Información del cliente */}
          <View style={styles.clienteInfoCard}>
            <View style={styles.clienteAvatar}>
              <Text style={styles.clienteInitials}>
                {cliente?.nombres ? `${cliente.nombres.charAt(0)}${cliente.apellidos ? cliente.apellidos.charAt(0) : ''}` : 'JP'}
              </Text>
            </View>
            <View style={styles.clienteInfoText}>
              <Text style={styles.clienteNombre}>
                {cliente ? `${cliente.nombres} ${cliente.apellidos || ''}` : 'Juan Pérez'}
              </Text>
              <Text style={styles.clienteEmail}>{cliente?.email || 'jp@ejemplo.com'}</Text>
            </View>
          </View>

          {/* Mensajes de error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#c62828" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Formulario */}
          <ScrollView style={styles.formContainer}>
            {/* Sucursal */}
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="business-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.label}>Sucursal <Text style={styles.required}>*</Text></Text>
              </View>
              <View style={styles.pickerContainer}>
                {loadingSucursales ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando sucursales...</Text>
                  </View>
                ) : (
                  <Picker
                    selectedValue={sucursalId}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSucursalId(Number(itemValue))}
                    enabled={!loading}
                  >
                    {sucursales.map((sucursal) => (
                      <Picker.Item 
                        key={sucursal.id} 
                        label={sucursal.nombre} 
                        value={sucursal.id} 
                      />
                    ))}
                  </Picker>
                )}
              </View>
            </View>

            {/* Cargo */}
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.label}>Cargo</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Ej: Optometrista, Vendedor, etc."
                value={cargo}
                onChangeText={setCargo}
                editable={!loading}
              />
            </View>

            {/* Tipo de Contrato */}
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.label}>Tipo de Contrato</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipoContrato}
                  style={styles.picker}
                  onValueChange={(itemValue) => setTipoContrato(itemValue as string)}
                  enabled={!loading}
                >
                  <Picker.Item label="Tiempo completo" value="Tiempo completo" />
                  <Picker.Item label="Medio tiempo" value="Medio tiempo" />
                  <Picker.Item label="Por horas" value="Por horas" />
                  <Picker.Item label="Freelance" value="Freelance" />
                </Picker>
              </View>
            </View>

            {/* Color para Calendario */}
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.label}>Color para Calendario</Text>
              </View>
              <View style={styles.coloresContainer}>
                {coloresDisponibles.map((item) => (
                  <TouchableOpacity
                    key={item.color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: item.color },
                      colorAsignado === item.color && styles.colorSelected
                    ]}
                    onPress={() => setColorAsignado(item.color)}
                    disabled={loading}
                  >
                    {colorAsignado === item.color && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Opciones adicionales */}
            <View style={styles.optionsContainer}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.switchLabel}>Activo para Reservas</Text>
                </View>
                <Switch
                  value={activoParaReservas}
                  onValueChange={setActivoParaReservas}
                  trackColor={{ false: '#d1d1d1', true: colors.primary + '80' }}
                  thumbColor={activoParaReservas ? colors.primary : '#f4f3f4'}
                  disabled={loading}
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="people-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.switchLabel}>Mantener como Cliente</Text>
                </View>
                <Switch
                  value={mantenerCliente}
                  onValueChange={setMantenerCliente}
                  trackColor={{ false: '#d1d1d1', true: colors.primary + '80' }}
                  thumbColor={mantenerCliente ? colors.primary : '#f4f3f4'}
                  disabled={loading}
                />
              </View>
            </View>

            {/* Información adicional */}
            <View style={styles.infoContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="information-circle-outline" size={20} color={colors.text + '80'} />
              </View>
              <Text style={styles.infoText}>
                Al convertir un cliente a empleado, se creará un nuevo perfil de empleado
                con los datos básicos del cliente. El usuario podrá acceder con las mismas
                credenciales pero tendrá permisos de empleado.
              </Text>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="person-add-outline" size={18} color="white" style={styles.submitButtonIcon} />
                  <Text style={styles.submitButtonText}>Convertir</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary
  },
  closeButton: {
    padding: 4
  },
  scrollView: {
    maxHeight: '70%'
  },
  // Estilos para la tarjeta de información del cliente
  clienteInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  clienteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  clienteInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary
  },
  clienteInfoText: {
    flex: 1
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  clienteEmail: {
    fontSize: 14,
    color: colors.text + '80'
  },
  // Estilos para el contenedor de errores
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16
  },
  errorIcon: {
    marginRight: 8
  },
  errorText: {
    flex: 1,
    color: '#c62828',
    fontSize: 14
  },
  // Estilos para el formulario
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  formGroup: {
    marginBottom: 16
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  labelIcon: {
    marginRight: 6
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flexShrink: 1
  },
  required: {
    color: '#c62828',
    fontWeight: 'bold'
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: 'white',
    minHeight: 44,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.text
  },
  // Estilos para el contenedor de carga
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text + '80'
  },
  coloresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2
  },
  // Estilos para las opciones adicionales
  optionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 2
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12
  },
  switchLabel: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap'
  },
  infoContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text + 'CC',
    lineHeight: 18,
    flexWrap: 'wrap'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 12
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 15
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonIcon: {
    marginRight: 8
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15
  },
  disabledButton: {
    opacity: 0.6
  }
});
