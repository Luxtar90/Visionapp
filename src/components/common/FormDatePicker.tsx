// src/components/common/FormDatePicker.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';

interface FormDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  helperText?: string;
  error?: string;
  nullable?: boolean;
}

export const FormDatePicker = ({
  label,
  value,
  onChange,
  required = false,
  helperText,
  error,
  nullable = false
}: FormDatePickerProps) => {
  const [show, setShow] = useState(false);
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'No seleccionada';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    
    if (event.type === 'dismissed') {
      return;
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };
  
  const handleClear = () => {
    if (nullable) {
      onChange(null);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredIndicator}>*</Text>}
      </View>
      
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[styles.dateButton, error && styles.dateButtonError]}
          onPress={() => setShow(true)}
        >
          <Text style={[styles.dateText, !value && styles.placeholderText]}>
            {value ? formatDate(value) : 'Seleccionar fecha'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.text + 'AA'} />
        </TouchableOpacity>
        
        {nullable && value && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Ionicons name="close-circle" size={22} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
      
      {(helperText || error) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
      
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonError: {
    borderColor: colors.error,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.text + '80',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
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
