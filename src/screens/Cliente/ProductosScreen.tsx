// src/screens/Cliente/ProductosScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { colors } from '../../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Componentes modulares
import { 
  ProductoItem, 
  CategoriaFilter, 
  ProductoDetalleModal, 
  SearchBar,
  EmptyState
} from '../../components/Cliente';

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

export default function ProductosScreen() {
  const navigation = useNavigation();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  
  // API URL base
  const baseURL = 'http://10.0.2.2:3001';

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProductos();
  }, []);

  // Función para cargar productos
  const fetchProductos = async () => {
    try {
      setLoading(true);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.error('[ProductosScreen] No se encontró token de autenticación');
        Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      try {
        // Realizar la solicitud con el token de autenticación
        const response = await axios.get(`${baseURL}/productos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log('[ProductosScreen] Respuesta de la API:', response.data);
        
        // Verificar la estructura de la respuesta y adaptarla según sea necesario
        let productosData = [];
        
        if (Array.isArray(response.data)) {
          productosData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Si la respuesta es un objeto, intentamos extraer los datos
          if (Array.isArray(response.data.productos)) {
            productosData = response.data.productos;
          } else if (Array.isArray(response.data.data)) {
            productosData = response.data.data;
          } else if (Array.isArray(response.data.results)) {
            productosData = response.data.results;
          } else {
            // Si no encontramos un array, convertimos las propiedades del objeto en un array
            productosData = Object.values(response.data);
          }
        }
        
        // Verificar si productosData es un array
        if (!Array.isArray(productosData)) {
          console.error('[ProductosScreen] Los datos de productos no son un array:', productosData);
          throw new Error('Formato de respuesta no válido');
        }
        
        // Extraer categorías únicas
        const categoriasUnicas = [...new Set(productosData
          .filter(p => p && p.categoria)
          .map(p => p.categoria))];
        
        setCategorias(categoriasUnicas);
        setProductos(productosData);
      } catch (error) {
        console.error('[ProductosScreen] Error al obtener productos de la API:', error);
        
        // Datos de ejemplo en caso de error
        const productosEjemplo = [
          {
            id: 1,
            nombre: 'Shampoo Profesional',
            descripcion: 'Shampoo para cabello dañado con keratina',
            precio: 15.99,
            stock: 20,
            categoria: 'Cuidado del cabello',
            imagen: 'https://via.placeholder.com/150',
            tiendaId: 1
          },
          {
            id: 2,
            nombre: 'Acondicionador Hidratante',
            descripcion: 'Acondicionador con aceite de argán',
            precio: 12.99,
            stock: 15,
            categoria: 'Cuidado del cabello',
            imagen: 'https://via.placeholder.com/150',
            tiendaId: 1
          },
          {
            id: 3,
            nombre: 'Crema Facial',
            descripcion: 'Crema hidratante para todo tipo de piel',
            precio: 24.99,
            stock: 10,
            categoria: 'Cuidado facial',
            imagen: 'https://via.placeholder.com/150',
            tiendaId: 1
          },
          {
            id: 4,
            nombre: 'Máscara Capilar',
            descripcion: 'Tratamiento intensivo para cabello seco',
            precio: 18.99,
            stock: 8,
            categoria: 'Cuidado del cabello',
            imagen: 'https://via.placeholder.com/150',
            tiendaId: 1
          },
          {
            id: 5,
            nombre: 'Tinte para Cabello',
            descripcion: 'Color permanente sin amoníaco',
            precio: 9.99,
            stock: 0,
            categoria: 'Coloración',
            imagen: 'https://via.placeholder.com/150',
            tiendaId: 1
          },
          {
            id: 6,
            nombre: 'Gel Fijador',
            descripcion: 'Fijación extra fuerte para peinados duraderos',
            precio: 7.99,
            stock: 25,
            categoria: 'Styling',
            imagen: 'https://via.placeholder.com/150',
            tiendaId: 1
          },
        ];
        
        // Extraer categorías únicas de los datos de ejemplo
        const categoriasUnicas = [...new Set(productosEjemplo.map(p => p.categoria))];
        
        setCategorias(categoriasUnicas);
        setProductos(productosEjemplo);
        
        Alert.alert(
          'Información',
          'No se pudieron cargar los productos desde el servidor. Se muestran datos de ejemplo.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      console.error('[ProductosScreen] Error general:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filtrar productos por texto de búsqueda y categoría
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                          producto.descripcion.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategoria = categoriaSeleccionada === null || producto.categoria === categoriaSeleccionada;
    
    return matchesSearch && matchesCategoria;
  });

  // Mostrar detalle de producto
  const mostrarDetalleProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.producto.id === producto.id);
    
    if (productoExistente) {
      // Actualizar cantidad si ya existe
      const nuevaCantidad = productoExistente.cantidad + cantidad;
      
      // Verificar que no exceda el stock disponible
      if (nuevaCantidad > producto.stock) {
        Alert.alert('Aviso', 'No hay suficiente stock disponible');
        return;
      }
      
      const nuevoCarrito = carrito.map(item => 
        item.producto.id === producto.id 
          ? { ...item, cantidad: nuevaCantidad } 
          : item
      );
      
      setCarrito(nuevoCarrito);
    } else {
      // Agregar nuevo producto al carrito
      setCarrito([...carrito, { producto, cantidad }]);
    }
    
    Alert.alert('Éxito', 'Producto agregado al carrito');
    
    // Guardar carrito en AsyncStorage
    AsyncStorage.setItem('@carrito', JSON.stringify([...carrito, { producto, cantidad }]));
  };

  // Renderizar botón del carrito
  const renderCarritoButton = () => {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    return (
      <TouchableOpacity
        style={styles.carritoButton}
        onPress={() => navigation.navigate('Carrito' as never)}
      >
        <Ionicons name="cart-outline" size={24} color={colors.text} />
        {totalItems > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos</Text>
        {renderCarritoButton()}
      </View>
      
      <SearchBar 
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Buscar productos..."
      />
      
      <CategoriaFilter 
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onSelectCategoria={setCategoriaSeleccionada}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProductos}
          renderItem={({ item }) => (
            <ProductoItem 
              item={item} 
              onPress={mostrarDetalleProducto} 
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productosList}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchProductos();
              }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState 
              icon="basket-outline"
              title="No se encontraron productos"
              subtitle="Intenta con otra búsqueda o categoría"
            />
          }
        />
      )}
      
      <ProductoDetalleModal 
        visible={modalVisible}
        producto={productoSeleccionado}
        onClose={() => setModalVisible(false)}
        onAddToCart={agregarAlCarrito}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  productosList: {
    padding: 8,
  },
  carritoButton: {
    position: 'relative',
    padding: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.notification,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
