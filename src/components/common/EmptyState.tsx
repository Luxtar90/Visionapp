// src/components/common/EmptyState.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface EmptyStateProps {
  icon: string;
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon, message, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon as any} size={80} color="#ccc" />
      <Text style={styles.emptyText}>{message}</Text>
      {description && (
        <Text style={styles.descriptionText}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text + 'AA',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '500',
  },
});
