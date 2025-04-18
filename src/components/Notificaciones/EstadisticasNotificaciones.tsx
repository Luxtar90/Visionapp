// src/components/Notificaciones/EstadisticasNotificaciones.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../common/ProgressBar';
import { colors } from '../../theme/colors';

interface EstadisticasNotificacionesProps {
  estadisticas: {
    total: number;
    pendientes: number;
    enviadas: number;
    leidas: number;
    tasa_apertura: number;
  };
}

export const EstadisticasNotificaciones: React.FC<EstadisticasNotificacionesProps> = ({
  estadisticas,
}) => {
  const formatPorcentaje = (valor: number): string => {
    return `${Math.round(valor * 100)}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumen de Notificaciones</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{estadisticas.total}</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="time" size={20} color={colors.warning} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Pendientes</Text>
            <Text style={styles.statValue}>{estadisticas.pendientes}</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="paper-plane" size={20} color={colors.info} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Enviadas</Text>
            <Text style={styles.statValue}>{estadisticas.enviadas}</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Leídas</Text>
            <Text style={styles.statValue}>{estadisticas.leidas}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tasaContainer}>
        <View style={styles.tasaHeader}>
          <Text style={styles.tasaLabel}>Tasa de apertura</Text>
          <Text style={styles.tasaValue}>{formatPorcentaje(estadisticas.tasa_apertura)}</Text>
        </View>
        <ProgressBar 
          progress={estadisticas.tasa_apertura} 
          color={colors.success}
          style={styles.progressBar}
        />
      </View>
      
      <View style={styles.indicadoresContainer}>
        <View style={styles.indicadorItem}>
          <View style={styles.indicadorDot} />
          <Text style={styles.indicadorLabel}>Pendientes</Text>
          <Text style={styles.indicadorValue}>
            {estadisticas.total > 0 
              ? formatPorcentaje(estadisticas.pendientes / estadisticas.total) 
              : '0%'}
          </Text>
        </View>
        
        <View style={styles.indicadorItem}>
          <View style={[styles.indicadorDot, { backgroundColor: colors.info }]} />
          <Text style={styles.indicadorLabel}>Enviadas</Text>
          <Text style={styles.indicadorValue}>
            {estadisticas.total > 0 
              ? formatPorcentaje(estadisticas.enviadas / estadisticas.total) 
              : '0%'}
          </Text>
        </View>
        
        <View style={styles.indicadorItem}>
          <View style={[styles.indicadorDot, { backgroundColor: colors.success }]} />
          <Text style={styles.indicadorLabel}>Leídas</Text>
          <Text style={styles.indicadorValue}>
            {estadisticas.total > 0 
              ? formatPorcentaje(estadisticas.leidas / estadisticas.total) 
              : '0%'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text + '99',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tasaContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  tasaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tasaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  tasaValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  indicadoresContainer: {
    marginTop: 16,
  },
  indicadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicadorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.warning,
    marginRight: 8,
  },
  indicadorLabel: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  indicadorValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
});
