// src/components/Reservas/ResenasModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ResenasEmpleado from '../Cliente/ResenasEmpleado';
import { useNavigation } from '@react-navigation/native';

// Interfaz para las reseñas (compatible con el formato existente)
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
  empleadoNombre: string;
  resenas: Resena[];
  loading: boolean;
  empleadoId?: number;
  servicioId?: number;
  servicioNombre?: string;
}

const ResenasModal: React.FC<ResenasModalProps> = ({
  visible,
  onClose,
  empleadoNombre,
  resenas,
  loading,
  empleadoId,
  servicioId,
  servicioNombre
}) => {
  const navigation = useNavigation();

  const handleViewAllReviews = () => {
    // Solo navegar si tenemos el ID del empleado
    if (empleadoId) {
      // Cerrar el modal primero
      onClose();
      
      // Navegar a la pantalla de todas las reseñas
      navigation.navigate('TodasResenas', {
        empleadoId,
        empleadoNombre,
        servicioId,
        servicioNombre
      });
    }
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
      } else if (i === fullStars + 1 && halfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#FFD700" />);
      }
    }
    
    return stars;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Si tenemos el ID del empleado, usamos el componente ResenasEmpleado
  if (empleadoId) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Reseñas de {empleadoNombre}
              {servicioNombre ? ` - ${servicioNombre}` : ''}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <ResenasEmpleado
              empleadoId={empleadoId}
              servicioId={servicioId}
              limit={3}
              showHeader={true}
              onViewAll={handleViewAllReviews}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Versión compatible con el formato existente
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Reseñas de {empleadoNombre}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando reseñas...</Text>
            </View>
          ) : resenas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyText}>No hay reseñas disponibles</Text>
            </View>
          ) : (
            <FlatList
              data={resenas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.userName}>{item.usuarioNombre}</Text>
                    <Text style={styles.reviewDate}>{formatDate(item.fecha)}</Text>
                  </View>
                  
                  <View style={styles.ratingStars}>
                    {renderRatingStars(item.calificacion)}
                  </View>
                  
                  {item.servicioNombre && (
                    <Text style={styles.serviceName}>{item.servicioNombre}</Text>
                  )}
                  
                  <Text style={styles.reviewComment}>{item.comentario}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 15,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666666',
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  reviewComment: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
});

export default ResenasModal;
