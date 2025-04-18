// src/components/Estadisticas/FiltrosEstadisticas.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatePickerField } from '../common/DatePickerField';
import { SelectField, SelectOption } from '../common/SelectField';
import { FiltrosEstadisticas as FiltrosEstadisticasType } from '../../interfaces/Estadisticas';
import { colors } from '../../theme/colors';

interface FiltrosEstadisticasProps {
  filtros: FiltrosEstadisticasType;
  onFiltrosChange: (filtros: FiltrosEstadisticasType) => void;
  categorias: string[];
  empleados: { id: string; nombre: string; apellido: string }[];
  onAplicarFiltros: () => void;
}

export const FiltrosEstadisticas: React.FC<FiltrosEstadisticasProps> = ({
  filtros,
  onFiltrosChange,
  categorias,
  empleados,
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

  const handleChangeCategoria = (value: string) => {
    onFiltrosChange({
      ...filtros,
      categoria_servicio: value === 'todas' ? undefined : value,
    });
  };

  const handleChangeEmpleado = (value: string) => {
    onFiltrosChange({
      ...filtros,
      empleado_id: value === 'todos' ? undefined : value,
    });
  };

  const handleChangePeriodo = (value: string) => {
    onFiltrosChange({
      ...filtros,
      periodo: value as 'diario' | 'semanal' | 'mensual' | 'anual',
    });
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      fecha_inicio: undefined,
      fecha_fin: undefined,
      categoria_servicio: undefined,
      empleado_id: undefined,
      periodo: 'mensual',
    });
  };

  const getCategoriaOptions = (): SelectOption[] => {
    const options: SelectOption[] = [{ label: 'Todas las categorías', value: 'todas' }];
    
    categorias.forEach(categoria => {
      options.push({ label: categoria, value: categoria });
    });
    
    return options;
  };

  const getEmpleadoOptions = (): SelectOption[] => {
    const options: SelectOption[] = [{ label: 'Todos los empleados', value: 'todos' }];
    
    empleados.forEach(empleado => {
      options.push({ 
        label: `${empleado.nombre} ${empleado.apellido}`, 
        value: empleado.id 
      });
    });
    
    return options;
  };

  const getPeriodoOptions = (): SelectOption[] => {
    return [
      { label: 'Diario', value: 'diario' },
      { label: 'Semanal', value: 'semanal' },
      { label: 'Mensual', value: 'mensual' },
      { label: 'Anual', value: 'anual' },
    ];
  };

  return (
    <View style={styles.container}>
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
          {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
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
              label="Período"
              value={filtros.periodo || 'mensual'}
              options={getPeriodoOptions()}
              onValueChange={handleChangePeriodo}
              placeholder="Seleccionar período"
            />
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Categoría"
              value={filtros.categoria_servicio || 'todas'}
              options={getCategoriaOptions()}
              onValueChange={handleChangeCategoria}
              placeholder="Seleccionar categoría"
            />
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Empleado"
              value={filtros.empleado_id || 'todos'}
              options={getEmpleadoOptions()}
              onValueChange={handleChangeEmpleado}
              placeholder="Seleccionar empleado"
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
