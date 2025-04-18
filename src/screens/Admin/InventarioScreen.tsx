// src/screens/Admin/InventarioScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  Modal,
  SafeAreaView,
  RefreshControl,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FiltrosProductos } from '../../components/Inventario/FiltrosProductos';
import { ProductoCard } from '../../components/Inventario/ProductoCard';
import { ProductoForm } from '../../components/Inventario/ProductoForm';
import { MovimientoForm } from '../../components/Inventario/MovimientoForm';
import { MovimientoCard } from '../../components/Inventario/MovimientoCard';
import { EstadisticasInventario } from '../../components/Inventario/EstadisticasInventario';
import { StatusMessage } from '../../components/common/StatusMessage';
import { ActionButton } from '../../components/common/ActionButton';
import { 
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  getCategorias,
  getProveedores,
  getEstadisticasInventario,
  getProductosBajoStock,
  registrarMovimiento,
  getMovimientosInventario
} from '../../api/productos.api';
import { 
  Producto, 
  Categoria,
  Proveedor,
  MovimientoInventario,
  FiltrosProductos as FiltrosProductosType
} from '../../interfaces/Producto';
import { useAuth } from '../../hooks/useAuth';
import { useTienda } from '../../hooks/useTienda';
import { colors } from '../../theme/colors';

