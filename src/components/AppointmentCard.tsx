import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Service {
  name: string;
  price: number | string;
  duration: number;
}

export interface AppointmentCardProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  date: string;
  time: string;
  service: Service;
  status: AppointmentStatus;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  style,
  onPress,
  date,
  time,
  service,
  status
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={20} color="#666" />
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time" size={20} color="#666" />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceDetails}>
          {service.duration} min · ${service.price}
        </Text>
        <View style={[styles.statusBadge, getStatusStyle(status)]}>
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStatusStyle = (status: AppointmentStatus) => {
  switch (status) {
    case 'pending':
      return { backgroundColor: '#FFA500' };
    case 'completed':
      return { backgroundColor: '#4CAF50' };
    case 'cancelled':
      return { backgroundColor: '#F44336' };
  }
};

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'completed':
      return 'Completada';
    case 'cancelled':
      return 'Cancelada';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  time: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  content: {
    gap: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  serviceDetails: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AppointmentCard;
