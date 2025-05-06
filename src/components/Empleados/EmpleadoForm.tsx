// src/components/Empleados/EmpleadoForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Empleado } from '../../api/empleados.api';
import { FormField } from '../common/FormField';
import { ActionButton } from '../common/ActionButton';
import { SelectField, SelectOption } from '../common/SelectField';
import { StatusMessage } from '../common/StatusMessage';
import { DatePickerField } from '../common/DatePickerField';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

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
  // Información personal
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Dirección
  const [direccionPais, setDireccionPais] = useState('');
  const [direccionCiudad, setDireccionCiudad] = useState('');
  const [direccionDetalle, setDireccionDetalle] = useState('');
  
  // Información profesional
  const [nivelEstudio, setNivelEstudio] = useState('');
  const [tipoContrato, setTipoContrato] = useState('');
  const [cargo, setCargo] = useState('');
  const [nivelCrecimiento, setNivelCrecimiento] = useState('');
  const [fechaInicioContrato, setFechaInicioContrato] = useState<Date | null>(null);
  const [activoParaReservas, setActivoParaReservas] = useState('true');
  const [colorAsignado, setColorAsignado] = useState('#4287f5');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [currentSection, setCurrentSection] = useState<'personal' | 'direccion' | 'profesional'>('personal');
  
  const nivelEstudioOptions: SelectOption[] = [
    { label: 'Primaria', value: 'Primaria' },
    { label: 'Secundaria', value: 'Secundaria' },
    { label: 'Técnico', value: 'Técnico' },
    { label: 'Tecnólogo', value: 'Tecnólogo' },
    { label: 'Profesional', value: 'Profesional' },
    { label: 'Especialización', value: 'Especialización' },
    { label: 'Maestría', value: 'Maestría' },
    { label: 'Doctorado', value: 'Doctorado' },
  ];
  
  const tipoContratoOptions: SelectOption[] = [
    { label: 'Indefinido', value: 'INDEFINIDO' },
    { label: 'Fijo', value: 'FIJO' },
    { label: 'Obra o labor', value: 'OBRA_LABOR' },
    { label: 'Prestación de servicios', value: 'PRESTACION_SERVICIOS' },
    { label: 'Aprendizaje', value: 'APRENDIZAJE' },
  ];
  
  const cargoOptions: SelectOption[] = [
    { label: 'Optometrista junior', value: 'Optometrista junior' },
    { label: 'Optometrista senior', value: 'Optometrista senior' },
    { label: 'Asistente', value: 'Asistente' },
    { label: 'Recepcionista', value: 'Recepcionista' },
    { label: 'Vendedor', value: 'Vendedor' },
    { label: 'Gerente', value: 'Gerente' },
  ];
  
  const nivelCrecimientoOptions: SelectOption[] = [
    { label: 'Junior', value: 'Junior' },
    { label: 'Semi-senior', value: 'Semi-senior' },
    { label: 'Senior', value: 'Senior' },
    { label: 'Experto', value: 'Experto' },
  ];
  
  const activoOptions: SelectOption[] = [
    { label: 'Activo', value: 'true' },
    { label: 'Inactivo', value: 'false' },
  ];
  
  const colorOptions = [
    '#4287f5', '#f54242', '#42f54e', '#f5d442', '#f542f2', 
    '#42f5f5', '#7b42f5', '#f59642', '#f54284', '#42f584'
  ];
  
  useEffect(() => {
    if (empleado) {
      // Información personal
      setNombres(empleado.nombres || '');
      setApellidos(empleado.apellidos || '');
      setIdentificacion(empleado.identificacion || '');
      setFechaNacimiento(empleado.fecha_nacimiento ? new Date(empleado.fecha_nacimiento) : null);
      setEmail(empleado.email || '');
      setTelefono(empleado.telefono || '');
      
      // Dirección
      setDireccionPais(empleado.direccion_pais || '');
      setDireccionCiudad(empleado.direccion_ciudad || '');
      setDireccionDetalle(empleado.direccion_detalle || '');
      
      // Información profesional
      setNivelEstudio(empleado.nivel_estudio || '');
      setTipoContrato(empleado.tipo_contrato || '');
      setCargo(empleado.cargo || '');
      setNivelCrecimiento(empleado.nivel_crecimiento || '');
      setFechaInicioContrato(empleado.fecha_inicio_contrato ? new Date(empleado.fecha_inicio_contrato) : null);
      setActivoParaReservas(empleado.activo_para_reservas ? 'true' : 'false');
      setColorAsignado(empleado.color_asignado || '#4287f5');
    }
  }, [empleado]);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nombres.trim()) newErrors.nombres = 'El nombre es requerido';
    if (!apellidos.trim()) newErrors.apellidos = 'El apellido es requerido';
    if (!email.trim()) newErrors.email = 'El email es requerido';
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (!telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!identificacion.trim()) newErrors.identificacion = 'La identificación es requerida';
    if (!cargo) newErrors.cargo = 'El cargo es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, corrige los errores en el formulario'
      });
      return;
    }
    
    try {
      const empleadoData: Partial<Empleado> = {
        // Información personal
        nombres,
        apellidos,
        identificacion,
        fecha_nacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : undefined,
        email,
        telefono,
        
        // Dirección
        direccion_pais: direccionPais,
        direccion_ciudad: direccionCiudad,
        direccion_detalle: direccionDetalle,
        
        // Información profesional
        nivel_estudio: nivelEstudio,
        tipo_contrato: tipoContrato,
        cargo,
        nivel_crecimiento: nivelCrecimiento,
        fecha_inicio_contrato: fechaInicioContrato ? fechaInicioContrato.toISOString().split('T')[0] : undefined,
        activo_para_reservas: activoParaReservas === 'true',
        color_asignado: colorAsignado,
      };
      
      await onSubmit(empleadoData);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al guardar el empleado'
      });
    }
  };
  
  const renderSectionTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, currentSection === 'personal' && styles.activeTab]}
        onPress={() => setCurrentSection('personal')}
      >
        <Ionicons 
          name="person-outline" 
          size={20} 
          color={currentSection === 'personal' ? colors.primary : colors.text} 
        />
        <Text style={[styles.tabText, currentSection === 'personal' && styles.activeTabText]}>
          Personal
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentSection === 'direccion' && styles.activeTab]}
        onPress={() => setCurrentSection('direccion')}
      >
        <Ionicons 
          name="location-outline" 
          size={20} 
          color={currentSection === 'direccion' ? colors.primary : colors.text} 
        />
        <Text style={[styles.tabText, currentSection === 'direccion' && styles.activeTabText]}>
          Dirección
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentSection === 'profesional' && styles.activeTab]}
        onPress={() => setCurrentSection('profesional')}
      >
        <Ionicons 
          name="briefcase-outline" 
          size={20} 
          color={currentSection === 'profesional' ? colors.primary : colors.text} 
        />
        <Text style={[styles.tabText, currentSection === 'profesional' && styles.activeTabText]}>
          Profesional
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderPersonalInfo = () => (
    <>
      <FormField
        label="Nombres"
        value={nombres}
        onChangeText={setNombres}
        placeholder="Ingrese nombres"
        error={errors.nombres}
      />
      
      <FormField
        label="Apellidos"
        value={apellidos}
        onChangeText={setApellidos}
        placeholder="Ingrese apellidos"
        error={errors.apellidos}
      />
      
      <FormField
        label="Identificación"
        value={identificacion}
        onChangeText={setIdentificacion}
        placeholder="Ingrese número de identificación"
        error={errors.identificacion}
      />
      
      <DatePickerField
        label="Fecha de nacimiento"
        value={fechaNacimiento}
        onChange={setFechaNacimiento}
        placeholder="Seleccione fecha de nacimiento"
        error={errors.fechaNacimiento}
      />
      
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Ingrese email"
        keyboardType="email-address"
        error={errors.email}
      />
      
      <FormField
        label="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Ingrese teléfono"
        keyboardType="phone-pad"
        error={errors.telefono}
      />
    </>
  );
  
  const renderDireccionInfo = () => (
    <>
      <FormField
        label="País"
        value={direccionPais}
        onChangeText={setDireccionPais}
        placeholder="Ingrese país"
        error={errors.direccionPais}
      />
      
      <FormField
        label="Ciudad"
        value={direccionCiudad}
        onChangeText={setDireccionCiudad}
        placeholder="Ingrese ciudad"
        error={errors.direccionCiudad}
      />
      
      <FormField
        label="Dirección detallada"
        value={direccionDetalle}
        onChangeText={setDireccionDetalle}
        placeholder="Ingrese dirección detallada"
        error={errors.direccionDetalle}
        multiline
      />
    </>
  );
  
  const renderProfesionalInfo = () => (
    <>
      <SelectField
        label="Nivel de estudio"
        value={nivelEstudio}
        onValueChange={setNivelEstudio}
        options={nivelEstudioOptions}
        placeholder="Seleccione nivel de estudio"
        error={errors.nivelEstudio}
      />
      
      <SelectField
        label="Tipo de contrato"
        value={tipoContrato}
        onValueChange={setTipoContrato}
        options={tipoContratoOptions}
        placeholder="Seleccione tipo de contrato"
        error={errors.tipoContrato}
      />
      
      <SelectField
        label="Cargo"
        value={cargo}
        onValueChange={setCargo}
        options={cargoOptions}
        placeholder="Seleccione cargo"
        error={errors.cargo}
      />
      
      <SelectField
        label="Nivel de crecimiento"
        value={nivelCrecimiento}
        onValueChange={setNivelCrecimiento}
        options={nivelCrecimientoOptions}
        placeholder="Seleccione nivel de crecimiento"
        error={errors.nivelCrecimiento}
      />
      
      <DatePickerField
        label="Fecha de inicio de contrato"
        value={fechaInicioContrato}
        onChange={setFechaInicioContrato}
        placeholder="Seleccione fecha de inicio"
        error={errors.fechaInicioContrato}
      />
      
      <SelectField
        label="Estado para reservas"
        value={activoParaReservas}
        onValueChange={setActivoParaReservas}
        options={activoOptions}
        error={errors.activoParaReservas}
      />
      
      <View style={styles.colorSelector}>
        <Text style={styles.colorLabel}>Color asignado</Text>
        <View style={styles.colorOptions}>
          {colorOptions.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                colorAsignado === color && styles.selectedColorOption
              ]}
              onPress={() => setColorAsignado(color)}
            />
          ))}
        </View>
      </View>
    </>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        {empleado ? 'Editar empleado' : 'Nuevo empleado'}
      </Text>
      
      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
      
      {renderSectionTabs()}
      
      <View style={styles.formSection}>
        {currentSection === 'personal' && renderPersonalInfo()}
        {currentSection === 'direccion' && renderDireccionInfo()}
        {currentSection === 'profesional' && renderProfesionalInfo()}
      </View>
      
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Cancelar"
          onPress={onCancel}
          type="secondary"
          style={styles.button}
        />
        <ActionButton
          title={empleado ? 'Guardar cambios' : 'Crear empleado'}
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
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    marginLeft: 4,
    color: colors.text,
    fontSize: 14,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 16,
  },
  colorSelector: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 4,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#000',
  },
});
