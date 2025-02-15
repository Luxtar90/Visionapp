import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FindStudiosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Estudios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
});