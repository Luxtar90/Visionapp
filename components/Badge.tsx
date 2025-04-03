import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import theme from '../theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gray';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  solid?: boolean;
  pill?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  solid = true,
  pill = false,
}) => {
  // Obtener el color de fondo según la variante
  const getBackgroundColor = () => {
    if (!solid) return 'transparent';
    
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      case 'gray':
        return theme.colors.gray;
      default:
        return theme.colors.primary;
    }
  };

  // Obtener el color del borde según la variante
  const getBorderColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      case 'gray':
        return theme.colors.gray;
      default:
        return theme.colors.primary;
    }
  };

  // Obtener el color del texto según la variante y si es sólido o no
  const getTextColor = () => {
    if (solid) return theme.colors.white;
    
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      case 'gray':
        return theme.colors.gray;
      default:
        return theme.colors.primary;
    }
  };

  // Obtener el tamaño según la propiedad size
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.small;
      case 'lg':
        return styles.large;
      case 'md':
      default:
        return styles.medium;
    }
  };

  // Obtener el tamaño del texto según la propiedad size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.textSmall;
      case 'lg':
        return styles.textLarge;
      case 'md':
      default:
        return styles.textMedium;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getSizeStyle(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: solid ? 0 : 1,
          borderRadius: pill ? 50 : theme.borderRadius.sm,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          getTextSizeStyle(),
          { color: getTextColor() },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  small: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  large: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: theme.typography.fontSizes.xs,
  },
  textMedium: {
    fontSize: theme.typography.fontSizes.sm,
  },
  textLarge: {
    fontSize: theme.typography.fontSizes.md,
  },
});

export default Badge;
