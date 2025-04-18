// src/components/Notificaciones/FiltrosNotificaciones.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatePickerField } from '../common/DatePickerField';
import { SelectField, SelectOption } from '../common/SelectField';
import { SearchBar } from '../common/SearchBar';
import { FiltrosNotificaciones as FiltrosNotificacionesType } from '../../interfaces/Notificacion';
import { colors } from '../../theme/colors';

interface FiltrosNotificacionesProps {
  filtros: FiltrosNotificacionesType;
  onFiltrosChange: (filtros: FiltrosNotificacionesType) => void;
  onAplicarFiltros: () => void;
}

export const FiltrosNotificaciones: React.FC<FiltrosNotificacionesProps> = ({
  filtros,
  onFiltrosChange,
  onAplicarFiltros,
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleChangeFechaInicio = (date: Date | null) => {
    onFiltrosChange({
      ...filtros,
      fecha_inicio: date ? date.toISOString() : undefined,
    });
  };

  const handleChangeFechaFin = (date: Date | null) => {
    onFiltrosChange({
      ...filtros,
      fecha_fin: date ? date.toISOString() : undefined,
    });
  };

  const handleChangeTipo = (value: string) => {
    onFiltrosChange({
      ...filtros,
      tipo: value === 'todas' ? undefined : value as any,
    });
  };

  const handleChangeEstado = (value: string) => {
    onFiltrosChange({
      ...filtros,
      estado: value === 'todos' ? undefined : value as any,
    });
  };

  const handleChangeDestinatario = (value: string) => {
    onFiltrosChange({
      ...filtros,
      destinatario: value === 'todos' ? undefined : value as any,
    });
  };

  const handleChangeBusqueda = (value: string) => {
    onFiltrosChange({
      ...filtros,
      busqueda: value.trim() === '' ? undefined : value,
    });
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      tipo: undefined,
      estado: undefined,
      destinatario: undefined,
      fecha_inicio: undefined,
      fecha_fin: undefined,
      busqueda: undefined,
    });
  };

  const getTipoOptions = (): SelectOption[] => {
    return [
      { label: 'Todas', value: 'todas' },
      { label: 'Informativa', value: 'informativa' },
      { label: 'Promoción', value: 'promocion' },
      { label: 'Recordatorio', value: 'recordatorio' },
      { label: 'Alerta', value: 'alerta' },
    ];
  };

  const getEstadoOptions = (): SelectOption[] => {
    return [
      { label: 'Todos', value: 'todos' },
      { label: 'Pendiente', value: 'pendiente' },
      { label: 'Enviada', value: 'enviada' },
      { label: 'Leída', value: 'leida' },
      { label: 'Cancelada', value: 'cancelada' },
    ];
  };

  const getDestinatarioOptions = (): SelectOption[] => {
    return [
      { label: 'Todos', value: 'todos' },
      { label: 'Clientes', value: 'cliente' },
      { label: 'Empleados', value: 'empleado' },
      { label: 'Todos los usuarios', value: 'todos' },
    ];
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={filtros.busqueda || ''}
          onChangeText={handleChangeBusqueda}
          placeholder="Buscar notificaciones..."
        />
      </View>
      
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={toggleFiltros}
      >
        <Ionicons 
          name={mostrarFiltros ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.primary} 
        />
        <Text style={styles.toggleText}>
          {mostrarFiltros ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
        </Text>
      </TouchableOpacity>

      {mostrarFiltros && (
        <View style={styles.filtrosContainer}>
          <View style={styles.fechasContainer}>
            <View style={styles.fechaItem}>
              <DatePickerField
                label="Fecha inicio"
                value={filtros.fecha_inicio ? new Date(filtros.fecha_inicio) : null}
                onChange={handleChangeFechaInicio}
                placeholder="Seleccionar"
                mode="date"
              />
            </View>
            <View style={styles.fechaItem}>
              <DatePickerField
                label="Fecha fin"
                value={filtros.fecha_fin ? new Date(filtros.fecha_fin) : null}
                onChange={handleChangeFechaFin}
                placeholder="Seleccionar"
                mode="date"
              />
            </View>
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Tipo"
              value={filtros.tipo || 'todas'}
              options={getTipoOptions()}
              onValueChange={handleChangeTipo}
              placeholder="Seleccionar tipo"
              icon="information-circle-outline"
            />
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Estado"
              value={filtros.estado || 'todos'}
              options={getEstadoOptions()}
              onValueChange={handleChangeEstado}
              placeholder="Seleccionar estado"
              icon="checkmark-circle-outline"
            />
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Destinatario"
              value={filtros.destinatario || 'todos'}
              options={getDestinatarioOptions()}
              onValueChange={handleChangeDestinatario}
              placeholder="Seleccionar destinatario"
              icon="people-outline"
            />
          </View>

          <View style={styles.botonesContainer}>
            <TouchableOpacity 
              style={styles.botonLimpiar}
              onPress={limpiarFiltros}
            >
              <Text style={styles.botonLimpiarTexto}>Limpiar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.botonAplicar}
              onPress={onAplicarFiltros}
            >
              <Text style={styles.botonAplicarTexto}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  filtrosContainer: {
    padding: 16,
  },
  fechasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fechaItem: {
    width: '48%',
  },
  selectContainer: {
    marginBottom: 16,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  botonLimpiar: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    width: '48%',
    alignItems: 'center',
  },
  botonLimpiarTexto: {
    color: colors.text,
  },
  botonAplicar: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: colors.primary,
    width: '48%',
    alignItems: 'center',
  },
  botonAplicarTexto: {
    color: 'white',
    fontWeight: '500',
  },
});
