import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  tiempo_estimado: number;
  costo: number;
  precio: any;
  categoria: string;
  tiendaId: number;
}

interface ServiceListProps {
  servicios: Servicio[];
  selectedService: number | null;
  onSelectService: (id: number) => void;
  loading: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({
  servicios,
  selectedService,
  onSelectService,
  loading
}) => {
  console.log('[ServiceList] Recibiendo servicios:', servicios.length);
  console.log('[ServiceList] Primer servicio:', servicios[0]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  if (servicios.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.primary} />
        <Text style={styles.emptyText}>No hay servicios disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un servicio:</Text>
      <View style={styles.serviceListContainer}>
        {servicios.map((item) => (
          <TouchableOpacity
            key={item.id.toString()}
            style={[
              styles.serviceItem,
              selectedService === item.id && styles.serviceItemSelected
            ]}
            onPress={() => onSelectService(item.id)}
          >
            <View style={styles.serviceIcon}>
              <Ionicons name="cut-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.nombre}</Text>
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {item.descripcion}
              </Text>
              <View style={styles.serviceMeta}>
                <Text style={styles.servicePrice}>
                  ${typeof item.precio === 'number' ? item.precio.toFixed(2) : item.precio}
                </Text>
                <Text style={styles.serviceDuration}>
                  <Ionicons name="time-outline" size={14} color="#000000" /> {item.tiempo_estimado} min
                </Text>
              </View>
            </View>
            {selectedService === item.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  serviceListContainer: {
    paddingBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  serviceItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0f7ff',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 15,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#000000',
  },
  checkIcon: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default ServiceList;
