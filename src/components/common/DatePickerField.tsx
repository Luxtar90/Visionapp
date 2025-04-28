// src/components/common/DatePickerField.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  icon?: string;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
}

export const DatePickerField = ({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  error,
  icon = 'calendar-outline',
  disabled = false,
  mode = 'date',
  minDate,
  maxDate,
  required,
}: DatePickerFieldProps) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    
    if (mode === 'date') {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } else if (mode === 'time') {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return `${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  };
  
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };
  
  const renderIOSPicker = () => {
    return (
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.doneButton}>Listo</Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={value || new Date()}
              mode={mode}
              display="spinner"
              onChange={handleChange}
              minimumDate={minDate}
              maximumDate={maxDate}
              // Removing locale property as it's not supported in DateTimePickerProps
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.dateContainer,
          error ? styles.dateError : null,
          disabled ? styles.dateDisabled : null
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Ionicons 
          name={icon as any} 
          size={20} 
          color="#777" 
          style={styles.icon} 
        />
        
        <Text 
          style={[
            styles.dateText,
            !value && styles.placeholderText
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        
        <Ionicons 
          name={mode === 'date' ? 'calendar' : 'time'} 
          size={20} 
          color="#777" 
        />
      </TouchableOpacity>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {Platform.OS === 'ios' ? (
        renderIOSPicker()
      ) : (
        showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="default"
            onChange={handleChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    height: 48,
  },
  dateError: {
    borderColor: '#e74c3c',
  },
  dateDisabled: {
    backgroundColor: '#f5f5f5',
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: '#999',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#e74c3c',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButton: {
    fontSize: 16,
    color: '#777',
  },
  doneButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});
