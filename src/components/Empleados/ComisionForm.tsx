// src/components/Empleados/ComisionForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ComisionEmpleado } from '../../api/comisionesEmpleado.api';
import { ServicioAsignado, getServiciosPorEmpleado } from '../../api/serviciosEmpleados.api';
import { FormInput } from '../../components/common/FormInput';
import { FormSelect } from '../../components/common/FormSelect';
import { FormDatePicker } from '../../components/common/FormDatePicker';
import { FormSwitch } from '../../components/common/FormSwitch';

interface ComisionFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (comision: Partial<ComisionEmpleado>) => void;
  empleadoId: string;
  comision?: ComisionEmpleado;
}

const ComisionForm: React.FC<ComisionFormProps> = ({
  visible,
  onClose,
  onSave,
  empleadoId,
  comision
}) => {
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState<ServicioAsignado[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  
  // Form state
  const [tipoComision, setTipoComision] = useState<'porcentaje' | 'monto_fijo'>(comision?.tipo_aplicacion || 'porcentaje');
  const [servicioId, setServicioId] = useState<string | null>(comision?.servicioId?.toString() || null);
  const [porcentaje, setPorcentaje] = useState(comision?.tipo_aplicacion === 'porcentaje' ? comision.valor.toString() : '0');
  const [montoFijo, setMontoFijo] = useState(comision?.tipo_aplicacion === 'monto_fijo' ? comision.valor.toString() : '0');
  const [fechaInicio, setFechaInicio] = useState<Date>(comision?.fecha_inicio ? new Date(comision.fecha_inicio) : new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(comision?.fecha_fin ? new Date(comision.fecha_fin) : null);
  const [activo, setActivo] = useState(comision?.activo ?? true);

  const cargarServicios = async () => {
    try {
      setLoadingServicios(true);
      const data = await getServiciosPorEmpleado(empleadoId);
      const serviciosActivos = data.filter(servicio => 
        servicio.activo === undefined || servicio.activo === true
      );
      setServicios(serviciosActivos);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoadingServicios(false);
    }
  };

  useEffect(() => {
    if (visible && empleadoId) {
      cargarServicios();
    }
  }, [empleadoId, visible]);

  const handleGuardar = () => {
    try {
      // Validar datos
      if (tipoComision === 'porcentaje' && (isNaN(parseFloat(porcentaje)) || parseFloat(porcentaje) <= 0)) {
        Alert.alert('Error', 'Debes ingresar un porcentaje válido mayor a 0');
        return;
      }
      
      if (tipoComision === 'monto_fijo' && (isNaN(parseFloat(montoFijo)) || parseFloat(montoFijo) <= 0)) {
        Alert.alert('Error', 'Debes ingresar un monto fijo válido mayor a 0');
        return;
      }
      
      // Preparar datos para enviar al backend en el formato exacto que espera
      const datosComision: Partial<ComisionEmpleado> = {
        empleadoId: parseInt(empleadoId),
        tipo_aplicacion: tipoComision,
        aplica_a: servicioId ? 'servicio' : 'servicios',
        valor: tipoComision === 'monto_fijo' 
          ? parseFloat(montoFijo) 
          : parseFloat(porcentaje)
      };
      
      // Si hay un servicio específico, incluirlo
      if (servicioId) {
        datosComision.servicioId = parseInt(servicioId);
      }
      
      console.log('Enviando datos de comisión desde formulario:', datosComision);
      
      // Enviar datos al componente padre
      onSave(datosComision);
      
      // Cerrar formulario
      onClose();
    } catch (error) {
      console.error('Error al guardar comisión:', error);
      Alert.alert('Error', 'No se pudo guardar la comisión');
    }
  };

  const tipoComisionOptions = [
    { label: 'Porcentaje', value: 'porcentaje' },
    { label: 'Monto fijo', value: 'monto_fijo' }
  ];

  const servicioOptions = servicios.map(servicio => ({
    label: servicio.servicio?.nombre || 'Servicio sin nombre',
    value: servicio.servicioId
  }));
  
  // Agregar opción para comisión general
  servicioOptions.unshift({ label: 'Comisión General (todos los servicios)', value: '' });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {comision ? 'Editar Comisión' : 'Nueva Comisión'}
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
            {loadingServicios ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <FormSelect
                  label="Tipo de comisión"
                  items={tipoComisionOptions}
                  value={tipoComision}
                  onValueChange={(value: string) => setTipoComision(value as 'porcentaje' | 'monto_fijo')}
                />
                
                <FormSelect
                  label="Servicio"
                  items={servicioOptions}
                  value={servicioId || ''}
                  onValueChange={(value: string) => setServicioId(value || null)}
                  placeholder="Seleccione un servicio"
                />
                
                {tipoComision === 'porcentaje' && (
                  <FormInput
                    label="Porcentaje de comisión"
                    value={porcentaje}
                    onChangeText={setPorcentaje}
                    placeholder="Ej. 10"
                    keyboardType="numeric"
                  />
                )}
                
                {tipoComision === 'monto_fijo' && (
                  <FormInput
                    label="Monto fijo"
                    value={montoFijo}
                    onChangeText={setMontoFijo}
                    placeholder="Ej. 5000"
                    keyboardType="numeric"
                  />
                )}
                
                <FormDatePicker
                  label="Fecha de inicio"
                  value={fechaInicio}
                  onChange={(date: Date | null) => date && setFechaInicio(date)}
                />
                
                <FormDatePicker
                  label="Fecha de fin (opcional)"
                  value={fechaFin}
                  onChange={(date: Date | null) => setFechaFin(date)}
                  nullable
                />
                
                <FormSwitch
                  label="Comisión activa"
                  value={activo}
                  onValueChange={setActivo}
                />
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleGuardar}
              disabled={loading || loadingServicios}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  modalTitle: {
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
  modalFooter: {
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

export default ComisionForm;
