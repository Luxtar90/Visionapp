// src/components/common/FormSelect.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface SelectItem {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  value: string | null;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export const FormSelect = ({
  label,
  value,
  onValueChange,
  items,
  placeholder = 'Seleccionar',
  required = false,
  helperText,
  error,
}: FormSelectProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedItem = items.find(item => item.value === value);
  
  const handleSelect = (item: SelectItem) => {
    onValueChange(item.value);
    setModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredIndicator}>*</Text>}
      </View>
      
      <TouchableOpacity
        style={[styles.selectButton, error && styles.selectButtonError]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            styles.selectText,
            !selectedItem && styles.placeholderText
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text + 'AA'} />
      </TouchableOpacity>
      
      {(helperText || error) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      item.value === value && styles.selectedOptionText
                    ]}
                  >
                    {item.label}
                  </Text>
                  
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  selectButton: {
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
  selectButtonError: {
    borderColor: colors.error,
  },
  selectText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.text + '80',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedOptionItem: {
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border + '30',
  },
});
