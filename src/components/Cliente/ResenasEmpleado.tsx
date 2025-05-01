// src/components/Cliente/ResenasEmpleado.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useValoracionesEmpleado } from '../../hooks/useValoraciones';
import { ValoracionEstrellas } from './ValoracionEstrellas';
import { ValoracionDetallada } from '../../types/valoraciones.types';

interface ResenasEmpleadoProps {
  empleadoId: number;
  servicioId?: number;
  limit?: number;
  showHeader?: boolean;
  onViewAll?: () => void;
}

const ResenasEmpleado: React.FC<ResenasEmpleadoProps> = ({
  empleadoId,
  servicioId,
  limit = 3,
  showHeader = true,
  onViewAll
}) => {
  const { valoraciones, loading, promedio, total } = useValoracionesEmpleado(empleadoId, servicioId);

  // Renderizar cada reseña
  const renderResena = ({ item }: { item: ValoracionDetallada }) => {
    // Determinar las iniciales del cliente para el avatar
    let iniciales = 'CL';
    if (item.clienteNombre && item.clienteNombre !== 'undefined undefined') {
      const nombreParts = item.clienteNombre.split(' ');
      if (nombreParts.length > 0 && nombreParts[0]) {
        iniciales = nombreParts[0].substring(0, 1).toUpperCase();
        if (nombreParts.length > 1 && nombreParts[1]) {
          iniciales += nombreParts[1].substring(0, 1).toUpperCase();
        }
      }
    }
    
    // Determinar el nombre a mostrar
    let nombreMostrar = 'Cliente';
    if (item.clienteNombre && item.clienteNombre !== 'undefined undefined') {
      nombreMostrar = item.clienteNombre;
    }
    
    return (
      <View style={styles.resenaContainer}>
        <View style={styles.resenaHeader}>
          <View style={styles.clienteInfo}>
            {item.clienteImagen ? (
              <Image source={{ uri: item.clienteImagen }} style={styles.clienteImagen} />
            ) : (
              <View style={styles.clienteImagenPlaceholder}>
                <Text style={styles.clienteImagenPlaceholderText}>
                  {iniciales}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.clienteNombre}>{nombreMostrar}</Text>
              <Text style={styles.resenaFecha}>{item.fecha}</Text>
            </View>
          </View>
          <ValoracionEstrellas valoracion={item.valoracion} tamano={16} />
        </View>
        
        {item.servicioNombre && (
          <View style={styles.servicioContainer}>
            <Text style={styles.servicioLabel}>Servicio:</Text>
            <Text style={styles.servicioNombre}>{item.servicioNombre}</Text>
          </View>
        )}
        
        {item.comentario && (
          <Text style={styles.comentario}>{item.comentario}</Text>
        )}
      </View>
    );
  };

  // Renderizar el encabezado con el promedio
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <View style={styles.headerContainer}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingNumber}>{promedio.toFixed(1)}</Text>
          <ValoracionEstrellas valoracion={promedio} tamano={20} />
          <Text style={styles.totalResenas}>({total} reseñas)</Text>
        </View>
        
        {onViewAll && total > 0 && (
          <TouchableOpacity onPress={onViewAll} style={styles.verTodasButton}>
            <Text style={styles.verTodasText}>Ver todas</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Renderizar cuando no hay reseñas
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={48} color={colors.gray} />
      <Text style={styles.emptyText}>No hay reseñas disponibles</Text>
    </View>
  );

  // Renderizar el componente principal
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando reseñas...</Text>
        </View>
      ) : (
        <>
          {renderHeader()}
          
          <FlatList
            data={valoraciones.slice(0, limit)}
            renderItem={renderResena}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={valoraciones.length === 0 ? { flex: 1 } : null}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
    color: colors.text,
  },
  totalResenas: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 5,
  },
  verTodasButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verTodasText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  resenaContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  resenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clienteImagen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  clienteImagenPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clienteImagenPlaceholderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clienteNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  resenaFecha: {
    fontSize: 12,
    color: colors.gray,
  },
  servicioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  servicioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginRight: 5,
  },
  servicioNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    fontStyle: 'italic',
  },
  comentario: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default ResenasEmpleado;
