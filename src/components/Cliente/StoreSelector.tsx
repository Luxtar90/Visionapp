// src/components/Cliente/StoreSelector.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Store {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email_contacto?: string;
}

interface StoreSelectorProps {
  label: string;
  selectedStores: number[];
  stores: Store[];
  onStoresChange: (storeIds: number[]) => void;
  hint?: string;
  required?: boolean;
}

/**
 * Componente que permite seleccionar múltiples tiendas
 */
const StoreSelector: React.FC<StoreSelectorProps> = ({
  label,
  selectedStores,
  stores,
  onStoresChange,
  hint,
  required = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleStore = (storeId: number) => {
    const newSelection = selectedStores.includes(storeId)
      ? selectedStores.filter(id => id !== storeId)
      : [...selectedStores, storeId];
    
    onStoresChange(newSelection);
  };

  const renderStoreItem = ({ item }: { item: Store }) => {
    const isSelected = selectedStores.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.storeItem}
        onPress={() => toggleStore(item.id)}
      >
        <Ionicons
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isSelected ? colors.primary : colors.textLight}
        />
        <View style={styles.storeDetails}>
          <Text style={[
            styles.storeItemText,
            isSelected && styles.storeItemSelected
          ]}>
            {item.nombre}
          </Text>
          {item.direccion && (
            <Text style={styles.storeAddress}>{item.direccion}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity 
        style={styles.storeSelector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedStores.length > 0 ? styles.inputText : styles.placeholderText}>
          {selectedStores.length > 0 
            ? `${selectedStores.length} tienda(s) seleccionada(s)` 
            : "Selecciona las tiendas donde compras"}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>
      
      {hint && <Text style={styles.inputHint}>{hint}</Text>}
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tus tiendas</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Selecciona las tiendas donde realizas tus compras para una mejor experiencia
            </Text>
            
            <FlatList
              data={stores}
              renderItem={renderStoreItem}
              keyExtractor={item => item.id.toString()}
              style={styles.storeList}
              contentContainerStyle={styles.storeListContent}
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalConfirmText}>Confirmar selección</Text>
              </TouchableOpacity>
            </View>
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
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: colors.error,
  },
  storeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
  },
  inputHint: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  storeList: {
    maxHeight: 300,
  },
  storeListContent: {
    paddingVertical: 5,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeDetails: {
    flex: 1,
    marginLeft: 10,
  },
  storeItemText: {
    fontSize: 16,
    color: colors.text,
  },
  storeItemSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  storeAddress: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  modalButtonContainer: {
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
  },
  modalConfirmText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StoreSelector;
