import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  isPassword?: boolean;
  touched?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  isPassword = false,
  touched = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(!isPassword);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Determinar el icono de estado (error, éxito, etc.)
  const renderStatusIcon = () => {
    if (error && touched) {
      return (
        <Ionicons
          name="alert-circle"
          size={20}
          color={theme.colors.error}
          style={styles.statusIcon}
        />
      );
    } else if (touched && !error && props.value) {
      return (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={theme.colors.success}
          style={styles.statusIcon}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && touched && styles.inputError,
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error && touched ? theme.colors.error : theme.colors.gray}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !passwordVisible}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <Ionicons
              name={passwordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.gray}
            />
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <TouchableOpacity 
              onPress={onRightIconPress} 
              style={styles.rightIcon}
              disabled={!onRightIconPress}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          )
        )}
        {!isPassword && !rightIcon && renderStatusIcon()}
      </View>
      {error && touched && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.white,
    height: 50,
    paddingHorizontal: theme.spacing.md,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    ...theme.shadows.xs,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
    paddingVertical: theme.spacing.sm,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  statusIcon: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default Input;
