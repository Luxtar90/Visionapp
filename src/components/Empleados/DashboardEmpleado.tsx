// src/components/Empleados/DashboardEmpleado.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getPromedioValoracionesByEmpleado } from '../../api/valoraciones.api';

interface DashboardEmpleadoProps {
  empleadoId: string;
  nombre: string;
}

interface IndicadorData {
  valor: number | string;
  porcentaje?: number;
  tendencia?: 'up' | 'down' | 'stable';
  comparacion?: string;
}

export const DashboardEmpleado = ({ 
  empleadoId,
  nombre
}: DashboardEmpleadoProps) => {
  const [loading, setLoading] = useState(true);
  const [periodoActual, setPeriodoActual] = useState<'dia' | 'semana' | 'mes' | 'año'>('dia');
  
  // Datos de los indicadores
  const [valoraciones, setValoraciones] = useState<IndicadorData>({ valor: 0 });
  const [reservas, setReservas] = useState<IndicadorData>({ valor: 0 });
  const [ventas, setVentas] = useState<IndicadorData>({ valor: 0 });
  const [comisiones, setComisiones] = useState<IndicadorData>({ valor: 0 });
  const [servicios, setServicios] = useState<IndicadorData>({ valor: 0 });
  const [clientes, setClientes] = useState<IndicadorData>({ valor: 0 });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se cargarían los datos desde la API
      // Por ahora, usamos datos de ejemplo
      
      // Simulamos una carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo según el periodo seleccionado
      let datosEjemplo;
      
      switch (periodoActual) {
        case 'dia':
          datosEjemplo = {
            valoraciones: { valor: 4.8, porcentaje: 5, tendencia: 'up' as const, comparacion: 'que ayer' },
            reservas: { valor: 6, porcentaje: -10, tendencia: 'down' as const, comparacion: 'que ayer' },
            ventas: { valor: 45000, porcentaje: 8, tendencia: 'up' as const, comparacion: 'que ayer' },
            comisiones: { valor: 4500, porcentaje: 8, tendencia: 'up' as const, comparacion: 'que ayer' },
            servicios: { valor: 6, porcentaje: 0, tendencia: 'stable' as const, comparacion: 'que ayer' },
            clientes: { valor: 5, porcentaje: 25, tendencia: 'up' as const, comparacion: 'que ayer' }
          };
          break;
        case 'semana':
          datosEjemplo = {
            valoraciones: { valor: 4.6, porcentaje: 2, tendencia: 'up' as const, comparacion: 'que la semana pasada' },
            reservas: { valor: 28, porcentaje: 12, tendencia: 'up' as const, comparacion: 'que la semana pasada' },
            ventas: { valor: 210000, porcentaje: 15, tendencia: 'up' as const, comparacion: 'que la semana pasada' },
            comisiones: { valor: 21000, porcentaje: 15, tendencia: 'up' as const, comparacion: 'que la semana pasada' },
            servicios: { valor: 8, porcentaje: 33, tendencia: 'up' as const, comparacion: 'que la semana pasada' },
            clientes: { valor: 22, porcentaje: 10, tendencia: 'up' as const, comparacion: 'que la semana pasada' }
          };
          break;
        case 'año':
          datosEjemplo = {
            valoraciones: { valor: 4.7, porcentaje: 12, tendencia: 'up' as const, comparacion: 'que el año pasado' },
            reservas: { valor: 1250, porcentaje: 25, tendencia: 'up' as const, comparacion: 'que el año pasado' },
            ventas: { valor: 9500000, porcentaje: 30, tendencia: 'up' as const, comparacion: 'que el año pasado' },
            comisiones: { valor: 950000, porcentaje: 30, tendencia: 'up' as const, comparacion: 'que el año pasado' },
            servicios: { valor: 12, porcentaje: 50, tendencia: 'up' as const, comparacion: 'que el año pasado' },
            clientes: { valor: 850, porcentaje: 20, tendencia: 'up' as const, comparacion: 'que el año pasado' }
          };
          break;
        case 'mes':
        default:
          datosEjemplo = {
            valoraciones: { valor: 4.7, porcentaje: 4, tendencia: 'up' as const, comparacion: 'que el mes pasado' },
            reservas: { valor: 120, porcentaje: 8, tendencia: 'up' as const, comparacion: 'que el mes pasado' },
            ventas: { valor: 850000, porcentaje: 12, tendencia: 'up' as const, comparacion: 'que el mes pasado' },
            comisiones: { valor: 85000, porcentaje: 12, tendencia: 'up' as const, comparacion: 'que el mes pasado' },
            servicios: { valor: 10, porcentaje: 25, tendencia: 'up' as const, comparacion: 'que el mes pasado' },
            clientes: { valor: 95, porcentaje: 15, tendencia: 'up' as const, comparacion: 'que el mes pasado' }
          };
      }
      
      setValoraciones(datosEjemplo.valoraciones);
      setReservas(datosEjemplo.reservas);
      setVentas(datosEjemplo.ventas);
      setComisiones(datosEjemplo.comisiones);
      setServicios(datosEjemplo.servicios);
      setClientes(datosEjemplo.clientes);
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empleadoId) {
      cargarDatos();
    }
  }, [empleadoId, periodoActual]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num}`;
    }
  };

  const renderTendenciaIcon = (tendencia?: 'up' | 'down' | 'stable') => {
    if (tendencia === 'up') {
      return <Ionicons name="arrow-up" size={14} color={colors.success} />;
    } else if (tendencia === 'down') {
      return <Ionicons name="arrow-down" size={14} color={colors.error} />;
    } else {
      return <Ionicons name="remove" size={14} color={colors.text + 'AA'} />;
    }
  };

  const renderPorcentaje = (porcentaje?: number, tendencia?: 'up' | 'down' | 'stable') => {
    if (porcentaje === undefined) return null;
    
    let color = colors.text + 'AA';
    if (tendencia === 'up') color = colors.success;
    if (tendencia === 'down') color = colors.error;
    
    return (
      <Text style={[styles.indicadorPorcentaje, { color }]}>
        {porcentaje > 0 ? '+' : ''}{porcentaje}%
      </Text>
    );
  };

  const renderIndicador = (
    titulo: string, 
    icono: string, 
    data: IndicadorData, 
    formatoValor?: (valor: number) => string
  ) => {
    const valorFormateado = typeof data.valor === 'number' && formatoValor 
      ? formatoValor(data.valor as number) 
      : data.valor;
    
    return (
      <View style={styles.indicadorCard}>
        <View style={styles.indicadorIconContainer}>
          <Ionicons name={icono as any} size={20} color={colors.primary} />
        </View>
        <Text style={styles.indicadorTitulo}>{titulo}</Text>
        <Text style={styles.indicadorValor}>{valorFormateado}</Text>
        
        {(data.porcentaje !== undefined || data.tendencia) && (
          <View style={styles.indicadorFooter}>
            {renderTendenciaIcon(data.tendencia)}
            {renderPorcentaje(data.porcentaje, data.tendencia)}
            <Text style={styles.indicadorComparacion}>
              {data.comparacion}
            </Text>
          </View>
        )}
      </View>
    );
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
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard de Rendimiento</Text>
      </View>
      
      {renderPeriodoSelector()}
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.greetingName}>{nombre}</Text>
          </Text>
          <Text style={styles.greetingSubtext}>
            Aquí está tu resumen de rendimiento
          </Text>
        </View>
        
        <View style={styles.indicadoresGrid}>
          {renderIndicador('Valoración', 'star', valoraciones)}
          {renderIndicador('Reservas', 'calendar', reservas)}
          {renderIndicador('Ventas', 'cash', ventas, formatNumber)}
          {renderIndicador('Comisiones', 'wallet', comisiones, formatNumber)}
          {renderIndicador('Servicios', 'medical', servicios)}
          {renderIndicador('Clientes', 'people', clientes)}
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columnas con margen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  greeting: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    color: colors.text,
  },
  greetingName: {
    fontWeight: 'bold',
  },
  greetingSubtext: {
    fontSize: 14,
    color: colors.text + 'AA',
    marginTop: 4,
  },
  indicadoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicadorCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'flex-start',
  },
  indicadorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicadorTitulo: {
    fontSize: 14,
    color: colors.text + 'AA',
    marginBottom: 4,
  },
  indicadorValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  indicadorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicadorPorcentaje: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 4,
  },
  indicadorComparacion: {
    fontSize: 12,
    color: colors.text + '80',
  },
});
