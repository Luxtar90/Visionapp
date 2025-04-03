import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  elevation?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  iconColor = colors.primary,
  elevation = 'md',
  style,
}) => {
  const getShadow = () => {
    switch (elevation) {
      case 'sm':
        return shadows.small;
      case 'lg':
        return shadows.large;
      default:
        return shadows.medium;
    }
  };

  return (
    <View style={[styles.container, getShadow(), style]}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <Ionicons
              name={icon}
              size={24}
              color={iconColor}
              style={styles.icon}
            />
          )}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});

export default Card; 