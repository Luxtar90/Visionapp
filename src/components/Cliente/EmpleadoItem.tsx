// src/components/Cliente/EmpleadoItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface Empleado {
  id: number;
  nombres: string;
  apellidos: string;
  cargo: string;
  dias_para_reservas: string;
  tiendaId: number;
  calificacion?: number;
  numResenas?: number;
  foto?: string;
  especialidad?: string;
}

interface EmpleadoItemProps {
  empleado: Empleado;
  selected: boolean;
  onSelect: (empleadoId: number) => void;
  onVerResenas?: (empleadoId: number) => void;
}

const EmpleadoItem: React.FC<EmpleadoItemProps> = ({ 
  empleado, 
  selected, 
  onSelect,
  onVerResenas 
}) => {
  // Renderizar estrellas para la calificación
  const renderEstrellas = (calificacion: number = 0) => {
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

  return (
    <TouchableOpacity
      style={[styles.empleadoItem, selected && styles.empleadoSeleccionado]}
      onPress={() => onSelect(empleado.id)}
    >
      <View style={styles.empleadoFotoContainer}>
        {empleado.foto ? (
          <Image source={{ uri: empleado.foto }} style={styles.empleadoFoto} />
        ) : (
          <View style={styles.empleadoFotoPlaceholder}>
            <Ionicons name="person" size={30} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.empleadoInfo}>
        <Text style={styles.empleadoNombre}>
          {empleado.nombres} {empleado.apellidos}
        </Text>
        
        <Text style={styles.empleadoCargo}>
          {empleado.cargo || empleado.especialidad || 'Profesional'}
        </Text>
        
        {(empleado.calificacion !== undefined && empleado.calificacion > 0) && (
          <View style={styles.calificacionContainer}>
            <View style={styles.estrellas}>
              {renderEstrellas(empleado.calificacion)}
            </View>
            
            <Text style={styles.numResenas}>
              ({empleado.numResenas || 0})
            </Text>
            
            {onVerResenas && (
              <TouchableOpacity
                style={styles.verResenasButton}
                onPress={() => onVerResenas(empleado.id)}
              >
                <Text style={styles.verResenasText}>Ver reseñas</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {selected && (
        <View style={styles.checkContainer}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  empleadoItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  empleadoSeleccionado: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  empleadoFotoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 12,
  },
  empleadoFoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  empleadoFotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  empleadoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  empleadoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  empleadoCargo: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  calificacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estrellas: {
    flexDirection: 'row',
    marginRight: 4,
  },
  numResenas: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 8,
  },
  verResenasButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verResenasText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  checkContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default EmpleadoItem;
