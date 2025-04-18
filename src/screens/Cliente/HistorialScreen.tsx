// src/screens/Cliente/HistorialScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface HistorialItem {
  id: string;
  fecha: string;
  tipo: 'servicio' | 'producto';
  nombre: string;
  precio: number;
  empleado?: string;
  cantidad?: number;
}

export default function HistorialScreen() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'servicios' | 'productos'>('servicios');

  useEffect(() => {
    // Simular carga de datos
    const fetchHistorial = async () => {
      try {
        // Aquí se llamaría a la API para obtener el historial del cliente
        // const servicios = await getVentasByCliente();
        // const productos = await getVentasProductosByCliente();
        
        // Datos de ejemplo
        const mockData: HistorialItem[] = [
          {
            id: '1',
            fecha: '2025-03-15',
            tipo: 'servicio',
            nombre: 'Corte de Cabello',
            precio: 20,
            empleado: 'Ana García',
          },
          {
            id: '2',
            fecha: '2025-03-15',
            tipo: 'producto',
            nombre: 'Champú Profesional',
            precio: 15,
            cantidad: 1,
          },
          {
            id: '3',
            fecha: '2025-02-20',
            tipo: 'servicio',
            nombre: 'Tratamiento Facial',
            precio: 40,
            empleado: 'Carlos Rodríguez',
          },
          {
            id: '4',
            fecha: '2025-02-20',
            tipo: 'producto',
            nombre: 'Crema Hidratante',
            precio: 25,
            cantidad: 1,
          },
          {
            id: '5',
            fecha: '2025-01-10',
            tipo: 'servicio',
            nombre: 'Manicure',
            precio: 25,
            empleado: 'María López',
          },
          {
            id: '6',
            fecha: '2025-01-10',
            tipo: 'producto',
            nombre: 'Esmalte de Uñas',
            precio: 8,
            cantidad: 2,
          },
        ];
        
        setHistorial(mockData);
      } catch (error) {
        console.error('Error fetching historial:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar el historial. Por favor intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  const filteredHistorial = historial.filter(item => {
    return activeTab === 'servicios' ? item.tipo === 'servicio' : item.tipo === 'producto';
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'servicios' && styles.activeTab]}
          onPress={() => setActiveTab('servicios')}
        >
          <Text style={[styles.tabText, activeTab === 'servicios' && styles.activeTabText]}>
            Servicios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'productos' && styles.activeTab]}
          onPress={() => setActiveTab('productos')}
        >
          <Text style={[styles.tabText, activeTab === 'productos' && styles.activeTabText]}>
            Productos
          </Text>
        </TouchableOpacity>
      </View>

      {filteredHistorial.length === 0 ? (
        <View style={styles.emptyContainer}>
          {activeTab === 'servicios' ? (
            <Ionicons name="cut-outline" size={80} color="#ccc" />
          ) : (
            <Ionicons name="pricetag-outline" size={80} color="#ccc" />
          )}
          <Text style={styles.emptyText}>
            {activeTab === 'servicios' 
              ? 'No tienes historial de servicios' 
              : 'No tienes historial de compras de productos'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistorial}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historialItem}>
              <View style={styles.historialHeader}>
                <Text style={styles.historialFecha}>{formatDate(item.fecha)}</Text>
                <Text style={styles.historialPrecio}>{formatPrice(item.precio * (item.cantidad || 1))}</Text>
              </View>
              
              <View style={styles.historialDetails}>
                <View style={styles.historialDetailRow}>
                  {item.tipo === 'servicio' ? (
                    <Ionicons name="cut-outline" size={18} color={colors.text} />
                  ) : (
                    <Ionicons name="pricetag-outline" size={18} color={colors.text} />
                  )}
                  <Text style={styles.historialNombre}>{item.nombre}</Text>
                </View>
                
                {item.tipo === 'servicio' && item.empleado && (
                  <View style={styles.historialDetailRow}>
                    <Ionicons name="person-outline" size={18} color={colors.text} />
                    <Text style={styles.historialDetailText}>{item.empleado}</Text>
                  </View>
                )}
                
                {item.tipo === 'producto' && item.cantidad && (
                  <View style={styles.historialDetailRow}>
                    <Ionicons name="calculator-outline" size={18} color={colors.text} />
                    <Text style={styles.historialDetailText}>
                      {item.cantidad} x {formatPrice(item.precio)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.text,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  historialItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historialFecha: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  historialPrecio: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  historialDetails: {
    marginBottom: 8,
  },
  historialDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historialNombre: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  historialDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
});