// src/components/Reservas/FiltrosReserva.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface FiltrosReservaProps {
  filtroActual: string;
  onFiltroChange: (filtro: string) => void;
}

export const FiltrosReserva = ({ filtroActual, onFiltroChange }: FiltrosReservaProps) => {
  return (
    <View style={styles.filtrosContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroActual === 'todas' && styles.filtroBtnActive]}
          onPress={() => onFiltroChange('todas')}
        >
          <Text style={[styles.filtroText, filtroActual === 'todas' && styles.filtroTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroActual === 'pendiente' && styles.filtroBtnActive]}
          onPress={() => onFiltroChange('pendiente')}
        >
          <View style={styles.filtroContent}>
            <Ionicons name="time-outline" size={16} color={filtroActual === 'pendiente' ? 'white' : '#f39c12'} />
            <Text style={[styles.filtroText, filtroActual === 'pendiente' && styles.filtroTextActive]}>
              Pendientes
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroActual === 'confirmada' && styles.filtroBtnActive]}
          onPress={() => onFiltroChange('confirmada')}
        >
          <View style={styles.filtroContent}>
            <Ionicons name="checkmark-circle-outline" size={16} color={filtroActual === 'confirmada' ? 'white' : '#3498db'} />
            <Text style={[styles.filtroText, filtroActual === 'confirmada' && styles.filtroTextActive]}>
              Confirmadas
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroActual === 'completada' && styles.filtroBtnActive]}
          onPress={() => onFiltroChange('completada')}
        >
          <View style={styles.filtroContent}>
            <Ionicons name="checkmark-done-outline" size={16} color={filtroActual === 'completada' ? 'white' : '#2ecc71'} />
            <Text style={[styles.filtroText, filtroActual === 'completada' && styles.filtroTextActive]}>
              Completadas
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroActual === 'cancelada' && styles.filtroBtnActive]}
          onPress={() => onFiltroChange('cancelada')}
        >
          <View style={styles.filtroContent}>
            <Ionicons name="close-circle-outline" size={16} color={filtroActual === 'cancelada' ? 'white' : '#e74c3c'} />
            <Text style={[styles.filtroText, filtroActual === 'cancelada' && styles.filtroTextActive]}>
              Canceladas
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filtrosContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtroBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  filtroBtnActive: {
    backgroundColor: colors.primary,
  },
  filtroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtroText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  filtroTextActive: {
    color: 'white',
    fontWeight: '500',
  },
});
