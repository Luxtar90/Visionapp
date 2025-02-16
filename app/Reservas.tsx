import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ReservasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
});

export default ReservasScreen;