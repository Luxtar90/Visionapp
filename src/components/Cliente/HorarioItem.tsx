// src/components/Cliente/HorarioItem.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

// Interfaces
interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

interface HorarioItemProps {
  horario: HorarioDisponible;
  selected: boolean;
  onSelect: (hora: string) => void;
}

const HorarioItem: React.FC<HorarioItemProps> = ({ 
  horario, 
  selected, 
  onSelect 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.horarioItem,
        !horario.disponible && styles.horarioNoDisponible,
        selected && styles.horarioSeleccionado
      ]}
      onPress={() => horario.disponible && onSelect(horario.hora)}
      disabled={!horario.disponible}
    >
      <Text
        style={[
          styles.horarioText,
          !horario.disponible && styles.horarioTextNoDisponible,
          selected && styles.horarioTextSeleccionado
        ]}
      >
        {horario.hora}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  horarioItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  horarioNoDisponible: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  horarioSeleccionado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  horarioText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  horarioTextNoDisponible: {
    color: '#999',
  },
  horarioTextSeleccionado: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HorarioItem;
