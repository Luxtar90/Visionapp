import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

interface TimeSlotListProps {
  horarios: HorarioDisponible[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading: boolean;
}

const TimeSlotList: React.FC<TimeSlotListProps> = ({ 
  horarios, 
  selectedTime, 
  onSelectTime, 
  loading 
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando horarios...</Text>
      </View>
    );
  }

  if (horarios.length === 0) {
    return (
      <Text style={styles.emptyMessage}>
        No hay horarios disponibles para la fecha seleccionada.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horarios disponibles:</Text>
      <View style={styles.timeList}>
        {horarios.map((horario, index) => (
          <TouchableOpacity
            key={index.toString()}
            style={[
              styles.timeItem,
              !horario.disponible && styles.timeItemDisabled,
              selectedTime === horario.hora && styles.timeItemSelected,
            ]}
            onPress={() => horario.disponible && onSelectTime(horario.hora)}
            disabled={!horario.disponible}
          >
            <Text
              style={[
                styles.timeText,
                !horario.disponible && styles.timeTextDisabled,
                selectedTime === horario.hora && styles.timeTextSelected,
              ]}
            >
              {horario.hora}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeItem: {
    width: '22%',
    padding: 12,
    margin: '1.5%',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  timeItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeItemDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  timeTextSelected: {
    color: '#fff',
  },
  timeTextDisabled: {
    color: '#aaa',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#000000',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#000000',
    fontStyle: 'italic',
  },
});

export default TimeSlotList;
