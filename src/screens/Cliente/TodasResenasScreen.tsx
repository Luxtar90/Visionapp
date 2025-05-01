// src/screens/Cliente/TodasResenasScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useValoracionesEmpleado } from '../../hooks/useValoraciones';
import { ValoracionEstrellas } from '../../components/Cliente/ValoracionEstrellas';
import { ValoracionDetallada } from '../../types/valoraciones.types';

interface RouteParams {
  empleadoId: number;
  empleadoNombre: string;
  servicioId?: number;
  servicioNombre?: string;
}

export default function TodasResenasScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Usar valores predeterminados si los parámetros no están definidos
  const params = route.params as RouteParams || {};
  const empleadoId = params?.empleadoId || 1;
  const empleadoNombre = params?.empleadoNombre || 'Profesional';
  const servicioId = params?.servicioId;
  const servicioNombre = params?.servicioNombre;

  // Usar nuestro hook personalizado para obtener las valoraciones
  const { valoraciones, loading, promedio, total, error } = useValoracionesEmpleado(
    empleadoId,
    servicioId
  );

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
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          Reseñas de {empleadoNombre}
          {servicioNombre ? ` - ${servicioNombre}` : ''}
        </Text>
      </View>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingNumber}>{promedio.toFixed(1)}</Text>
        <ValoracionEstrellas valoracion={promedio} tamano={24} />
        <Text style={styles.totalResenas}>({total} reseñas)</Text>
      </View>
      
      {servicioId && servicioNombre && (
        <View style={styles.servicioContainer}>
          <Text style={styles.servicioLabel}>Servicio:</Text>
          <Text style={styles.servicioNombre}>{servicioNombre}</Text>
        </View>
      )}
    </View>
  );

  // Renderizar cuando no hay reseñas
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color={colors.gray} />
      <Text style={styles.emptyText}>No hay reseñas disponibles para este profesional</Text>
      <TouchableOpacity
        style={styles.backButtonEmpty}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando reseñas...</Text>
        </View>
      ) : (
        <>
          {renderHeader()}
          
          <FlatList
            data={valoraciones}
            renderItem={renderResena}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={valoraciones.length === 0 ? styles.emptyListContainer : styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    color: colors.text,
  },
  totalResenas: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: 8,
  },
  servicioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicioLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray,
    marginRight: 8,
  },
  servicioNombre: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resenaContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clienteImagen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  clienteImagenPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clienteImagenPlaceholderText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  resenaFecha: {
    fontSize: 14,
    color: colors.gray,
  },
  comentario: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  backButtonEmpty: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
