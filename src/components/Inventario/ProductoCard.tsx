// src/components/Inventario/ProductoCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Producto, EstadoProducto } from '../../interfaces/Producto';
import { colors } from '../../theme/colors';

interface ProductoCardProps {
  producto: Producto;
  onPress: (producto: Producto) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdateStock?: (id: string) => void;
  mostrarAcciones?: boolean;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
  producto,
  onPress,
  onEdit,
  onDelete,
  onUpdateStock,
  mostrarAcciones = true,
}) => {
  const getEstadoColor = (estado: EstadoProducto): string => {
    switch (estado) {
      case 'activo':
        return colors.success;
      case 'inactivo':
        return colors.warning;
      case 'agotado':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getEstadoTexto = (estado: EstadoProducto): string => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'agotado':
        return 'Agotado';
      default:
        return '';
    }
  };

  const formatPrecio = (precio: number): string => {
    return precio.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  };

  const isStockBajo = (): boolean => {
    return producto.stock <= producto.stock_minimo && producto.stock > 0;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        producto.estado === 'inactivo' && styles.cardInactivo,
      ]}
      onPress={() => onPress(producto)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          {producto.imagen_url ? (
            <Image
              source={{ uri: producto.imagen_url }}
              style={styles.imagen}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImagen}>
              <Ionicons name="cube-outline" size={30} color={colors.text + '40'} />
            </View>
          )}
          {producto.destacado && (
            <View style={styles.destacadoBadge}>
              <Ionicons name="star" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.codigo}>{producto.codigo}</Text>
          <Text style={styles.nombre} numberOfLines={1}>{producto.nombre}</Text>
          
          <View style={styles.precioContainer}>
            <Text style={styles.precio}>{formatPrecio(producto.precio)}</Text>
            {producto.precio_compra && (
              <Text style={styles.precioCosto}>
                Costo: {formatPrecio(producto.precio_compra)}
              </Text>
            )}
          </View>
          
          <View style={styles.metaInfo}>
            <View 
              style={[
                styles.estadoBadge, 
                { backgroundColor: getEstadoColor(producto.estado) + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.estadoTexto, 
                  { color: getEstadoColor(producto.estado) }
                ]}
              >
                {getEstadoTexto(producto.estado)}
              </Text>
            </View>
            
            <Text style={styles.tipo}>
              {producto.tipo === 'producto' ? 'Producto' : 'Servicio'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.stockContainer}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockLabel}>Stock:</Text>
          <Text 
            style={[
              styles.stockValue,
              producto.stock === 0 && styles.stockAgotado,
              isStockBajo() && styles.stockBajo
            ]}
          >
            {producto.stock} {producto.unidad_medida || 'uds'}
          </Text>
        </View>
        
        <View style={styles.stockMinInfo}>
          <Text style={styles.stockMinLabel}>Mínimo:</Text>
          <Text style={styles.stockMinValue}>{producto.stock_minimo} {producto.unidad_medida || 'uds'}</Text>
        </View>
        
        {producto.categoria && (
          <View style={styles.categoriaContainer}>
            <Ionicons name="pricetag-outline" size={14} color={colors.text + '80'} />
            <Text style={styles.categoriaText} numberOfLines={1}>
              {producto.categoria.nombre}
            </Text>
          </View>
        )}
      </View>
      
      {mostrarAcciones && (
        <View style={styles.accionesContainer}>
          {onUpdateStock && (
            <TouchableOpacity 
              style={styles.accionBoton}
              onPress={() => onUpdateStock(producto.id)}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          {onEdit && (
            <TouchableOpacity 
              style={styles.accionBoton}
              onPress={() => onEdit(producto.id)}
            >
              <Ionicons name="create" size={20} color={colors.info} />
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              style={styles.accionBoton}
              onPress={() => onDelete(producto.id)}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInactivo: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  placeholderImagen: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destacadoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  codigo: {
    fontSize: 12,
    color: colors.text + '80',
    marginBottom: 2,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  precioContainer: {
    marginBottom: 4,
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  precioCosto: {
    fontSize: 12,
    color: colors.text + '80',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipo: {
    fontSize: 12,
    color: colors.text + '99',
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  stockAgotado: {
    color: colors.error,
  },
  stockBajo: {
    color: colors.warning,
  },
  stockMinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockMinLabel: {
    fontSize: 12,
    color: colors.text + '80',
    marginRight: 4,
  },
  stockMinValue: {
    fontSize: 12,
    color: colors.text + '80',
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '30%',
  },
  categoriaText: {
    fontSize: 12,
    color: colors.text + '80',
    marginLeft: 4,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accionBoton: {
    padding: 6,
    marginLeft: 12,
  },
});
