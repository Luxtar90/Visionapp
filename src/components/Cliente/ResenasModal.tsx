// src/components/Cliente/ResenasModal.tsx
import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface Resena {
  id: number;
  usuarioNombre: string;
  fecha: string;
  calificacion: number;
  comentario: string;
  servicioNombre?: string;
}

interface ResenasModalProps {
  visible: boolean;
  onClose: () => void;
  resenas: Resena[];
  empleadoNombre: string;
  loading: boolean;
}

const ResenasModal: React.FC<ResenasModalProps> = ({ 
  visible, 
  onClose, 
  resenas, 
  empleadoNombre,
  loading
}) => {
  // Renderizar estrellas para la calificación
  const renderEstrellas = (calificacion: number) => {
    const estrellas = [];
    const calificacionRedondeada = Math.round(calificacion * 2) / 2; // Redondear a 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= calificacionRedondeada) {
        // Estrella completa
        estrellas.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i - 0.5 === calificacionRedondeada) {
        // Media estrella
        estrellas.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        // Estrella vacía
        estrellas.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" />
        );
      }
    }
    
    return estrellas;
  };

  // Renderizar un elemento de reseña
  const renderResenaItem = ({ item }: { item: Resena }) => (
    <View style={styles.resenaItem}>
      <View style={styles.resenaHeader}>
        <Text style={styles.resenaUsuario}>{item.usuarioNombre}</Text>
        <Text style={styles.resenaFecha}>{item.fecha}</Text>
      </View>
      
      <View style={styles.estrellas}>
        {renderEstrellas(item.calificacion)}
      </View>
      
      {item.servicioNombre && (
        <Text style={styles.resenaServicio}>
          Servicio: {item.servicioNombre}
        </Text>
      )}
      
      <Text style={styles.resenaComentario}>{item.comentario}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Reseñas de {empleadoNombre}
            </Text>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando reseñas...</Text>
            </View>
          ) : resenas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={60} color={colors.disabled} />
              <Text style={styles.emptyText}>
                No hay reseñas disponibles
              </Text>
              <Text style={styles.emptySubtext}>
                Este profesional aún no tiene reseñas
              </Text>
            </View>
          ) : (
            <FlatList
              data={resenas}
              renderItem={renderResenaItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.resenasList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  resenasList: {
    padding: 16,
  },
  resenaItem: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  resenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resenaUsuario: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  resenaFecha: {
    fontSize: 12,
    color: colors.textLight,
  },
  estrellas: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resenaServicio: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textLight,
    marginBottom: 8,
  },
  resenaComentario: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default ResenasModal;
