import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Cliente } from '../interfaces/Cliente';
import { colors } from '../theme/colors';

interface CardClienteProps {
  cliente: Cliente;
}

const CardCliente: React.FC<CardClienteProps> = ({ cliente }) => (
  <View style={styles.card}>
    <Text style={styles.name}>
      {cliente.nombre} {cliente.apellido}
    </Text>
    <Text style={styles.info}>Email: {cliente.email}</Text>
    <Text style={styles.info}>Teléfono: {cliente.telefono}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  info: {
    marginTop: 4,
    fontSize: 14,
    color: colors.text + '80',
  },
});

export default CardCliente;
