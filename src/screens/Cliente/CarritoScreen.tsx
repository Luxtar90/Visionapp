// src/screens/Cliente/CarritoScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { registrarPuntosProducto, calcularPuntosProducto } from '../../api/puntos.api';

// Componentes modulares
import { 
  CarritoItem, 
  CarritoResumen, 
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

export default function CarritoScreen() {
  const navigation = useNavigation();
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  
  // API URL base
  const baseUrl = 'http://10.0.2.2:3001';

  // Cargar carrito al iniciar
  useEffect(() => {
    cargarCarrito();
    cargarUsuarioInfo();
  }, []);

  // Función para cargar el carrito desde AsyncStorage
  const cargarCarrito = async () => {
    try {
      const carritoGuardado = await AsyncStorage.getItem('@carrito');
      
      if (carritoGuardado) {
        setCarrito(JSON.parse(carritoGuardado));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('[CarritoScreen] Error al cargar carrito:', error);
      setLoading(false);
    }
  };

  // Función para cargar información del usuario
  const cargarUsuarioInfo = async () => {
    try {
      // Intentar obtener el ID del usuario de varias fuentes posibles
      const userIdStr = await AsyncStorage.getItem('@userId');
      const tiendaIdStr = await AsyncStorage.getItem('@tiendaId');
      const userData = await AsyncStorage.getItem('@user');
      
      let userId = null;
      
      // Primero intentar con @userId
      if (userIdStr) {
        userId = parseInt(userIdStr);
        setUserId(userId);
        console.log('[CarritoScreen] ID de usuario obtenido de @userId:', userId);
      }
      // Si no está disponible, intentar con @user
      else if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || (user.cliente && user.cliente.id) || user.cliente_id || null;
        
        if (userId) {
          userId = Number(userId);
          setUserId(userId);
          console.log('[CarritoScreen] ID de usuario obtenido de @user:', userId);
          
          // Guardar para futuras referencias
          await AsyncStorage.setItem('@userId', userId.toString());
        }
      }
      
      // Obtener ID de tienda
      if (tiendaIdStr) {
        const tiendaId = parseInt(tiendaIdStr);
        setTiendaId(tiendaId);
        console.log('[CarritoScreen] ID de tienda obtenido:', tiendaId);
      } else if (userData) {
        // Intentar obtener tiendaId del objeto user
        const user = JSON.parse(userData);
        const tiendaId = user.tiendaId || (user.cliente && user.cliente.tiendaId) || null;
        
        if (tiendaId) {
          setTiendaId(Number(tiendaId));
          console.log('[CarritoScreen] ID de tienda obtenido de @user:', tiendaId);
          
          // Guardar para futuras referencias
          await AsyncStorage.setItem('@tiendaId', tiendaId.toString());
        }
      }
      
      if (!userId) {
        console.warn('[CarritoScreen] No se pudo obtener el ID del usuario');
      }
    } catch (error) {
      console.error('[CarritoScreen] Error al cargar info de usuario:', error);
    }
  };

  // Función para actualizar la cantidad de un producto
  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      // Si la cantidad es 0 o menos, eliminar el producto
      const nuevoCarrito = carrito.filter(item => item.producto.id !== productoId);
      setCarrito(nuevoCarrito);
      AsyncStorage.setItem('@carrito', JSON.stringify(nuevoCarrito));
    } else {
      // Verificar stock disponible
      const item = carrito.find(item => item.producto.id === productoId);
      
      if (item && nuevaCantidad > item.producto.stock) {
        Alert.alert('Aviso', 'No hay suficiente stock disponible');
        return;
      }
      
      // Actualizar cantidad
      const nuevoCarrito = carrito.map(item => 
        item.producto.id === productoId 
          ? { ...item, cantidad: nuevaCantidad } 
          : item
      );
      
      setCarrito(nuevoCarrito);
      AsyncStorage.setItem('@carrito', JSON.stringify(nuevoCarrito));
    }
  };

  // Función para eliminar un producto del carrito
  const eliminarProducto = (productoId: number) => {
    const nuevoCarrito = carrito.filter(item => item.producto.id !== productoId);
    setCarrito(nuevoCarrito);
    AsyncStorage.setItem('@carrito', JSON.stringify(nuevoCarrito));
  };

  // Procesar la compra
  const procesarCompra = async () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agregue productos al carrito para continuar');
      return;
    }

    try {
      setProcesando(true);
      
      // Verificar que tenemos el ID del usuario y de la tienda
      if (!userId) {
        Alert.alert('Error', 'No se pudo identificar al usuario');
        setProcesando(false);
        return;
      }
      
      // Usar tienda por defecto si no hay una seleccionada
      const tiendaIdToUse = tiendaId || 1;
      
      // Obtener el token para la autenticación
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación');
        setProcesando(false);
        return;
      }
      
      // Preparar los datos de la venta
      const { total } = calcularTotal();
      
      // Crear la venta
      try {
        // Crear un ID de venta único basado en la fecha actual
        const ventaId = Date.now();
        
        // Registrar la venta en el sistema
        // Aquí deberías tener una llamada a tu API para crear la venta
        // Por ahora, simulamos una venta exitosa
        console.log('[CarritoScreen] Procesando venta con ID:', ventaId);
        
        // Obtener el ID del cliente actualizado directamente desde AsyncStorage
        // Esto asegura que estamos usando el ID del cliente actual
        const userData = await AsyncStorage.getItem('@user');
        let clienteId = userId;
        
        if (userData) {
          const user = JSON.parse(userData);
          clienteId = Number(user.id || user.cliente_id || (user.cliente && user.cliente.id) || userId);
          console.log('[CarritoScreen] ID de cliente obtenido para puntos:', clienteId);
        }
        
        // Limpiar el carrito después de la compra
        await AsyncStorage.removeItem('@carrito');
        setCarrito([]);

        try {
          // Calcular los puntos que ganará el cliente (1 punto por cada $10)
          const puntosGanados = calcularPuntosProducto(total);
          
          console.log(`[CarritoScreen] Calculando puntos para compra de $${total}: ${puntosGanados} puntos`);
          
          // Registrar los puntos por la compra de productos
          if (puntosGanados > 0) {
            // Preparar los parámetros para registrar puntos
            const puntosParams = {
              clienteId: clienteId, // Usar el ID del cliente actualizado
              tiendaId: tiendaIdToUse,
              ventaId: ventaId,
              precioTotal: total,
              // Opcionalmente puedes personalizar los puntos
              // puntosPersonalizados: puntosGanados
            };
            
            console.log('[CarritoScreen] Registrando puntos con parámetros:', puntosParams);
            
            const puntosRegistrados = await registrarPuntosProducto(puntosParams);
            
            console.log('[CarritoScreen] Puntos registrados:', puntosRegistrados);
            
            // Mostrar mensaje de éxito con información sobre los puntos
            Alert.alert(
              'Compra Exitosa',
              `Su compra ha sido procesada correctamente.\n\n¡Has ganado ${puntosGanados} puntos por esta compra! Revisa tu historial de puntos para más detalles.`,
              [
                {
                  text: 'Ver mis puntos',
                  onPress: () => navigation.navigate('Puntos' as never)
                },
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          } else {
            // Mostrar mensaje de éxito sin mencionar puntos
            Alert.alert(
              'Compra Exitosa',
              'Su compra ha sido procesada correctamente.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        } catch (puntosError) {
          console.error('[CarritoScreen] Error al actualizar puntos:', puntosError);
          
          // Aún así consideramos la compra como exitosa
          Alert.alert(
            'Compra Exitosa',
            'Su compra ha sido procesada correctamente, pero hubo un problema al actualizar sus puntos.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (ventaError) {
        console.error('[CarritoScreen] Error al crear venta:', ventaError);
        Alert.alert('Error', 'No se pudo procesar la compra. Por favor intente nuevamente.');
      }
    } catch (error) {
      console.error('[CarritoScreen] Error general al procesar compra:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la compra');
    } finally {
      setProcesando(false);
      setConfirmModalVisible(false);
    }
  };

  // Calcular subtotal, impuestos y total
  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, item) => 
      total + (parseFloat(item.producto.precio) * item.cantidad), 0);
    
    const impuestos = subtotal * 0.16; // 16% de impuestos
    const total = subtotal + impuestos;
    
    return { subtotal, impuestos, total };
  };

  // Formatear precio para mostrar
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      return parseFloat(price).toFixed(2);
    }
    return price.toFixed(2);
  };

  // Renderizar header con botón de regreso
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Mi Carrito</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  // Calcular valores para el resumen
  const { subtotal, impuestos, total } = calcularTotal();

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando carrito...</Text>
        </View>
      ) : carrito.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Tu carrito está vacío"
          subtitle="Agrega productos desde la tienda para comenzar a comprar"
          buttonText="Ir a la tienda"
          onButtonPress={() => navigation.navigate('Productos' as never)}
        />
      ) : (
        <>
          <FlatList
            data={carrito}
            renderItem={({ item }) => (
              <CarritoItem
                item={item}
                onUpdateCantidad={actualizarCantidad}
                onRemoveItem={eliminarProducto}
              />
            )}
            keyExtractor={(item) => item.producto.id.toString()}
            contentContainerStyle={styles.carritoList}
          />
          
          <CarritoResumen
            subtotal={subtotal}
            impuestos={impuestos}
            total={total}
            onComprar={() => {
              Alert.alert(
                'Confirmar Compra',
                '¿Está seguro que desea finalizar la compra?',
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel'
                  },
                  {
                    text: 'Confirmar',
                    onPress: procesarCompra
                  }
                ]
              );
            }}
            disabled={procesando}
          />
        </>
      )}
      
      {procesando && (
        <View style={styles.procesandoOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.procesandoText}>Procesando compra...</Text>
        </View>
      )}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
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
  carritoList: {
    padding: 16,
  },
  procesandoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  procesandoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
});
