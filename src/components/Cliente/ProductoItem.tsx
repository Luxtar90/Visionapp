// src/components/Cliente/ProductoItem.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
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

interface ProductoItemProps {
  item: Producto;
  onPress: (producto: Producto) => void;
}

// Función para formatear el precio
const formatPrice = (price: number | string): string => {
  if (typeof price === 'string') {
    return parseFloat(price).toFixed(2);
  }
  return price.toFixed(2);
};

const ProductoItem: React.FC<ProductoItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.productoItem}
      onPress={() => onPress(item)}
    >
      <View style={styles.productoImageContainer}>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.productoImagen} />
        ) : (
          <View style={styles.productoImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.productoPrecio}>${formatPrice(item.precio)}</Text>
        
        <View style={styles.productoStockContainer}>
          <Text style={[
            styles.productoStock,
            item.stock > 10 ? styles.stockAlto : item.stock > 0 ? styles.stockMedio : styles.stockBajo
          ]}>
            {item.stock > 0 ? `${item.stock} disp.` : 'Agotado'}
          </Text>
        </View>
      </View>
      
      {item.stock > 0 && (
        <TouchableOpacity
          style={styles.agregarButton}
          onPress={() => onPress(item)}
        >
          <Ionicons name="add-circle" size={24} color="white" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productoItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    maxWidth: '47%',
  },
  productoImageContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
  },
  productoInfo: {
    padding: 12,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  productoStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productoStock: {
    fontSize: 12,
    marginTop: 4,
  },
  stockAlto: {
    color: 'green',
  },
  stockMedio: {
    color: 'orange',
  },
  stockBajo: {
    color: 'red',
  },
  agregarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

export default ProductoItem;
