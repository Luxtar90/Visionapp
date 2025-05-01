// src/components/Cliente/ProductoDetalleModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';
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

interface ProductoDetalleModalProps {
  visible: boolean;
  producto: Producto | null;
  onClose: () => void;
  onAddToCart: (producto: Producto, cantidad: number) => void;
}

// Función para formatear el precio
const formatPrice = (price: number | string): string => {
  if (typeof price === 'string') {
    return parseFloat(price).toFixed(2);
  }
  return price.toFixed(2);
};

const ProductoDetalleModal: React.FC<ProductoDetalleModalProps> = ({
  visible,
  producto,
  onClose,
  onAddToCart
}) => {
  const [cantidad, setCantidad] = useState(1);

  // Reiniciar la cantidad cuando se abre un nuevo producto
  React.useEffect(() => {
    if (visible) {
      setCantidad(1);
    }
  }, [visible]);

  if (!producto) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.productoImageContainer}>
              {producto.imagen ? (
                <Image source={{ uri: producto.imagen }} style={styles.productoImagen} />
              ) : (
                <View style={styles.productoImagePlaceholder}>
                  <Ionicons name="image-outline" size={60} color="#ccc" />
                </View>
              )}
            </View>
            
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre}>{producto.nombre}</Text>
              <Text style={styles.productoCategoria}>{producto.categoria}</Text>
              <Text style={styles.productoPrecio}>${formatPrice(producto.precio)}</Text>
              
              <View style={styles.stockContainer}>
                <Text style={[
                  styles.stockText,
                  producto.stock > 10 ? styles.stockAlto : 
                  producto.stock > 0 ? styles.stockMedio : 
                  styles.stockBajo
                ]}>
                  {producto.stock > 0 
                    ? `${producto.stock} unidades disponibles` 
                    : 'Producto agotado'}
                </Text>
              </View>
              
              <Text style={styles.descripcionLabel}>Descripción:</Text>
              <Text style={styles.productoDescripcion}>{producto.descripcion}</Text>
              
              {producto.stock > 0 && (
                <View style={styles.cantidadContainer}>
                  <Text style={styles.cantidadLabel}>Cantidad:</Text>
                  
                  <View style={styles.cantidadControls}>
                    <TouchableOpacity
                      style={styles.cantidadButton}
                      onPress={() => setCantidad(prev => Math.max(1, prev - 1))}
                    >
                      <Ionicons name="remove" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    
                    <Text style={styles.cantidadText}>{cantidad}</Text>
                    
                    <TouchableOpacity
                      style={styles.cantidadButton}
                      onPress={() => setCantidad(prev => Math.min(producto.stock, prev + 1))}
                      disabled={cantidad >= producto.stock}
                    >
                      <Ionicons 
                        name="add" 
                        size={20} 
                        color={cantidad >= producto.stock ? '#ccc' : colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
          
          <View style={styles.footerContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                ${formatPrice(producto.precio * cantidad)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                producto.stock <= 0 && styles.disabledButton
              ]}
              onPress={() => {
                onAddToCart(producto, cantidad);
                onClose();
              }}
              disabled={producto.stock <= 0}
            >
              <Ionicons name="cart-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.addToCartText}>
                {producto.stock > 0 ? 'Agregar al carrito' : 'No disponible'}
              </Text>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  productoImageContainer: {
    width: '100%',
    height: 250,
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
    padding: 20,
  },
  productoNombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productoCategoria: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  productoPrecio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  stockContainer: {
    marginBottom: 16,
  },
  stockText: {
    fontSize: 14,
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
  descripcionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  productoDescripcion: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 20,
  },
  cantidadContainer: {
    marginTop: 10,
  },
  cantidadLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ProductoDetalleModal;
