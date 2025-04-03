import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  ...props
}) => {
  // Determinar estilos basados en la variante
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  // Determinar estilos de texto basados en la variante
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      case 'ghost':
        return styles.textGhost;
      case 'primary':
      case 'secondary':
      default:
        return styles.textPrimary;
    }
  };

  // Determinar estilos basados en el tamaño
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

  // Determinar estilos de texto basados en el tamaño
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

  // Determinar color del icono basado en la variante
  const getIconColor = () => {
    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.primary;
      case 'primary':
      case 'secondary':
      default:
        return theme.colors.white;
    }
  };

  // Determinar tamaño del icono basado en el tamaño del botón
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      case 'md':
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white} 
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons 
              name={leftIcon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.leftIcon} 
            />
          )}
          <Text 
            style={[
              styles.text, 
              getTextStyle(), 
              getTextSizeStyle(),
              disabled && styles.textDisabled,
              textStyle
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <Ionicons 
              name={rightIcon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.rightIcon} 
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    ...theme.shadows.none,
  },
  small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: theme.colors.lightGray,
    borderColor: theme.colors.lightGray,
    ...theme.shadows.none,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: theme.colors.white,
  },
  textOutline: {
    color: theme.colors.primary,
  },
  textGhost: {
    color: theme.colors.primary,
  },
  textDisabled: {
    color: theme.colors.gray,
  },
  textSmall: {
    fontSize: theme.typography.fontSizes.sm,
  },
  textMedium: {
    fontSize: theme.typography.fontSizes.md,
  },
  textLarge: {
    fontSize: theme.typography.fontSizes.lg,
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
});

export default Button;
