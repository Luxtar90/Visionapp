import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ReservationSummaryProps {
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
  price?: number | string;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  serviceName,
  employeeName,
  date,
  time,
  price
}) => {
  // Formatear la fecha para mostrarla en un formato más amigable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de tu reserva</Text>
      
      <View style={styles.summaryItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="cut-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemLabel}>Servicio</Text>
          <Text style={styles.itemValue}>{serviceName}</Text>
        </View>
      </View>
      
      <View style={styles.summaryItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemLabel}>Profesional</Text>
          <Text style={styles.itemValue}>{employeeName}</Text>
        </View>
      </View>
      
      <View style={styles.summaryItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemLabel}>Fecha</Text>
          <Text style={styles.itemValue}>{formatDate(date)}</Text>
        </View>
      </View>
      
      <View style={styles.summaryItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemLabel}>Hora</Text>
          <Text style={styles.itemValue}>{time}</Text>
        </View>
      </View>
      
      {price && (
        <View style={styles.summaryItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemLabel}>Precio</Text>
            <Text style={styles.itemValue}>
              ${typeof price === 'number' ? price.toFixed(2) : price}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color="#000000" style={styles.noteIcon} />
        <Text style={styles.noteText}>
          Recibirás una confirmación por correo electrónico una vez que se confirme tu reserva.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
    opacity: 0.7,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
});

export default ReservationSummary;
