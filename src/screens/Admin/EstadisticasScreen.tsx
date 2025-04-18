// src/screens/Admin/EstadisticasScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Componentes
import { Header } from '../../components/common/Header';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { StatusMessage } from '../../components/common/StatusMessage';
import { FiltrosEstadisticas } from '../../components/Estadisticas/FiltrosEstadisticas';
import { TarjetaEstadistica } from '../../components/Estadisticas/TarjetaEstadistica';
import { GraficoEstadisticas } from '../../components/Estadisticas/GraficoEstadisticas';
import { TablaEstadisticas } from '../../components/Estadisticas/TablaEstadisticas';
import { ExportarReporte } from '../../components/Estadisticas/ExportarReporte';

// API
import { 
  getResumenEstadisticas,
  getEstadisticasPorPeriodo,
  getServiciosPopulares,
  getEmpleadosDestacados,
  getEstadisticasIngresos,
  getEstadisticasReservas
} from '../../api/estadisticas.api';
import { getEmpleados } from '../../api/empleados.api';
import { getServicios } from '../../api/servicios.api';

// Interfaces
import { 
  ResumenEstadisticas, 
  FiltrosEstadisticas as FiltrosEstadisticasType,
  ServicioPopular,
  EmpleadoDestacado
} from '../../interfaces/Estadisticas';
import { Empleado } from '../../interfaces/Empleado';
import { Servicio } from '../../interfaces/Servicio';

// Tema
import { colors } from '../../theme/colors';

