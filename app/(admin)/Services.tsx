import { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, ActivityIndicator, Modal, TextInput 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../src/constants/config";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const data = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      };

      if (editingService) {
        await axios.put(
          `${API_URL}/services/${editingService.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Éxito", "Servicio actualizado correctamente");
      } else {
        await axios.post(
          `${API_URL}/services`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Éxito", "Servicio creado correctamente");
      }

      setModalVisible(false);
      clearForm();
      fetchServices();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el servicio");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`${API_URL}/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Éxito", "Servicio eliminado correctamente");
      fetchServices();
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el servicio");
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: ''
    });
    setEditingService(null);
  };

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        <View style={styles.serviceDetails}>
          <Text style={styles.servicePrice}>Precio: ${item.price}</Text>
          <Text style={styles.serviceDuration}>Duración: {item.duration} min</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingService(item);
            setFormData({
              name: item.name,
              description: item.description,
              price: item.price.toString(),
              duration: item.duration.toString()
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={24} color="#6B46C1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Confirmar eliminación",
              "¿Estás seguro de que quieres eliminar este servicio?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", onPress: () => handleDelete(item.id), style: "destructive" }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={24} color="#E53E3E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          clearForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Nuevo Servicio</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          clearForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del servicio"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={formData.price}
              onChangeText={(text) => setFormData({...formData, price: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Duración (minutos)"
              value={formData.duration}
              onChangeText={(text) => setFormData({...formData, duration: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
            >
              <Text style={styles.saveButtonText}>
                {editingService ? "Actualizar" : "Crear"} Servicio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.1)',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 70, 193, 0.1)',
  },
  servicePrice: {
    fontSize: 15,
    color: '#6B46C1',
    fontWeight: '600',
  },
  serviceDuration: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  editButton: {
    padding: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)',
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 62, 62, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 55, 72, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 70, 193, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  input: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#4A5568',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: '#6B46C1',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});