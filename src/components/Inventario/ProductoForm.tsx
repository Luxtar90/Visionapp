// src/components/Inventario/ProductoForm.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity,
  Image,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormField } from '../common/FormField';
import { SelectField, SelectOption } from '../common/SelectField';
import { ActionButton } from '../common/ActionButton';
import { StatusMessage } from '../common/StatusMessage';
import { 
  Producto, 
  Categoria, 
  Proveedor,
  EstadoProducto,
  TipoProducto
} from '../../interfaces/Producto';
import { colors } from '../../theme/colors';

interface ProductoFormProps {
  producto?: Producto;
  categorias: Categoria[];
  proveedores: Proveedor[];
  onSubmit: (data: Partial<Producto>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductoForm: React.FC<ProductoFormProps> = ({
  producto,
  categorias,
  proveedores,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Producto>>(
    producto || {
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      precio_compra: 0,
      stock: 0,
      stock_minimo: 0,
      tipo: 'producto',
      estado: 'activo',
      categoria_id: '',
      destacado: false,
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [imagenes, setImagenes] = useState<string[]>(
    producto?.imagenes || []
  );

  const handleChange = (name: keyof Producto, value: any) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones
    if (!formData.codigo?.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    }
    
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (formData.precio === undefined || formData.precio < 0) {
      newErrors.precio = 'El precio debe ser un número mayor o igual a 0';
    }
    
    if (formData.tipo === 'producto') {
      if (formData.stock === undefined || formData.stock < 0) {
        newErrors.stock = 'El stock debe ser un número mayor o igual a 0';
      }
      
      if (formData.stock_minimo === undefined || formData.stock_minimo < 0) {
        newErrors.stock_minimo = 'El stock mínimo debe ser un número mayor o igual a 0';
      }
    }
    
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Incluir imágenes si se han añadido
      const dataToSubmit = {
        ...formData,
        imagenes: imagenes.length > 0 ? imagenes : undefined,
        imagen_url: imagenes.length > 0 ? imagenes[0] : undefined,
      };
      
      onSubmit(dataToSubmit);
    } else {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, corrige los errores en el formulario'
      });
    }
  };

  const getCategoriasOptions = (): SelectOption[] => {
    const options: SelectOption[] = [
      { label: 'Seleccionar categoría', value: '' },
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
      { label: 'Seleccionar proveedor (opcional)', value: '' },
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
      { label: 'Activo', value: 'activo' },
      { label: 'Inactivo', value: 'inactivo' },
      { label: 'Agotado', value: 'agotado' },
    ];
  };

  const getTipoOptions = (): SelectOption[] => {
    return [
      { label: 'Producto', value: 'producto' },
      { label: 'Servicio', value: 'servicio' },
    ];
  };

  const handleAddImagen = () => {
    // En una implementación real, aquí se abriría un selector de imágenes
    // Por ahora, simplemente añadimos una URL de ejemplo
    const nuevaImagen = 'https://via.placeholder.com/300x200';
    setImagenes(prev => [...prev, nuevaImagen]);
  };

  const handleRemoveImagen = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
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
          label="Código"
          value={formData.codigo || ''}
          onChangeText={(value) => handleChange('codigo', value)}
          placeholder="Ingrese el código del producto"
          error={errors.codigo}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Nombre"
          value={formData.nombre || ''}
          onChangeText={(value) => handleChange('nombre', value)}
          placeholder="Ingrese el nombre del producto"
          error={errors.nombre}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Descripción"
          value={formData.descripcion || ''}
          onChangeText={(value) => handleChange('descripcion', value)}
          placeholder="Ingrese la descripción del producto"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.formHalfGroup}>
          <FormField
            label="Precio de venta"
            value={formData.precio?.toString() || ''}
            onChangeText={(value) => handleChange('precio', parseFloat(value) || 0)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.precio}
            required
          />
        </View>
        
        <View style={styles.formHalfGroup}>
          <FormField
            label="Precio de compra"
            value={formData.precio_compra?.toString() || ''}
            onChangeText={(value) => handleChange('precio_compra', parseFloat(value) || 0)}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <SelectField
          label="Tipo"
          value={formData.tipo as string}
          options={getTipoOptions()}
          onValueChange={(value) => handleChange('tipo', value as TipoProducto)}
          placeholder="Seleccionar tipo"
          icon="cube-outline"
          required
        />
      </View>
      
      {formData.tipo === 'producto' && (
        <>
          <View style={styles.formRow}>
            <View style={styles.formHalfGroup}>
              <FormField
                label="Stock actual"
                value={formData.stock?.toString() || ''}
                onChangeText={(value) => handleChange('stock', parseInt(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
                error={errors.stock}
                required
              />
            </View>
            
            <View style={styles.formHalfGroup}>
              <FormField
                label="Stock mínimo"
                value={formData.stock_minimo?.toString() || ''}
                onChangeText={(value) => handleChange('stock_minimo', parseInt(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
                error={errors.stock_minimo}
                required
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Unidad de medida"
              value={formData.unidad_medida || ''}
              onChangeText={(value) => handleChange('unidad_medida', value)}
              placeholder="Ej: uds, kg, litros"
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Ubicación en almacén"
              value={formData.ubicacion || ''}
              onChangeText={(value) => handleChange('ubicacion', value)}
              placeholder="Ej: Estante A, Pasillo 3"
            />
          </View>
          
          <View style={styles.formGroup}>
            <FormField
              label="Código de barras"
              value={formData.codigo_barras || ''}
              onChangeText={(value) => handleChange('codigo_barras', value)}
              placeholder="Ingrese el código de barras"
            />
          </View>
        </>
      )}
      
      <View style={styles.formGroup}>
        <SelectField
          label="Categoría"
          value={formData.categoria_id || ''}
          options={getCategoriasOptions()}
          onValueChange={(value) => handleChange('categoria_id', value)}
          placeholder="Seleccionar categoría"
          icon="pricetag-outline"
          error={errors.categoria_id}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <SelectField
          label="Proveedor"
          value={formData.proveedor_id || ''}
          options={getProveedoresOptions()}
          onValueChange={(value) => handleChange('proveedor_id', value)}
          placeholder="Seleccionar proveedor"
          icon="business-outline"
        />
      </View>
      
      <View style={styles.formGroup}>
        <SelectField
          label="Estado"
          value={formData.estado as string}
          options={getEstadoOptions()}
          onValueChange={(value) => handleChange('estado', value as EstadoProducto)}
          placeholder="Seleccionar estado"
          icon="checkmark-circle-outline"
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Destacado</Text>
          <Switch
            value={formData.destacado}
            onValueChange={(value) => handleChange('destacado', value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={formData.destacado ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.imageLabel}>Imágenes</Text>
        
        <View style={styles.imagenesContainer}>
          {imagenes.map((imagen, index) => (
            <View key={index} style={styles.imagenItem}>
              <Image
                source={{ uri: imagen }}
                style={styles.imagenPreview}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => handleRemoveImagen(index)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addImageButton}
            onPress={handleAddImagen}
          >
            <Ionicons name="add" size={30} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <ActionButton
          label="Cancelar"
          onPress={onCancel}
          type="secondary"
          style={styles.button}
        />
        <ActionButton
          label={producto ? "Actualizar" : "Crear"}
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formHalfGroup: {
    width: '48%',
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
  imageLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  imagenesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imagenItem: {
    position: 'relative',
    width: 100,
    height: 100,
    margin: 4,
  },
  imagenPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
