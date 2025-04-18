// src/screens/Empleado/RendimientoScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface EstadisticaMensual {
  mes: string;
  servicios: number;
  clientes: number;
  ingresos: number;
  valoracion: number;
}

interface Servicio {
  id: string;
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export default function RendimientoScreen() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'trimestre'>('mes');
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticaMensual | null>(null);
  const [serviciosPopulares, setServiciosPopulares] = useState<Servicio[]>([]);

  useEffect(() => {
    // Simular carga de datos
    const fetchEstadisticas = async () => {
      try {
        // Aquí se llamaría a la API para obtener las estadísticas
        // const response = await getEstadisticasEmpleado(empleadoId, periodo);
        
        // Datos de ejemplo
        const mockEstadisticas: EstadisticaMensual = {
          mes: 'Abril 2025',
          servicios: 45,
          clientes: 32,
          ingresos: 1250.75,
          valoracion: 4.8,
        };
        
        const mockServicios: Servicio[] = [
          {
            id: '1',
            nombre: 'Corte de cabello',
            cantidad: 18,
            porcentaje: 40,
          },
          {
            id: '2',
            nombre: 'Tinte',
            cantidad: 12,
            porcentaje: 26.7,
          },
          {
            id: '3',
            nombre: 'Peinado',
            cantidad: 8,
            porcentaje: 17.8,
          },
          {
            id: '4',
            nombre: 'Tratamiento capilar',
            cantidad: 7,
            porcentaje: 15.5,
          },
        ];
        
        setEstadisticas(mockEstadisticas);
        setServiciosPopulares(mockServicios);
      } catch (error) {
        console.error('Error fetching estadisticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, [periodo]);

  const handlePeriodoChange = (nuevoPeriodo: 'semana' | 'mes' | 'trimestre') => {
    setPeriodo(nuevoPeriodo);
    setLoading(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Rendimiento</Text>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity 
          style={[styles.periodButton, periodo === 'semana' && styles.periodButtonActive]}
          onPress={() => handlePeriodoChange('semana')}
        >
          <Text style={[styles.periodText, periodo === 'semana' && styles.periodTextActive]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodButton, periodo === 'mes' && styles.periodButtonActive]}
          onPress={() => handlePeriodoChange('mes')}
        >
          <Text style={[styles.periodText, periodo === 'mes' && styles.periodTextActive]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodButton, periodo === 'trimestre' && styles.periodButtonActive]}
          onPress={() => handlePeriodoChange('trimestre')}
        >
          <Text style={[styles.periodText, periodo === 'trimestre' && styles.periodTextActive]}>Trimestre</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Cargando estadísticas...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {estadisticas && (
            <>
              <Text style={styles.periodoTitle}>{estadisticas.mes}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Ionicons name="cut-outline" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{estadisticas.servicios}</Text>
                  <Text style={styles.statLabel}>Servicios</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="people-outline" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{estadisticas.clientes}</Text>
                  <Text style={styles.statLabel}>Clientes</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="cash-outline" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>
                    {estadisticas.ingresos.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Ingresos</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="star-outline" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{estadisticas.valoracion}</Text>
                  <Text style={styles.statLabel}>Valoración</Text>
                </View>
              </View>
              
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Servicios más populares</Text>
                
                {serviciosPopulares.map((servicio) => (
                  <View key={servicio.id} style={styles.servicioItem}>
                    <View style={styles.servicioInfo}>
                      <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
                      <Text style={styles.servicioCantidad}>{servicio.cantidad} servicios</Text>
                    </View>
                    <View style={styles.porcentajeContainer}>
                      <View style={styles.barraContainer}>
                        <View 
                          style={[
                            styles.barraProgreso, 
                            { width: `${servicio.porcentaje}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.porcentajeText}>{servicio.porcentaje}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  periodButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  periodText: {
    fontSize: 14,
    color: colors.text,
  },
  periodTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  periodoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  servicioItem: {
    marginBottom: 16,
  },
  servicioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  servicioNombre: {
    fontSize: 14,
    color: colors.text,
  },
  servicioCantidad: {
    fontSize: 14,
    color: '#777',
  },
  porcentajeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barraContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  barraProgreso: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  porcentajeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    width: 40,
    textAlign: 'right',
  },
});
