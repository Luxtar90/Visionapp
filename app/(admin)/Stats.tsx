import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total de Usuarios</Text>
          <Text style={styles.statValue}>150</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Citas este mes</Text>
          <Text style={styles.statValue}>48</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Productos vendidos</Text>
          <Text style={styles.statValue}>27</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Servicios más solicitados</Text>
          <Text style={styles.statValue}>Corte de cabello</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B46C1',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
});

