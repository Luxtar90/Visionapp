import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ResenasModal from './ResenasModal';

// Actualizar la interfaz para que sea compatible con NuevaReservaScreen
export interface Empleado {
  id: number;
  nombres: string;
  apellidos: string;
  calificacion?: number;
  cargo?: string;
  dias_para_reservas?: string;
  tiendaId?: number;
  numResenas?: number;
  especialidad?: string;
  foto?: string;
}

interface EmployeeListProps {
  empleados: Empleado[];
  selectedEmpleadoId: number | null;
  onSelectEmpleado: (empleado: Empleado) => void;
  loading: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  empleados,
  selectedEmpleadoId,
  onSelectEmpleado,
  loading
}) => {
  const [showResenasModal, setShowResenasModal] = useState(false);
  const [selectedEmpleadoForResenas, setSelectedEmpleadoForResenas] = useState<Empleado | null>(null);

  const renderRatingStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars + 1 && halfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" />);
      }
    }
    
    return stars;
  };

  const handleViewResenas = (empleado: Empleado) => {
    setSelectedEmpleadoForResenas(empleado);
    setShowResenasModal(true);
  };

  const renderEmployeeItem = (empleado: Empleado) => {
    const isSelected = selectedEmpleadoId === empleado.id;
    const nombreCompleto = `${empleado.nombres} ${empleado.apellidos}`;
    
    return (
      <TouchableOpacity
        key={empleado.id}
        style={[
          styles.employeeCard,
          isSelected && styles.selectedEmployeeCard
        ]}
        onPress={() => onSelectEmpleado(empleado)}
      >
        <View style={styles.employeeInfo}>
          {empleado.foto ? (
            <Image source={{ uri: empleado.foto }} style={styles.employeeImage} />
          ) : (
            <View style={styles.employeeInitials}>
              <Text style={styles.initialsText}>
                {empleado.nombres.charAt(0)}{empleado.apellidos.charAt(0)}
              </Text>
            </View>
          )}
          
          <View style={styles.employeeDetails}>
            <Text style={styles.employeeName}>{nombreCompleto}</Text>
            
            {empleado.especialidad && (
              <Text style={styles.employeeSpecialty}>{empleado.especialidad}</Text>
            )}
            
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderRatingStars(empleado.calificacion || 0)}
              </View>
              <TouchableOpacity 
                onPress={() => handleViewResenas(empleado)}
                style={styles.viewReviewsButton}
              >
                <Text style={styles.viewReviewsText}>Ver reseñas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {empleados.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {loading ? 'Cargando profesionales...' : 'No hay profesionales disponibles para este servicio'}
          </Text>
        </View>
      ) : (
        <View>
          {empleados.map(renderEmployeeItem)}
        </View>
      )}

      {selectedEmpleadoForResenas && (
        <ResenasModal
          visible={showResenasModal}
          onClose={() => setShowResenasModal(false)}
          empleadoId={selectedEmpleadoForResenas.id}
          empleadoNombre={`${selectedEmpleadoForResenas.nombres} ${selectedEmpleadoForResenas.apellidos}`}
          resenas={[]}
          loading={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedEmployeeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  employeeInitials: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  employeeSpecialty: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  viewReviewsButton: {
    marginLeft: 10,
  },
  viewReviewsText: {
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    minHeight: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default EmployeeList;
