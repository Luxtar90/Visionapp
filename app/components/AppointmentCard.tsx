import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, borderRadius, typography } from '../theme/colors';

interface AppointmentCardProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  date: string;
  time: string;
  service: {
    name: string;
    price: number;
  };
  status: 'pending' | 'completed' | 'cancelled';
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        color: colors.warning,
        text: 'Pendiente'
      };
    case 'completed':
      return {
        color: colors.success,
        text: 'Finalizada'
      };
    case 'cancelled':
      return {
        color: colors.error,
        text: 'Cancelada'
      };
    default:
      return {
        color: colors.textLight,
        text: status
      };
  }
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  style, 
  onPress, 
  date, 
  time, 
  service, 
  status 
}) => {
  const { color: statusColor, text: statusText } = getStatusConfig(status);

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: statusColor }, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={colors.textLight} />
          <Text style={styles.infoText}>{time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cut-outline" size={20} color={colors.textLight} />
          <Text style={styles.infoText}>
            {service.name} - ${service.price}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.small,
  } as ViewStyle,
  header: {
    marginBottom: spacing.sm,
  } as ViewStyle,
  dateText: {
    ...typography.h3,
    color: colors.text,
  } as TextStyle,
  content: {
    gap: spacing.xs,
  } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  } as ViewStyle,
  infoText: {
    ...typography.body,
    color: colors.text,
  } as TextStyle,
  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  } as ViewStyle,
  statusText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  } as TextStyle,
});

export default AppointmentCard;
