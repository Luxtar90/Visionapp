// src/components/Cliente/ProfileField.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ProfileFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  hint?: string;
  required?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

/**
 * Componente que renderiza un campo de entrada para el perfil
 */
const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = 'default',
  hint,
  required = false,
  autoCapitalize = 'sentences'
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          !editable && styles.disabledInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize={autoCapitalize}
      />
      {hint && <Text style={styles.inputHint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: colors.error,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  disabledInput: {
    backgroundColor: colors.card,
    color: colors.textLight,
  },
  inputHint: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ProfileField;
