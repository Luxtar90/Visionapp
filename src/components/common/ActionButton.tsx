// src/components/common/ActionButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ActionButtonProps {
  label?: string;
  title?: string; // Alias para label para compatibilidad
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  type?: 'primary' | 'secondary' | 'danger' | 'success'; // Alias para variant para compatibilidad
  icon?: string;
  loading?: boolean;
  isLoading?: boolean; // Alias para loading para compatibilidad
  disabled?: boolean;
  fullWidth?: boolean;
  style?: any; // Para permitir estilos personalizados
}

export const ActionButton = ({
  label,
  title,
  onPress,
  variant = 'primary',
  type,
  icon,
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ActionButtonProps) => {
  // Usar title como fallback si label no está definido
  const buttonLabel = label || title || 'Button';
  
  // Usar type como fallback si variant no está definido
  const buttonVariant = variant || type || 'primary';
  
  // Usar isLoading como fallback si loading no está definido
  const isButtonLoading = loading || isLoading;
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    switch (buttonVariant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      case 'success':
        baseStyle.push(styles.successButton);
        break;
    }
    
    if (disabled || isButtonLoading) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    switch (buttonVariant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerText);
        break;
      case 'success':
        baseStyle.push(styles.successText);
        break;
    }
    
    if (disabled || isButtonLoading) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };
  
  const getIconColor = () => {
    if (disabled || isButtonLoading) {
      return '#aaa';
    }
    
    switch (buttonVariant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return colors.primary;
      case 'danger':
        return 'white';
      case 'success':
        return 'white';
      default:
        return 'white';
    }
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isButtonLoading}
      activeOpacity={0.8}
    >
      {isButtonLoading ? (
        <ActivityIndicator 
          size="small" 
          color={buttonVariant === 'secondary' ? colors.primary : 'white'} 
        />
      ) : (
        <>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={18} 
              color={getIconColor()} 
              style={styles.icon} 
            />
          )}
          <Text style={getTextStyle()}>{buttonLabel}</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  successButton: {
    backgroundColor: '#2ecc71',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: 'white',
  },
  successText: {
    color: 'white',
  },
  disabledText: {
    color: '#aaa',
  },
  icon: {
    marginRight: 8,
  },
});
