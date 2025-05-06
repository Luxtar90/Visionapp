// src/components/common/FormInput.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  KeyboardTypeOptions
} from 'react-native';
import { colors } from '../../theme/colors';

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  required = false,
  helperText,
  error,
  ...props
}: FormInputProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredIndicator}>*</Text>}
      </View>
      
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholderTextColor={colors.text + '80'}
        {...props}
      />
      
      {(helperText || error) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  requiredIndicator: {
    color: colors.error,
    marginLeft: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  helperText: {
    fontSize: 12,
    color: colors.text + 'AA',
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: colors.error,
  },
});
