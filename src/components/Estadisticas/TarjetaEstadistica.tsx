// src/components/Estadisticas/TarjetaEstadistica.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface TarjetaEstadisticaProps {
  titulo: string;
  valor: string | number;
  icono: string;
  color?: string;
  tendencia?: {
    valor: number;
    positiva: boolean;
  };
  onPress?: () => void;
}

export const TarjetaEstadistica: React.FC<TarjetaEstadisticaProps> = ({
  titulo,
  valor,
  icono,
  color = colors.primary,
  tendencia,
  onPress,
}) => {
  const formatearTendencia = (valor: number) => {
    if (valor === 0) return '0%';
    return valor > 0 ? `+${valor}%` : `${valor}%`;
  };

  const renderContenido = () => (
    <View style={styles.contenedor}>
      <View style={[styles.iconoContenedor, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icono as any} size={24} color={color} />
      </View>
      
      <View style={styles.infoContenedor}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={[styles.valor, { color }]}>{valor}</Text>
        
        {tendencia && (
          <View style={styles.tendenciaContenedor}>
            <Ionicons 
              name={tendencia.positiva ? 'arrow-up' : 'arrow-down'} 
              size={14} 
              color={tendencia.positiva ? colors.success : colors.error} 
            />
            <Text 
              style={[
                styles.tendenciaTexto, 
                { 
                  color: tendencia.positiva ? colors.success : colors.error 
                }
              ]}
            >
              {formatearTendencia(tendencia.valor)}
            </Text>
            <Text style={styles.periodoTexto}>vs. período anterior</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.tarjeta}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {renderContenido()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.tarjeta}>
      {renderContenido()}
    </View>
  );
};

const styles = StyleSheet.create({
  tarjeta: {
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
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoContenedor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContenedor: {
    flex: 1,
  },
  titulo: {
    fontSize: 14,
    color: colors.text + '99',
    marginBottom: 4,
  },
  valor: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tendenciaContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tendenciaTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
    marginRight: 4,
  },
  periodoTexto: {
    fontSize: 12,
    color: colors.text + '80',
  },
});
