// src/components/Cliente/CarritoResumen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface CarritoResumenProps {
  subtotal: number;
  impuestos: number;
  total: number;
  onComprar: () => void;
  disabled?: boolean;
}

// Función para formatear el precio
const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

const CarritoResumen: React.FC<CarritoResumenProps> = ({
  subtotal,
  impuestos,
  total,
  onComprar,
  disabled = false
}) => {
  return (
    <View style={styles.resumenContainer}>
      <View style={styles.resumenItem}>
        <Text style={styles.resumenLabel}>Subtotal:</Text>
        <Text style={styles.resumenValor}>${formatPrice(subtotal)}</Text>
      </View>
      
      <View style={styles.resumenItem}>
        <Text style={styles.resumenLabel}>Impuestos (16%):</Text>
        <Text style={styles.resumenValor}>${formatPrice(impuestos)}</Text>
      </View>
      
      <View style={styles.resumenTotal}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValor}>${formatPrice(total)}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.comprarButton, disabled && styles.comprarButtonDisabled]}
        onPress={onComprar}
        disabled={disabled}
      >
        <Text style={styles.comprarButtonText}>
          {disabled ? 'Carrito vacío' : 'Finalizar compra'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resumenContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumenValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  resumenTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  comprarButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  comprarButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  comprarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CarritoResumen;
