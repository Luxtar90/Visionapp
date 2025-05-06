// src/components/common/FormSwitch.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch
} from 'react-native';
import { colors } from '../../theme/colors';

interface FormSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  helperText?: string;
  disabled?: boolean;
}

export const FormSwitch = ({
  label,
  value,
  onValueChange,
  helperText,
  disabled = false
}: FormSwitchProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.switchRow}>
        <Text style={[styles.label, disabled && styles.disabledLabel]}>
          {label}
        </Text>
        
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={value ? colors.primary : '#f4f3f4'}
          ios_backgroundColor={colors.border}
          disabled={disabled}
        />
      </View>
      
      {helperText && (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  disabledLabel: {
    color: colors.text + '80',
  },
  helperText: {
    fontSize: 12,
    color: colors.text + 'AA',
    marginTop: 4,
    marginLeft: 2,
  },
});
