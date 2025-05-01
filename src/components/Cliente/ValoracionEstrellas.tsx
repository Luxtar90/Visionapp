// src/components/Cliente/ValoracionEstrellas.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ValoracionEstrellasProps {
  valoracion: number;
  tamano?: number;
  color?: string;
  interactivo?: boolean;
  onValoracionChange?: (valor: number) => void;
}

export const ValoracionEstrellas: React.FC<ValoracionEstrellasProps> = ({
  valoracion,
  tamano = 20,
  color = colors.primary,
  interactivo = false,
  onValoracionChange
}) => {
  const renderEstrellas = () => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        interactivo ? (
          <TouchableOpacity
            key={i}
            onPress={() => onValoracionChange?.(i)}
            style={styles.estrella}
          >
            <Ionicons
              name={i <= valoracion ? 'star' : 'star-outline'}
              size={tamano}
              color={i <= valoracion ? color : colors.gray}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons
            key={i}
            name={i <= valoracion ? 'star' : 'star-outline'}
            size={tamano}
            color={i <= valoracion ? color : colors.gray}
            style={styles.estrella}
          />
        )
      );
    }
    return estrellas;
  };

  return <View style={styles.container}>{renderEstrellas()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estrella: {
    padding: 2,
  },
});
