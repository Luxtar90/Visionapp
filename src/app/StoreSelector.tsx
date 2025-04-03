import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { handleApiError } from '../utils/api';
import { router } from 'expo-router';
import { AxiosError } from 'axios';

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  uniqueCode: string;
  createdAt: string;
  deletedAt: string | null;
  imagen: string | null;
}

interface ClientStore {
  idCliente: number;
  idTienda: number;
  estado: boolean;
  puntosAcumulados: number;
  ultimaVisita: string;
  fechaRegistro: string;
  store: Store;
}

export default function StoreSelector() {
  const [modalVisible, setModalVisible] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        console.error('No token or userId found');
        return;
      }

      // Primero obtenemos las tiendas asociadas al cliente
      const clientStoresResponse = await api.get<{ data: ClientStore[] }>(
        `/client-stores/client/${userId}`
      );

      // Extraemos las tiendas de la respuesta
      const loadedStores = clientStoresResponse.data.data.map(cs => cs.store);
      
      // Guardamos las tiendas en el estado y AsyncStorage
      setStores(loadedStores);
      await AsyncStorage.setItem('stores', JSON.stringify(loadedStores));
      
      // Verificamos si hay una tienda seleccionada previamente
      const currentStoreId = await AsyncStorage.getItem('currentStoreId');
      if (currentStoreId) {
        const current = loadedStores.find((s: Store) => s.id.toString() === currentStoreId);
        if (current) setCurrentStore(current);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      handleApiError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = async (store: Store) => {
    try {
      await AsyncStorage.setItem('currentStoreId', store.id.toString());
      await AsyncStorage.setItem('currentStoreName', store.name);
      setCurrentStore(store);
      setModalVisible(false);
      router.push("/(tabs)/shop" as any);
    } catch (error) {
      console.error('Error selecting store:', error);
    }
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity 
      style={styles.storeItem}
      onPress={() => handleStoreSelect(item)}
    >
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>{item.address}</Text>
        <Text style={styles.storePhone}>{item.phone}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#6B46C1" />
    </TouchableOpacity>
  );

  if (!currentStore || loading) return null;

  return (
    <View>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>{currentStore.name}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una tienda</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={stores}
              renderItem={renderStoreItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.storeList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  storeList: {
    padding: 20,
  },
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  storeInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  storePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