export const InventarioScreen: React.FC = () => {
  const { user } = useAuth();
  const { tiendaActual } = useTienda();
  
  // Estado para productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filtros, setFiltros] = useState<FiltrosProductosType>({});
  
  // Estado para movimientos
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<MovimientoInventario | null>(null);
  
  // Estado para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total_productos: 0,
    valor_inventario: 0,
    productos_agotados: 0,
    productos_bajo_stock: 0,
    movimientos_recientes: 0,
  });
  
  // Estado para UI
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  const [showProductoDetail, setShowProductoDetail] = useState(false);
  const [showMovimientoDetail, setShowMovimientoDetail] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'productos' | 'movimientos'>('productos');
  const [mostrarProductosBajoStock, setMostrarProductosBajoStock] = useState(false);
  
  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    if (!tiendaActual?.id) return;
    
    setIsLoading(true);
    try {
      // Cargar productos con filtros aplicados
      const productosData = await getProductos(tiendaActual.id, filtros);
      setProductos(productosData);
      
      // Cargar categorías y proveedores para los formularios
      const [categoriasData, proveedoresData, estadisticasData] = await Promise.all([
        getCategorias(tiendaActual.id),
        getProveedores(tiendaActual.id),
        getEstadisticasInventario(tiendaActual.id)
      ]);
      
      setCategorias(categoriasData);
      setProveedores(proveedoresData);
      setEstadisticas(estadisticasData);
      
      // Si estamos en la pestaña de movimientos, cargar movimientos
      if (activeTab === 'movimientos') {
        const movimientosData = await getMovimientosInventario(tiendaActual.id);
        setMovimientos(movimientosData);
      }
    } catch (error) {
      console.error('Error al cargar datos de inventario:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los datos. Intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [tiendaActual?.id, filtros, activeTab]);

  // Cargar datos cuando cambia la tienda o los filtros
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Recargar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosProductosType) => {
    setFiltros(nuevosFiltros);
  };

  const handleAplicarFiltros = () => {
    cargarDatos();
  };

  const handleCrearProducto = () => {
    setProductoSeleccionado(null);
    setShowProductoForm(true);
  };

  const handleEditarProducto = async (id: string) => {
    try {
      const producto = await getProductoById(id);
      setProductoSeleccionado(producto);
      setShowProductoForm(true);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al obtener el producto. Intente nuevamente.'
      });
    }
  };

  const handleProductoPress = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setShowProductoDetail(true);
  };

  const handleMovimientoPress = (movimiento: MovimientoInventario) => {
    setMovimientoSeleccionado(movimiento);
    setShowMovimientoDetail(true);
  };

  const handleUpdateStock = (id: string) => {
    const producto = productos.find(p => p.id === id);
    if (producto) {
      setProductoSeleccionado(producto);
      setShowMovimientoForm(true);
    }
  };

  const handleEliminarProducto = async (id: string) => {
    try {
      await deleteProducto(id);
      setStatusMessage({
        type: 'success',
        message: 'Producto eliminado correctamente'
      });
      if (productoSeleccionado?.id === id) {
        setShowProductoDetail(false);
      }
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al eliminar el producto. Intente nuevamente.'
      });
    }
  };

  const handleSubmitProductoForm = async (data: Partial<Producto>) => {
    setFormLoading(true);
    try {
      if (productoSeleccionado) {
        // Actualizar producto existente
        await updateProducto(productoSeleccionado.id, data);
        setStatusMessage({
          type: 'success',
          message: 'Producto actualizado correctamente'
        });
      } else {
        // Crear nuevo producto
        if (tiendaActual?.id) {
          const nuevoProducto = {
            ...data,
            tienda_id: tiendaActual.id,
          };
          await createProducto(nuevoProducto);
          setStatusMessage({
            type: 'success',
            message: 'Producto creado correctamente'
          });
        }
      }
      setShowProductoForm(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al guardar el producto. Intente nuevamente.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitMovimientoForm = async (data: Partial<MovimientoInventario>) => {
    setFormLoading(true);
    try {
      await registrarMovimiento(data);
      setStatusMessage({
        type: 'success',
        message: 'Movimiento registrado correctamente'
      });
      setShowMovimientoForm(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al registrar el movimiento. Intente nuevamente.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerProductosBajoStock = async () => {
    if (!tiendaActual?.id) return;
    
    setIsLoading(true);
    try {
      const productosBajoStock = await getProductosBajoStock(tiendaActual.id);
      setProductos(productosBajoStock);
      setMostrarProductosBajoStock(true);
      setActiveTab('productos');
    } catch (error) {
      console.error('Error al cargar productos con stock bajo:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los productos. Intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFiltros = () => {
    setFiltros({});
    setMostrarProductosBajoStock(false);
    cargarDatos();
  };

  const renderProductosList = () => {
    return (
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductoCard
            producto={item}
            onPress={handleProductoPress}
            onEdit={handleEditarProducto}
            onDelete={handleEliminarProducto}
            onUpdateStock={handleUpdateStock}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.text + '40'} />
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
            {!isLoading && (
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.refreshText}>Actualizar</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  };

  const renderMovimientosList = () => {
    return (
      <FlatList
        data={movimientos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MovimientoCard
            movimiento={item}
            onPress={handleMovimientoPress}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={48} color={colors.text + '40'} />
            <Text style={styles.emptyText}>No hay movimientos disponibles</Text>
            {!isLoading && (
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.refreshText}>Actualizar</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  };

  // Renderizado de modales y formularios
  const renderProductoFormModal = () => {
    return (
      <Modal
        visible={showProductoForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductoForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowProductoForm(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ProductoForm
              producto={productoSeleccionado || undefined}
              categorias={categorias}
              proveedores={proveedores}
              onSubmit={handleSubmitProductoForm}
              onCancel={() => setShowProductoForm(false)}
              isLoading={formLoading}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderMovimientoFormModal = () => {
    return (
      <Modal
        visible={showMovimientoForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMovimientoForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Movimiento</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMovimientoForm(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {user && tiendaActual && (
              <MovimientoForm
                producto={productoSeleccionado || undefined}
                onSubmit={handleSubmitMovimientoForm}
                onCancel={() => setShowMovimientoForm(false)}
                isLoading={formLoading}
                tiendaId={tiendaActual.id}
                usuarioId={user.id}
                usuarioNombre={`${user.nombre} ${user.apellido}`}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {statusMessage && (
        <StatusMessage
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventario</Text>
        <View style={styles.headerActions}>
          {activeTab === 'productos' && (
            <ActionButton
              label="Nuevo Producto"
              onPress={handleCrearProducto}
              icon="add-circle"
            />
          )}
          {activeTab === 'movimientos' && productoSeleccionado && (
            <ActionButton
              label="Registrar Movimiento"
              onPress={() => setShowMovimientoForm(true)}
              icon="swap-horizontal"
            />
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <EstadisticasInventario 
          estadisticas={estadisticas}
          onVerProductosBajoStock={handleVerProductosBajoStock}
          onVerProductosAgotados={() => {}}
          onVerMovimientos={() => setActiveTab('movimientos')}
        />
        
        {mostrarProductosBajoStock && (
          <View style={styles.filtroActivoContainer}>
            <Text style={styles.filtroActivoText}>
              Mostrando productos con stock bajo
            </Text>
            <TouchableOpacity onPress={handleResetFiltros}>
              <Ionicons name="close-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'productos' && (
          <FiltrosProductos
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            onAplicarFiltros={handleAplicarFiltros}
            categorias={categorias}
            proveedores={proveedores}
          />
        )}
      </ScrollView>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'productos' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('productos')}
        >
          <Ionicons 
            name="cube" 
            size={20} 
            color={activeTab === 'productos' ? colors.primary : colors.text + '80'} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'productos' && styles.activeTabText
            ]}
          >
            Productos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'movimientos' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('movimientos')}
        >
          <Ionicons 
            name="swap-horizontal" 
            size={20} 
            color={activeTab === 'movimientos' ? colors.primary : colors.text + '80'} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'movimientos' && styles.activeTabText
            ]}
          >
            Movimientos
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.listWrapper}>
        {activeTab === 'productos' ? renderProductosList() : renderMovimientosList()}
      </View>
      
      {renderProductoFormModal()}
      {renderMovimientoFormModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 0,
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filtroActivoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '20',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  filtroActivoText: {
    color: colors.primary,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text + '80',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text + '80',
    marginTop: 12,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
  },
  refreshText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 24,
    maxHeight: '90%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
});
