// src/components/Inventario/FiltrosProductos.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../common/SearchBar';
import { SelectField, SelectOption } from '../common/SelectField';
import { 
  FiltrosProductos as FiltrosProductosType,
  EstadoProducto,
  TipoProducto
} from '../../interfaces/Producto';
import { colors } from '../../theme/colors';

interface FiltrosProductosProps {
  filtros: FiltrosProductosType;
  onFiltrosChange: (filtros: FiltrosProductosType) => void;
  onAplicarFiltros: () => void;
  categorias: { id: string; nombre: string }[];
  proveedores: { id: string; nombre: string }[];
}

export const FiltrosProductos: React.FC<FiltrosProductosProps> = ({
  filtros,
  onFiltrosChange,
  onAplicarFiltros,
  categorias,
  proveedores,
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleChangeBusqueda = (value: string) => {
    onFiltrosChange({
      ...filtros,
      busqueda: value.trim() === '' ? undefined : value,
    });
  };

  const handleChangeCategoria = (value: string) => {
    onFiltrosChange({
      ...filtros,
      categoria_id: value === 'todas' ? undefined : value,
    });
  };

  const handleChangeProveedor = (value: string) => {
    onFiltrosChange({
      ...filtros,
      proveedor_id: value === 'todos' ? undefined : value,
    });
  };

  const handleChangeEstado = (value: string) => {
    onFiltrosChange({
      ...filtros,
      estado: value === 'todos' ? undefined : value as EstadoProducto,
    });
  };

  const handleChangeTipo = (value: string) => {
    onFiltrosChange({
      ...filtros,
      tipo: value === 'todos' ? undefined : value as TipoProducto,
    });
  };

  const handleChangeStockBajo = (value: boolean) => {
    onFiltrosChange({
      ...filtros,
      stock_bajo: value,
    });
  };

  const handleChangeDestacado = (value: boolean) => {
    onFiltrosChange({
      ...filtros,
      destacado: value,
    });
  };

  const handleChangeOrdenamiento = (campo: string, orden: 'asc' | 'desc') => {
    onFiltrosChange({
      ...filtros,
      ordenar_por: campo as any,
      orden,
    });
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: undefined,
      categoria_id: undefined,
      proveedor_id: undefined,
      estado: undefined,
      tipo: undefined,
      stock_bajo: undefined,
      destacado: undefined,
      ordenar_por: undefined,
      orden: undefined,
    });
  };

  const getCategoriasOptions = (): SelectOption[] => {
    const options: SelectOption[] = [
      { label: 'Todas las categorías', value: 'todas' },
    ];
    
    categorias.forEach((categoria) => {
      options.push({
        label: categoria.nombre,
        value: categoria.id,
      });
    });
    
    return options;
  };

  const getProveedoresOptions = (): SelectOption[] => {
    const options: SelectOption[] = [
      { label: 'Todos los proveedores', value: 'todos' },
    ];
    
    proveedores.forEach((proveedor) => {
      options.push({
        label: proveedor.nombre,
        value: proveedor.id,
      });
    });
    
    return options;
  };

  const getEstadoOptions = (): SelectOption[] => {
    return [
      { label: 'Todos los estados', value: 'todos' },
      { label: 'Activo', value: 'activo' },
      { label: 'Inactivo', value: 'inactivo' },
      { label: 'Agotado', value: 'agotado' },
    ];
  };

  const getTipoOptions = (): SelectOption[] => {
    return [
      { label: 'Todos los tipos', value: 'todos' },
      { label: 'Producto', value: 'producto' },
      { label: 'Servicio', value: 'servicio' },
    ];
  };

  const getOrdenamientoOptions = (): SelectOption[] => {
    return [
      { label: 'Nombre (A-Z)', value: 'nombre_asc' },
      { label: 'Nombre (Z-A)', value: 'nombre_desc' },
      { label: 'Precio (Menor a Mayor)', value: 'precio_asc' },
      { label: 'Precio (Mayor a Menor)', value: 'precio_desc' },
      { label: 'Stock (Menor a Mayor)', value: 'stock_asc' },
      { label: 'Stock (Mayor a Menor)', value: 'stock_desc' },
      { label: 'Ventas (Menor a Mayor)', value: 'ventas_asc' },
      { label: 'Ventas (Mayor a Menor)', value: 'ventas_desc' },
      { label: 'Más recientes', value: 'fecha_creacion_desc' },
      { label: 'Más antiguos', value: 'fecha_creacion_asc' },
    ];
  };

  const handleOrdenamientoChange = (value: string) => {
    const [campo, orden] = value.split('_');
    handleChangeOrdenamiento(campo, orden as 'asc' | 'desc');
  };

  const getOrdenamientoActual = (): string => {
    if (!filtros.ordenar_por || !filtros.orden) return '';
    return `${filtros.ordenar_por}_${filtros.orden}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={filtros.busqueda || ''}
          onChangeText={handleChangeBusqueda}
          placeholder="Buscar productos..."
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
          <View style={styles.selectContainer}>
            <SelectField
              label="Categoría"
              value={filtros.categoria_id || 'todas'}
              options={getCategoriasOptions()}
              onValueChange={handleChangeCategoria}
              placeholder="Seleccionar categoría"
              icon="pricetag-outline"
            />
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Proveedor"
              value={filtros.proveedor_id || 'todos'}
              options={getProveedoresOptions()}
              onValueChange={handleChangeProveedor}
              placeholder="Seleccionar proveedor"
              icon="business-outline"
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
              label="Tipo"
              value={filtros.tipo || 'todos'}
              options={getTipoOptions()}
              onValueChange={handleChangeTipo}
              placeholder="Seleccionar tipo"
              icon="cube-outline"
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxButton}
              onPress={() => handleChangeStockBajo(!filtros.stock_bajo)}
            >
              <View style={styles.checkbox}>
                {filtros.stock_bajo && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Mostrar solo productos con stock bajo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxButton}
              onPress={() => handleChangeDestacado(!filtros.destacado)}
            >
              <View style={styles.checkbox}>
                {filtros.destacado && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Mostrar solo productos destacados</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectContainer}>
            <SelectField
              label="Ordenar por"
              value={getOrdenamientoActual()}
              options={getOrdenamientoOptions()}
              onValueChange={handleOrdenamientoChange}
              placeholder="Seleccionar ordenamiento"
              icon="swap-vertical-outline"
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
  selectContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
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
