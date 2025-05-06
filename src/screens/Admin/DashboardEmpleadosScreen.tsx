// src/screens/Admin/DashboardEmpleadosScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Empleado, getEmpleados } from '../../api/empleados.api';
import { getPromedioValoracionesByEmpleado } from '../../api/valoraciones.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../config/constants';
import { EmpleadoCard } from '../../components/Empleados/EmpleadoCard';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';

// Extendemos la interfaz Empleado para incluir los campos adicionales de rendimiento
interface EmpleadoConRendimiento {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo?: string;
  nivel_estudio?: string;
  activo_para_reservas: boolean;
  foto_url?: string;
  tiendaId?: number | null;
  identificacion?: string;
  fecha_nacimiento?: string;
  color_asignado?: string;
  direccion_pais?: string;
  direccion_ciudad?: string;
  direccion_detalle?: string;
  tipo_contrato?: string;
  nivel_crecimiento?: string;
  fecha_inicio_contrato?: string;
  id_equipo?: number;
  tienda?: any;
  // Campos adicionales para el dashboard
  valoracion?: number;
  reservas?: number;
  ventas?: number;
  comisiones?: number;
}

export const DashboardEmpleadosScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState<EmpleadoConRendimiento[]>([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState<EmpleadoConRendimiento[]>([]);
  const [tiendaId, setTiendaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodoActual, setPeriodoActual] = useState<'dia' | 'semana' | 'mes' | 'año'>('mes');
  const [ordenarPor, setOrdenarPor] = useState<'valoracion' | 'reservas' | 'ventas'>('valoracion');
  const [ordenAscendente, setOrdenAscendente] = useState(false);

  useEffect(() => {
    const cargarTiendaSeleccionada = async () => {
      try {
        const storedTiendaId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TIENDA);
        if (storedTiendaId) {
          setTiendaId(storedTiendaId);
        }
      } catch (error) {
        console.error('Error al cargar tienda seleccionada:', error);
      }
    };

    cargarTiendaSeleccionada();
  }, []);

  useEffect(() => {
    if (tiendaId) {
      cargarEmpleados();
    }
  }, [tiendaId, periodoActual]);

  useEffect(() => {
    filtrarEmpleados();
  }, [searchQuery, empleados, ordenarPor, ordenAscendente]);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, cargar empleados desde la API
      // const data = await getEmpleados(tiendaId);
      
      // Datos de ejemplo
      const mockEmpleados: EmpleadoConRendimiento[] = [
        {
          id: '1',
          nombres: 'Cos',
          apellidos: 'Góiguez',
          email: 'cos.goiguez@ejemplo.com',
          telefono: '555-123-4567',
          cargo: 'Optometrista senior',
          activo_para_reservas: true,
          valoracion: 4.8,
          reservas: 120,
          ventas: 850000,
          comisiones: 85000
        },
        {
          id: '2',
          nombres: 'Ana',
          apellidos: 'Martínez',
          email: 'ana.martinez@ejemplo.com',
          telefono: '555-987-6543',
          cargo: 'Optometrista',
          activo_para_reservas: true,
          valoracion: 4.5,
          reservas: 95,
          ventas: 720000,
          comisiones: 72000
        },
        {
          id: '3',
          nombres: 'Juan',
          apellidos: 'Pérez',
          email: 'juan.perez@ejemplo.com',
          telefono: '555-456-7890',
          cargo: 'Vendedor',
          activo_para_reservas: false,
          valoracion: 4.2,
          reservas: 0,
          ventas: 950000,
          comisiones: 95000
        },
        {
          id: '4',
          nombres: 'María',
          apellidos: 'López',
          email: 'maria.lopez@ejemplo.com',
          telefono: '555-234-5678',
          cargo: 'Asistente',
          activo_para_reservas: true,
          valoracion: 4.7,
          reservas: 80,
          ventas: 450000,
          comisiones: 45000
        }
      ];
      
      setEmpleados(mockEmpleados);
      setEmpleadosFiltrados(mockEmpleados);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarEmpleados = () => {
    let filtrados = [...empleados];
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtrados = filtrados.filter(empleado => 
        empleado.nombres.toLowerCase().includes(query) || 
        empleado.apellidos.toLowerCase().includes(query) ||
        empleado.cargo?.toLowerCase().includes(query) ||
        empleado.email.toLowerCase().includes(query)
      );
    }
    
    // Aplicar ordenamiento
    filtrados.sort((a, b) => {
      let valorA = 0;
      let valorB = 0;
      
      switch (ordenarPor) {
        case 'valoracion':
          valorA = a.valoracion || 0;
          valorB = b.valoracion || 0;
          break;
        case 'reservas':
          valorA = a.reservas || 0;
          valorB = b.reservas || 0;
          break;
        case 'ventas':
          valorA = a.ventas || 0;
          valorB = b.ventas || 0;
          break;
      }
      
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    });
    
    setEmpleadosFiltrados(filtrados);
  };

  const toggleOrden = (campo: 'valoracion' | 'reservas' | 'ventas') => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdenAscendente(false);
    }
  };

  const renderPeriodoSelector = () => {
    return (
      <View style={styles.periodoSelector}>
        <TouchableOpacity
          style={[styles.periodoButton, periodoActual === 'dia' && styles.periodoButtonActive]}
          onPress={() => setPeriodoActual('dia')}
        >
          <Text 
            style={[
              styles.periodoButtonText, 
              periodoActual === 'dia' && styles.periodoButtonTextActive
            ]}
          >
            Día
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.periodoButton, periodoActual === 'semana' && styles.periodoButtonActive]}
          onPress={() => setPeriodoActual('semana')}
        >
          <Text 
            style={[
              styles.periodoButtonText, 
              periodoActual === 'semana' && styles.periodoButtonTextActive
            ]}
          >
            Semana
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.periodoButton, periodoActual === 'mes' && styles.periodoButtonActive]}
          onPress={() => setPeriodoActual('mes')}
        >
          <Text 
            style={[
              styles.periodoButtonText, 
              periodoActual === 'mes' && styles.periodoButtonTextActive
            ]}
          >
            Mes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.periodoButton, periodoActual === 'año' && styles.periodoButtonActive]}
          onPress={() => setPeriodoActual('año')}
        >
          <Text 
            style={[
              styles.periodoButtonText, 
              periodoActual === 'año' && styles.periodoButtonTextActive
            ]}
          >
            Año
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard de Empleados</Text>
      </View>
    );
  };

  const renderEmpleadoItem = ({ item }: { item: EmpleadoConRendimiento }) => {
    return (
      <TouchableOpacity
        style={styles.empleadoCard}
        onPress={() => navigation.navigate('EmpleadoDetalle', { empleadoId: item.id })}
      >
        <View style={styles.empleadoInfo}>
          <View style={styles.avatarContainer}>
            {item.foto_url ? (
              <Image source={{ uri: item.foto_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.nombres ? item.nombres.charAt(0) : ''}
                  {item.apellidos ? item.apellidos.charAt(0) : ''}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.empleadoDetalles}>
            <Text style={styles.empleadoNombre}>{item.nombres} {item.apellidos}</Text>
            <Text style={styles.empleadoCargo}>{item.cargo || 'Sin cargo'}</Text>
            
            <View style={styles.indicadoresRow}>
              <View style={styles.indicadorItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.indicadorValor}>{item.valoracion?.toFixed(1) || '-'}</Text>
              </View>
              
              <View style={styles.indicadorItem}>
                <Ionicons name="calendar" size={14} color={colors.primary} />
                <Text style={styles.indicadorValor}>{item.reservas || '-'}</Text>
              </View>
              
              <View style={styles.indicadorItem}>
                <Ionicons name="cash" size={14} color={colors.success} />
                <Text style={styles.indicadorValor}>
                  {item.ventas ? `$${(item.ventas / 1000).toFixed(1)}K` : '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFiltrosOrden = () => {
    return (
      <View style={styles.filtrosContainer}>
        <Text style={styles.filtrosLabel}>Ordenar por:</Text>
        
        <View style={styles.botonesOrden}>
          <TouchableOpacity
            style={[
              styles.botonOrden,
              ordenarPor === 'valoracion' && styles.botonOrdenActivo
            ]}
            onPress={() => toggleOrden('valoracion')}
          >
            <Ionicons 
              name="star" 
              size={16} 
              color={ordenarPor === 'valoracion' ? 'white' : colors.text} 
            />
            <Text 
              style={[
                styles.botonOrdenTexto,
                ordenarPor === 'valoracion' && styles.botonOrdenTextoActivo
              ]}
            >
              Valoración
            </Text>
            {ordenarPor === 'valoracion' && (
              <Ionicons 
                name={ordenAscendente ? "arrow-up" : "arrow-down"} 
                size={16} 
                color="white" 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.botonOrden,
              ordenarPor === 'reservas' && styles.botonOrdenActivo
            ]}
            onPress={() => toggleOrden('reservas')}
          >
            <Ionicons 
              name="calendar" 
              size={16} 
              color={ordenarPor === 'reservas' ? 'white' : colors.text} 
            />
            <Text 
              style={[
                styles.botonOrdenTexto,
                ordenarPor === 'reservas' && styles.botonOrdenTextoActivo
              ]}
            >
              Reservas
            </Text>
            {ordenarPor === 'reservas' && (
              <Ionicons 
                name={ordenAscendente ? "arrow-up" : "arrow-down"} 
                size={16} 
                color="white" 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.botonOrden,
              ordenarPor === 'ventas' && styles.botonOrdenActivo
            ]}
            onPress={() => toggleOrden('ventas')}
          >
            <Ionicons 
              name="cash" 
              size={16} 
              color={ordenarPor === 'ventas' ? 'white' : colors.text} 
            />
            <Text 
              style={[
                styles.botonOrdenTexto,
                ordenarPor === 'ventas' && styles.botonOrdenTextoActivo
              ]}
            >
              Ventas
            </Text>
            {ordenarPor === 'ventas' && (
              <Ionicons 
                name={ordenAscendente ? "arrow-up" : "arrow-down"} 
                size={16} 
                color="white" 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar empleado..."
      />
      
      {renderPeriodoSelector()}
      
      {renderFiltrosOrden()}
      
      {empleadosFiltrados.length === 0 ? (
        <EmptyState
          icon="people"
          message="No se encontraron empleados"
          actionLabel="Actualizar"
          onAction={cargarEmpleados}
        />
      ) : (
        <FlatList
          data={empleadosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderEmpleadoItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={loading}
          onRefresh={cargarEmpleados}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  periodoSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  periodoButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodoButtonActive: {
    backgroundColor: colors.primary + '15',
  },
  periodoButtonText: {
    fontSize: 14,
    color: colors.text + 'AA',
  },
  periodoButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  filtrosContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  filtrosLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  botonesOrden: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonOrden: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.border + '30',
  },
  botonOrdenActivo: {
    backgroundColor: colors.primary,
  },
  botonOrdenTexto: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
    marginRight: 4,
  },
  botonOrdenTextoActivo: {
    color: 'white',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  empleadoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  empleadoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  empleadoDetalles: {
    flex: 1,
  },
  empleadoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  empleadoCargo: {
    fontSize: 14,
    color: colors.text + 'AA',
    marginBottom: 8,
  },
  indicadoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  indicadorValor: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
});
