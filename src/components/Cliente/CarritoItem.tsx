// src/components/Cliente/CarritoItem.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: any;
  stock: number;
  categoria: string;
  imagen?: string;
  tiendaId: number;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface CarritoItemProps {
  item: CarritoItem;
  onUpdateCantidad: (productoId: number, cantidad: number) => void;
  onRemoveItem: (productoId: number) => void;
}

// Función para formatear el precio
const formatPrice = (price: number | string): string => {
  if (typeof price === 'string') {
    return parseFloat(price).toFixed(2);
  }
  return price.toFixed(2);
};

const CarritoItemComponent: React.FC<CarritoItemProps> = ({ 
  item, 
  onUpdateCantidad, 
  onRemoveItem 
}) => {
  const handleRemove = () => {
    Alert.alert(
      'Eliminar producto',
      '¿Está seguro que desea eliminar este producto del carrito?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          onPress: () => onRemoveItem(item.producto.id),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.carritoItem}>
      <View style={styles.productoImageContainer}>
        {item.producto.imagen ? (
          <Image source={{ uri: item.producto.imagen }} style={styles.productoImagen} />
        ) : (
          <View style={styles.productoImagePlaceholder}>
            <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={1}>{item.producto.nombre}</Text>
        <Text style={styles.productoPrecio}>${formatPrice(item.producto.precio)}</Text>
        
        <View style={styles.cantidadContainer}>
          <TouchableOpacity
            style={styles.cantidadButton}
            onPress={() => onUpdateCantidad(item.producto.id, item.cantidad - 1)}
          >
            <Ionicons name="remove" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.cantidadText}>{item.cantidad}</Text>
          
          <TouchableOpacity
            style={styles.cantidadButton}
            onPress={() => onUpdateCantidad(item.producto.id, item.cantidad + 1)}
            disabled={item.cantidad >= item.producto.stock}
          >
            <Ionicons name="add" size={20} color={item.cantidad >= item.producto.stock ? '#ccc' : colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          ${formatPrice(item.producto.precio * item.cantidad)}
        </Text>
        
        <TouchableOpacity
          style={styles.eliminarButton}
          onPress={handleRemove}
        >
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carritoItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productoImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  productoImagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productoImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  productoInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 14,
    color: '#666',
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cantidadButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
    width: 70,
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  eliminarButton: {
    padding: 4,
    marginTop: 8,
  },
});

export default CarritoItemComponent;
