// src/components/Inventario/MovimientoForm.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormField } from '../common/FormField';
import { SelectField, SelectOption } from '../common/SelectField';
import { DatePickerField } from '../common/DatePickerField';
import { ActionButton } from '../common/ActionButton';
import { StatusMessage } from '../common/StatusMessage';
import { 
  MovimientoInventario,
  Producto
} from '../../interfaces/Producto';
import { colors } from '../../theme/colors';

interface MovimientoFormProps {
  producto?: Producto;
  onSubmit: (data: Partial<MovimientoInventario>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  tiendaId: string;
  usuarioId: string;
  usuarioNombre: string;
}

export const MovimientoForm: React.FC<MovimientoFormProps> = ({
  producto,
  onSubmit,
  onCancel,
  isLoading = false,
  tiendaId,
  usuarioId,
  usuarioNombre,
}) => {
  const [formData, setFormData] = useState<Partial<MovimientoInventario>>({
    producto_id: producto?.id || '',
    tipo: 'entrada',
    cantidad: 1,
    fecha: new Date().toISOString(),
    motivo: '',
    usuario_id: usuarioId,
    usuario_nombre: usuarioNombre,
    tienda_id: tiendaId,
    costo_unitario: producto?.precio_compra || 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (name: keyof MovimientoInventario, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Actualizar costo total cuando cambia la cantidad o el costo unitario
    if (name === 'cantidad' || name === 'costo_unitario') {
      const cantidad = name === 'cantidad' ? value : formData.cantidad || 0;
      const costoUnitario = name === 'costo_unitario' ? value : formData.costo_unitario || 0;
      setFormData(prev => ({
        ...prev,
        costo_total: cantidad * costoUnitario
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones
    if (!formData.producto_id) {
      newErrors.producto_id = 'El producto es obligatorio';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de movimiento es obligatorio';
    }
    
    if (formData.cantidad === undefined || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor que 0';
    }
    
    if (formData.tipo === 'salida' && producto && formData.cantidad && formData.cantidad > producto.stock) {
      newErrors.cantidad = `La cantidad no puede ser mayor que el stock actual (${producto.stock})`;
    }
    
    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo es obligatorio';
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, corrige los errores en el formulario'
      });
    }
  };

  const getTipoOptions = (): SelectOption[] => {
    return [
      { label: 'Entrada', value: 'entrada' },
      { label: 'Salida', value: 'salida' },
      { label: 'Ajuste', value: 'ajuste' },
    ];
  };

  const getMotivoSugerencias = (): string[] => {
    switch (formData.tipo) {
      case 'entrada':
        return [
          'Compra a proveedor',
          'Devolución de cliente',
          'Transferencia desde otra tienda',
          'Corrección de inventario',
        ];
      case 'salida':
        return [
          'Venta',
          'Devolución a proveedor',
          'Transferencia a otra tienda',
          'Producto dañado',
          'Producto vencido',
          'Muestra/Regalo',
        ];
      case 'ajuste':
        return [
          'Corrección de inventario',
          'Inventario físico',
          'Pérdida',
          'Error de registro',
        ];
      default:
        return [];
    }
  };

  const renderMotivoSugerencias = () => {
    const sugerencias = getMotivoSugerencias();
    
    if (sugerencias.length === 0) return null;
    
    return (
      <View style={styles.sugerenciasContainer}>
        <Text style={styles.sugerenciasLabel}>Sugerencias:</Text>
        <View style={styles.sugerenciasList}>
          {sugerencias.map((sugerencia, index) => (
            <TouchableOpacity
              key={index}
              style={styles.sugerenciaItem}
              onPress={() => handleChange('motivo', sugerencia)}
            >
              <Text style={styles.sugerenciaText}>{sugerencia}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
      
      {producto && (
        <View style={styles.productoInfo}>
          <Text style={styles.productoTitulo}>Producto seleccionado:</Text>
          <Text style={styles.productoNombre}>{producto.nombre}</Text>
          <View style={styles.productoDetalles}>
            <Text style={styles.productoCodigo}>Código: {producto.codigo}</Text>
            <Text style={styles.productoStock}>Stock actual: {producto.stock} {producto.unidad_medida || 'uds'}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.formGroup}>
        <SelectField
          label="Tipo de movimiento"
          value={formData.tipo as string}
          options={getTipoOptions()}
          onValueChange={(value) => handleChange('tipo', value)}
          placeholder="Seleccionar tipo"
          icon="swap-horizontal-outline"
          error={errors.tipo}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Cantidad"
          value={formData.cantidad?.toString()}
          onChangeText={(value) => handleChange('cantidad', parseInt(value) || 0)}
          placeholder="Ingrese la cantidad"
          keyboardType="numeric"
          error={errors.cantidad}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <DatePickerField
          label="Fecha"
          value={formData.fecha ? new Date(formData.fecha) : new Date()}
          onChange={(date) => handleChange('fecha', date?.toISOString())}
          placeholder="Seleccionar fecha"
          mode="datetime"
          error={errors.fecha}
          required
        />
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Motivo"
          value={formData.motivo}
          onChangeText={(value) => handleChange('motivo', value)}
          placeholder="Ingrese el motivo del movimiento"
          multiline
          numberOfLines={3}
          error={errors.motivo}
          required
        />
        {renderMotivoSugerencias()}
      </View>
      
      <View style={styles.formGroup}>
        <FormField
          label="Documento de referencia (opcional)"
          value={formData.documento_referencia}
          onChangeText={(value) => handleChange('documento_referencia', value)}
          placeholder="Ej: Factura #123, Orden #456"
        />
      </View>
      
      {(formData.tipo === 'entrada' || formData.tipo === 'ajuste') && (
        <>
          <View style={styles.formGroup}>
            <FormField
              label="Costo unitario"
              value={formData.costo_unitario?.toString()}
              onChangeText={(value) => handleChange('costo_unitario', parseFloat(value) || 0)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.costoTotalContainer}>
              <Text style={styles.costoTotalLabel}>Costo total:</Text>
              <Text style={styles.costoTotalValue}>
                {((formData.cantidad || 0) * (formData.costo_unitario || 0)).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </>
      )}
      
      <View style={styles.buttonContainer}>
        <ActionButton
          label="Cancelar"
          onPress={onCancel}
          type="secondary"
          style={styles.button}
        />
        <ActionButton
          label="Registrar movimiento"
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
  productoInfo: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  productoTitulo: {
    fontSize: 14,
    color: colors.text + '99',
    marginBottom: 4,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productoDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productoCodigo: {
    fontSize: 14,
    color: colors.text + '99',
  },
  productoStock: {
    fontSize: 14,
    color: colors.text + '99',
  },
  formGroup: {
    marginBottom: 16,
  },
  sugerenciasContainer: {
    marginTop: 8,
  },
  sugerenciasLabel: {
    fontSize: 14,
    color: colors.text + '99',
    marginBottom: 4,
  },
  sugerenciasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sugerenciaItem: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  sugerenciaText: {
    fontSize: 12,
    color: colors.text,
  },
  costoTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  costoTotalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  costoTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
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