export default function EstadisticasScreen() {
  // Estado
  const [tiendaId, setTiendaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Datos
  const [resumen, setResumen] = useState<ResumenEstadisticas | null>(null);
  const [serviciosPopulares, setServiciosPopulares] = useState<ServicioPopular[]>([]);
  const [empleadosDestacados, setEmpleadosDestacados] = useState<EmpleadoDestacado[]>([]);
  const [datosIngresos, setDatosIngresos] = useState<{ fecha: string; ingresos: number }[]>([]);
  const [datosReservas, setDatosReservas] = useState<{ fecha: string; reservas: number; completadas: number; canceladas: number }[]>([]);
  
  // Datos para filtros
  const [categorias, setCategorias] = useState<string[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosEstadisticasType>({
    periodo: 'mensual',
  });
  
  // Vista activa
  const [vistaActiva, setVistaActiva] = useState<'resumen' | 'ingresos' | 'reservas' | 'servicios' | 'empleados'>('resumen');

  // Cargar tienda seleccionada
  useEffect(() => {
    const loadTiendaId = async () => {
      const storedTiendaId = await AsyncStorage.getItem('tiendaId');
      setTiendaId(storedTiendaId);
    };
    
    loadTiendaId();
  }, []);

  // Cargar datos para filtros
  const loadDatosFiltros = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      // Cargar categorías de servicios
      const servicios = await getServicios(tiendaId);
      const uniqueCategorias = Array.from(new Set(servicios.map(servicio => servicio.categoria)));
      setCategorias(uniqueCategorias);
      
      // Cargar empleados
      const empleadosData = await getEmpleados(tiendaId);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error al cargar datos para filtros:', error);
    }
  }, [tiendaId]);

  // Cargar resumen de estadísticas
  const loadResumen = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      const data = await getResumenEstadisticas(tiendaId);
      setResumen(data);
    } catch (error) {
      console.error('Error al cargar resumen de estadísticas:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar el resumen de estadísticas'
      });
    }
  }, [tiendaId]);

  // Cargar servicios populares
  const loadServiciosPopulares = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      const data = await getServiciosPopulares(tiendaId, 5, {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
        categoria_servicio: filtros.categoria_servicio,
      });
      setServiciosPopulares(data);
    } catch (error) {
      console.error('Error al cargar servicios populares:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los servicios populares'
      });
    }
  }, [tiendaId, filtros]);

  // Cargar empleados destacados
  const loadEmpleadosDestacados = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      const data = await getEmpleadosDestacados(tiendaId, 5, {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
      });
      setEmpleadosDestacados(data);
    } catch (error) {
      console.error('Error al cargar empleados destacados:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los empleados destacados'
      });
    }
  }, [tiendaId, filtros]);

  // Cargar datos de ingresos
  const loadDatosIngresos = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      const data = await getEstadisticasIngresos({
        ...filtros,
        tienda_id: tiendaId,
      });
      setDatosIngresos(data);
    } catch (error) {
      console.error('Error al cargar datos de ingresos:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los datos de ingresos'
      });
    }
  }, [tiendaId, filtros]);

  // Cargar datos de reservas
  const loadDatosReservas = useCallback(async () => {
    if (!tiendaId) return;
    
    try {
      const data = await getEstadisticasReservas({
        ...filtros,
        tienda_id: tiendaId,
      });
      setDatosReservas(data);
    } catch (error) {
      console.error('Error al cargar datos de reservas:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los datos de reservas'
      });
    }
  }, [tiendaId, filtros]);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadDatosFiltros(),
        loadResumen(),
        loadServiciosPopulares(),
        loadEmpleadosDestacados(),
        loadDatosIngresos(),
        loadDatosReservas(),
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar los datos. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    loadDatosFiltros,
    loadResumen,
    loadServiciosPopulares,
    loadEmpleadosDestacados,
    loadDatosIngresos,
    loadDatosReservas,
  ]);

  // Cargar datos cuando cambia la tienda o cuando la pantalla obtiene el foco
  useEffect(() => {
    if (tiendaId) {
      loadAllData();
    }
  }, [tiendaId, loadAllData]);

  useFocusEffect(
    useCallback(() => {
      if (tiendaId) {
        loadAllData();
      }
    }, [tiendaId, loadAllData])
  );

  // Refrescar datos
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAllData();
  };

  // Aplicar filtros
  const handleAplicarFiltros = () => {
    loadAllData();
  };

  // Preparar datos para gráficos
  const prepararDatosGraficoIngresos = () => {
    const labels = datosIngresos.map(item => {
      const fecha = new Date(item.fecha);
      return filtros.periodo === 'diario' 
        ? fecha.toLocaleDateString() 
        : filtros.periodo === 'anual'
          ? fecha.getFullYear().toString()
          : fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    });
    
    const datos = datosIngresos.map(item => item.ingresos);
    
    return {
      labels,
      datasets: [
        {
          data: datos,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepararDatosGraficoReservas = () => {
    const labels = datosReservas.map(item => {
      const fecha = new Date(item.fecha);
      return filtros.periodo === 'diario' 
        ? fecha.toLocaleDateString() 
        : filtros.periodo === 'anual'
          ? fecha.getFullYear().toString()
          : fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    });
    
    const completadas = datosReservas.map(item => item.completadas);
    const canceladas = datosReservas.map(item => item.canceladas);
    
    return {
      labels,
      datasets: [
        {
          data: completadas,
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: canceladas,
          color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Completadas', 'Canceladas'],
    };
  };

  const prepararDatosGraficoServicios = () => {
    return serviciosPopulares.map(servicio => ({
      name: servicio.nombre,
      population: servicio.cantidad_reservas,
      color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
  };

  // Renderizar pestañas de navegación
  const renderTabs = () => {
    const tabs = [
      { id: 'resumen', label: 'Resumen', icon: 'stats-chart' },
      { id: 'ingresos', label: 'Ingresos', icon: 'cash' },
      { id: 'reservas', label: 'Reservas', icon: 'calendar' },
      { id: 'servicios', label: 'Servicios', icon: 'cut' },
      { id: 'empleados', label: 'Empleados', icon: 'people' },
    ];
    
    return (
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                vistaActiva === tab.id && styles.tabActive,
              ]}
              onPress={() => setVistaActiva(tab.id as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={vistaActiva === tab.id ? colors.primary : colors.text + '99'} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText,
                  vistaActiva === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Renderizar vista de resumen
  const renderResumen = () => {
    if (!resumen) return null;
    
    return (
      <View>
        <View style={styles.tarjetasContainer}>
          <TarjetaEstadistica
            titulo="Ingresos Totales"
            valor={`$${resumen.ingresos_totales.toLocaleString()}`}
            icono="cash"
            color={colors.primary}
            tendencia={{ valor: 5.2, positiva: true }}
            onPress={() => setVistaActiva('ingresos')}
          />
          
          <TarjetaEstadistica
            titulo="Reservas Totales"
            valor={resumen.reservas_totales.toLocaleString()}
            icono="calendar"
            color={colors.info}
            tendencia={{ valor: 3.8, positiva: true }}
            onPress={() => setVistaActiva('reservas')}
          />
          
          <TarjetaEstadistica
            titulo="Clientes Totales"
            valor={resumen.clientes_totales.toLocaleString()}
            icono="people"
            color={colors.success}
            tendencia={{ valor: 2.5, positiva: true }}
          />
          
          <TarjetaEstadistica
            titulo="Tasa de Conversión"
            valor={`${resumen.tasa_conversion}%`}
            icono="trending-up"
            color={colors.warning}
            tendencia={{ valor: -1.2, positiva: false }}
          />
        </View>
        
        <GraficoEstadisticas
          titulo="Ingresos por Período"
          tipo="linea"
          datos={prepararDatosGraficoIngresos()}
          descripcion="Evolución de ingresos en el período seleccionado"
        />
        
        <GraficoEstadisticas
          titulo="Reservas por Período"
          tipo="barra"
          datos={prepararDatosGraficoReservas()}
          descripcion="Comparativa de reservas completadas vs canceladas"
        />
        
        <TablaEstadisticas
          titulo="Servicios Más Populares"
          columnas={[
            { id: 'nombre', titulo: 'Servicio', ancho: 40 },
            { id: 'categoria', titulo: 'Categoría', ancho: 25 },
            { id: 'cantidad_reservas', titulo: 'Reservas', ancho: 15, alineacion: 'center' },
            { id: 'ingresos_generados', titulo: 'Ingresos', ancho: 20, alineacion: 'right', renderCelda: (valor) => (
              <Text style={styles.ingresos}>${valor.toLocaleString()}</Text>
            )},
          ]}
          datos={serviciosPopulares}
          onPressFila={() => setVistaActiva('servicios')}
          colorAlternar={true}
        />
        
        <TablaEstadisticas
          titulo="Empleados Destacados"
          columnas={[
            { id: 'nombre', titulo: 'Nombre', ancho: 30, renderCelda: (valor, fila) => (
              <Text>{valor} {fila.apellido}</Text>
            )},
            { id: 'cantidad_servicios', titulo: 'Servicios', ancho: 20, alineacion: 'center' },
            { id: 'valoracion_promedio', titulo: 'Valoración', ancho: 20, alineacion: 'center', renderCelda: (valor) => (
              <View style={styles.valoracion}>
                <Text>{valor.toFixed(1)}</Text>
                <Ionicons name="star" size={14} color={colors.warning} style={{ marginLeft: 2 }} />
              </View>
            )},
            { id: 'ingresos_generados', titulo: 'Ingresos', ancho: 30, alineacion: 'right', renderCelda: (valor) => (
              <Text style={styles.ingresos}>${valor.toLocaleString()}</Text>
            )},
          ]}
          datos={empleadosDestacados}
          onPressFila={() => setVistaActiva('empleados')}
          colorAlternar={true}
        />
      </View>
    );
  };

  // Renderizar vista de ingresos
  const renderIngresos = () => {
    return (
      <View>
        <GraficoEstadisticas
          titulo="Ingresos por Período"
          tipo="linea"
          datos={prepararDatosGraficoIngresos()}
          descripcion="Evolución de ingresos en el período seleccionado"
          altura={250}
        />
        
        <TablaEstadisticas
          titulo="Detalle de Ingresos"
          columnas={[
            { id: 'fecha', titulo: 'Fecha', ancho: 40, renderCelda: (valor) => (
              <Text>{new Date(valor).toLocaleDateString()}</Text>
            )},
            { id: 'ingresos', titulo: 'Ingresos', ancho: 60, alineacion: 'right', renderCelda: (valor) => (
              <Text style={styles.ingresos}>${valor.toLocaleString()}</Text>
            )},
          ]}
          datos={datosIngresos}
          colorAlternar={true}
          mostrarIndice={true}
        />
      </View>
    );
  };

  // Renderizar vista de reservas
  const renderReservas = () => {
    return (
      <View>
        <GraficoEstadisticas
          titulo="Reservas por Período"
          tipo="barra"
          datos={prepararDatosGraficoReservas()}
          descripcion="Comparativa de reservas completadas vs canceladas"
          altura={250}
        />
        
        <TablaEstadisticas
          titulo="Detalle de Reservas"
          columnas={[
            { id: 'fecha', titulo: 'Fecha', ancho: 30, renderCelda: (valor) => (
              <Text>{new Date(valor).toLocaleDateString()}</Text>
            )},
            { id: 'reservas', titulo: 'Total', ancho: 20, alineacion: 'center' },
            { id: 'completadas', titulo: 'Completadas', ancho: 25, alineacion: 'center', renderCelda: (valor) => (
              <Text style={{ color: colors.success }}>{valor}</Text>
            )},
            { id: 'canceladas', titulo: 'Canceladas', ancho: 25, alineacion: 'center', renderCelda: (valor) => (
              <Text style={{ color: colors.error }}>{valor}</Text>
            )},
          ]}
          datos={datosReservas}
          colorAlternar={true}
          mostrarIndice={true}
        />
      </View>
    );
  };

  // Renderizar vista de servicios
  const renderServicios = () => {
    return (
      <View>
        <GraficoEstadisticas
          titulo="Servicios Más Populares"
          tipo="pastel"
          datos={prepararDatosGraficoServicios()}
          descripcion="Distribución de reservas por servicio"
          altura={250}
        />
        
        <TablaEstadisticas
          titulo="Detalle de Servicios"
          columnas={[
            { id: 'nombre', titulo: 'Servicio', ancho: 35 },
            { id: 'categoria', titulo: 'Categoría', ancho: 25 },
            { id: 'cantidad_reservas', titulo: 'Reservas', ancho: 15, alineacion: 'center' },
            { id: 'ingresos_generados', titulo: 'Ingresos', ancho: 25, alineacion: 'right', renderCelda: (valor) => (
              <Text style={styles.ingresos}>${valor.toLocaleString()}</Text>
            )},
          ]}
          datos={serviciosPopulares}
          colorAlternar={true}
          mostrarIndice={true}
        />
      </View>
    );
  };

  // Renderizar vista de empleados
  const renderEmpleados = () => {
    return (
      <View>
        <TablaEstadisticas
          titulo="Empleados Destacados"
          columnas={[
            { id: 'nombre', titulo: 'Nombre', ancho: 25, renderCelda: (valor, fila) => (
              <Text>{valor} {fila.apellido}</Text>
            )},
            { id: 'cantidad_servicios', titulo: 'Servicios', ancho: 15, alineacion: 'center' },
            { id: 'valoracion_promedio', titulo: 'Valoración', ancho: 20, alineacion: 'center', renderCelda: (valor) => (
              <View style={styles.valoracion}>
                <Text>{valor.toFixed(1)}</Text>
                <Ionicons name="star" size={14} color={colors.warning} style={{ marginLeft: 2 }} />
              </View>
            )},
            { id: 'ingresos_generados', titulo: 'Ingresos', ancho: 25, alineacion: 'right', renderCelda: (valor) => (
              <Text style={styles.ingresos}>${valor.toLocaleString()}</Text>
            )},
          ]}
          datos={empleadosDestacados}
          colorAlternar={true}
          mostrarIndice={true}
          accionesColumna={{
            titulo: 'Acciones',
            acciones: [
              {
                icono: 'eye',
                color: colors.primary,
                onPress: (item) => console.log('Ver detalles de empleado', item),
              },
            ],
          }}
        />
      </View>
    );
  };

  // Renderizar contenido según la vista activa
  const renderContenido = () => {
    switch (vistaActiva) {
      case 'ingresos':
        return renderIngresos();
      case 'reservas':
        return renderReservas();
      case 'servicios':
        return renderServicios();
      case 'empleados':
        return renderEmpleados();
      default:
        return renderResumen();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Estadísticas" />
      
      {statusMessage && (
        <View style={styles.statusContainer}>
          <StatusMessage
            type={statusMessage.type}
            message={statusMessage.message}
            onDismiss={() => setStatusMessage(null)}
          />
        </View>
      )}
      
      <FiltrosEstadisticas
        filtros={filtros}
        onFiltrosChange={setFiltros}
        categorias={categorias}
        empleados={empleados}
        onAplicarFiltros={handleAplicarFiltros}
      />
      
      <ExportarReporte filtros={filtros} />
      
      {renderTabs()}
      
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Cargando estadísticas..." />
      ) : (
        <ScrollView
          style={styles.contenido}
          contentContainerStyle={styles.contenidoContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {renderContenido()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScrollContent: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: colors.text + '99',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  contenido: {
    flex: 1,
  },
  contenidoContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  tarjetasContainer: {
    marginBottom: 16,
  },
  ingresos: {
    color: colors.primary,
    fontWeight: '500',
  },
  valoracion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
