import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  pill?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'medium',
  pill = false,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'secondary':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 2, paddingHorizontal: 6 };
      case 'large':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 8 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: pill ? 999 : 4,
          ...getPadding(),
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: getFontSize(),
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default Badge; 